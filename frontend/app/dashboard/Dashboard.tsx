"use client";

import AdminShell from "@/src/components/admin/AdminShell";

export default function Dashboard() {
  return (
    <AdminShell
      title="Panel de administración"
      subtitle="Gestioná módulos desde el menú lateral."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="app-panel p-4">
          <h3 className="app-title text-lg">Gestión de categorías</h3>
          <p className="app-subtitle mt-2">Creá, editá, visualizá y borrá categorías.</p>
        </div>

        <div className="app-panel p-4">
          <h3 className="app-title text-lg">Gestión de subcategorías</h3>
          <p className="app-subtitle mt-2">Administrá las subcategorías por categoría.</p>
        </div>
      </div>
    </AdminShell>
  );
}
