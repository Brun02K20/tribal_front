"use client";

import ProtectedRoute from "@/shared/providers/ProtectedRoute";
import AccountConfigForm from "@/features/account/components/AccountConfigForm";
import { useAccountConfig } from "@/features/account/hooks/useAccountConfig";

export default function AccountConfigPage() {
  const model = useAccountConfig();

  return (
    <ProtectedRoute>
      <main className="app-page">
        <section className="app-container mx-auto max-w-5xl">
          <header className="mb-6">
            <h1 className="app-title text-2xl">Configuración de cuenta</h1>
            <p className="app-subtitle mt-2">
              Gestioná tus datos personales, contraseña de plataforma y direcciones.
            </p>
          </header>

          {!model.canEdit ? (
            <div className="app-panel p-4">
              <p className="app-subtitle">Este módulo está disponible para cuentas cliente.</p>
            </div>
          ) : (
            <AccountConfigForm model={model} />
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}

