import type { CategoriaWithSubcategorias } from "./categorias";
import type { Product, ProductFormValues } from "./products";
import type { ReactNode } from "react";
import type { Subcategoria } from "./subcategorias";

export type CrudModalMode = "create" | "edit" | "view";

export type FieldOption = {
  label: string;
  value: string | number;
};

export type CrudFormField = {
  name: string;
  label: string;
  type?: "text" | "number" | "select";
  placeholder?: string;
  options?: FieldOption[];
  required?: string;
};

export type CrudFormValues = Record<string, string | number>;

export type PedidoEstadoMode = "pedido" | "envio";

export type EstadoOption = {
  id: number;
  nombre: string;
};

export type EstadoModalFormValues = {
  id_estado: number;
};

export type ProductFormModalProps = {
  isOpen: boolean;
  mode: CrudModalMode;
  submitting: boolean;
  initialValues: ProductFormValues;
  selected: Product | null;
  categorias: CategoriaWithSubcategorias[];
  subcategorias: Subcategoria[];
  onClose: () => void;
  onSubmit: (values: ProductFormValues, files: File[]) => Promise<void>;
};

export type AdminOnlyProps = {
  children: ReactNode;
};

export type AdminShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export type ConfirmDeleteModalProps = {
  isOpen: boolean;
  entityLabel: string;
  entityName: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
};

export type CrudFormModalProps = {
  isOpen: boolean;
  mode: CrudModalMode;
  title: string;
  fields: CrudFormField[];
  initialValues: CrudFormValues;
  onClose: () => void;
  onSubmit: (values: CrudFormValues) => Promise<void> | void;
};

export type PedidoEstadoModalProps = {
  isOpen: boolean;
  mode: PedidoEstadoMode;
  currentEstadoId: number;
  options: EstadoOption[];
  loading?: boolean;
  onClose: () => void;
  onSave: (idEstado: number) => Promise<void>;
};

export type AdminTableProps = {
  headers: string[];
  loading: boolean;
  isEmpty: boolean;
  loadingText: string;
  emptyText: string;
  minWidthClassName?: string;
  children: ReactNode;
};

export type AdminCrudActionsProps = {
  submitting: boolean;
  isActive: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
};
