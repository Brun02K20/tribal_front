import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Tribal Front</h1>
      <p className="text-center text-sm text-zinc-600">Elegí una opción para continuar</p>
      <div className="flex w-full flex-col gap-3">
        <Link href="/login" className="rounded-md bg-black px-4 py-2 text-center text-white">
          Ir a Login
        </Link>
        <Link href="/register" className="rounded-md border px-4 py-2 text-center">
          Ir a Registro
        </Link>
      </div>
    </main>
  );
}
