"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resenasService } from '@/entities/resenas/api/resenas.service';
import { useAuth } from '@/shared/providers/AuthContext';
import type { ResenasProductoResponse } from '@/types/resenas';

type UseProductResenasResult = {
  data: ResenasProductoResponse | null;
  loading: boolean;
  submitting: boolean;
  error: string;
  selectedRating: number;
  canReview: boolean;
  alreadyReviewed: boolean;
  setSelectedRating: (rating: number) => void;
  submitRating: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useProductResenas(productId: number): UseProductResenasResult {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [data, setData] = useState<ResenasProductoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await resenasService.getByProducto(productId);
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las reseñas';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!Number.isFinite(productId) || productId < 1) {
      setError('ID de producto inválido');
      setLoading(false);
      return;
    }

    void refresh();
  }, [productId, refresh]);

  const alreadyReviewed = useMemo(() => {
    if (!data || !user?.id) {
      return false;
    }

    return data.resenas.some((resena) => resena.id_usuario === user.id);
  }, [data, user?.id]);

  const canReview = isAuthenticated && user?.id_rol === 2 && !alreadyReviewed;

  const submitRating = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await resenasService.create(productId, {
        calificacion: selectedRating,
      });
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo enviar tu calificación';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [authLoading, isAuthenticated, productId, router, selectedRating]);

  return {
    data,
    loading,
    submitting,
    error,
    selectedRating,
    canReview,
    alreadyReviewed,
    setSelectedRating,
    submitRating,
    refresh,
  };
}
