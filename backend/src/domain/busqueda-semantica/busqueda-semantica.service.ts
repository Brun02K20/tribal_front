import { Injectable, Logger } from '@nestjs/common';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const EMBED_MODEL = 'nomic-embed-text';
const SIMILARITY_THRESHOLD = 0.52;
const RATE_LIMIT = 30;       // max llamadas a Ollama por IP por ventana
const RATE_WINDOW_MS = 60_000; // ventana de 1 minuto

type RateBucket = { count: number; resetAt: number };

@Injectable()
export class BusquedaSemanticaService {
    private readonly logger = new Logger(BusquedaSemanticaService.name);
    private readonly rateBuckets = new Map<string, RateBucket>();

    private isRateLimited(ip: string): boolean {
        const now = Date.now();
        let bucket = this.rateBuckets.get(ip);

        if (!bucket || now >= bucket.resetAt) {
            bucket = { count: 0, resetAt: now + RATE_WINDOW_MS };
            this.rateBuckets.set(ip, bucket);
        }

        if (bucket.count >= RATE_LIMIT) return true;

        bucket.count++;
        return false;
    }

    private sanitizeQuery(text: string): string {
        return text.trim().slice(0, 200);
    }

    async generateEmbedding(text: string): Promise<number[] | null> {
        const sanitized = this.sanitizeQuery(text);
        if (!sanitized) return null;
        try {
            const response = await fetch(`${OLLAMA_URL}/api/embed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: EMBED_MODEL, input: sanitized }),
                signal: AbortSignal.timeout(10_000),
            });
            if (!response.ok) return null;
            const data = await response.json() as { embeddings?: number[][] };
            return data.embeddings?.[0] ?? null;
        } catch (err) {
            this.logger.warn(`Ollama no disponible: ${(err as Error).message}`);
            return null;
        }
    }

    cosineSimilarity(a: number[], b: number[]): number {
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        if (!magA || !magB) return 0;
        return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    // Filtra y ordena items por similitud semántica con la query.
    // Devuelve null si Ollama está caído o la IP superó el rate limit (señal para usar fallback LIKE).
    async rankBySimilarity<T extends { embedding: string | null }>(
        query: string,
        items: T[],
        clientIp?: string,
    ): Promise<T[] | null> {
        if (clientIp && this.isRateLimited(clientIp)) {
            this.logger.warn(`Rate limit alcanzado para IP ${clientIp}, usando fallback LIKE`);
            return null;
        }

        const queryVec = await this.generateEmbedding(this.sanitizeQuery(query));
        if (!queryVec) return null;

        const scored = items
            .flatMap((item) => {
                if (!item.embedding) return []; // sin embedding → excluir de búsqueda semántica
                try {
                    const vec = JSON.parse(item.embedding) as number[];
                    const score = this.cosineSimilarity(queryVec, vec);
                    return score >= SIMILARITY_THRESHOLD ? [{ item, score }] : [];
                } catch {
                    return [];
                }
            })
            .sort((a, b) => b.score - a.score);

        return scored.map((x) => x.item);
    }
}
