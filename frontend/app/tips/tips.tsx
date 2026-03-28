import Image from "next/image";

export default function TipsContent() {
  return (
    <main className="app-page">
      <section className="app-container mx-auto max-w-360">
        <header className="app-panel mb-6">
          <h1 className="app-title text-3xl sm:text-4xl">Tips artesanales para comprar mejor</h1>
          <p className="app-subtitle mt-3 text-base sm:text-lg">
            Tenes dudas sobre que te conviene comprar? Aca te damos tips que te vienen como anillo
            al dedo para elegir mejor, como saber tu numero de anillo y otros datos utiles.
          </p>
        </header>

        <section className="app-panel">
          <details className="group rounded-lg border border-line bg-white/70 p-4">
            <summary className="cursor-pointer list-none text-lg font-semibold text-black">
              Como saber mi numero de anillo?
            </summary>

            <div className="mt-4 overflow-hidden rounded-md border border-line bg-cream/60 p-2">
              <Image
                src="/assets/medir_dedo.png"
                alt="Guia para medir el dedo y saber tu numero de anillo"
                width={1200}
                height={1200}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </details>
        </section>
      </section>
    </main>
  );
}
