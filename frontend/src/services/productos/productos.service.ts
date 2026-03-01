import apiClient from "../apiClient";
import type {
    Product,
    ProductCreateUpdatePayload,
    ProductDeleteResponse,
    ProductFilters,
    PaginatedProductsResponse,
} from "@/types/products";
import { parseApiError } from "../apiClient";

const buildProductFiltersQueryParams = (params: {
    filters?: ProductFilters;
    page?: number;
    pageSize?: number;
}) => {
    const searchParams = new URLSearchParams();

    if (params.page && params.page > 0) {
        searchParams.set("page", String(params.page));
    }

    if (params.pageSize && params.pageSize > 0) {
        searchParams.set("pageSize", String(params.pageSize));
    }

    const filters = params.filters;
    if (!filters) {
        return searchParams;
    }

    if (filters.nombre?.trim()) {
        searchParams.set("name", filters.nombre.trim());
    }

    if (filters.id_categoria && filters.id_categoria > 0) {
        searchParams.set("id_categoria", String(filters.id_categoria));
    }

    if (filters.id_subcategoria && filters.id_subcategoria > 0) {
        searchParams.set("id_subcategoria", String(filters.id_subcategoria));
    }

    if (typeof filters.precio_min === "number") {
        searchParams.set("precio_min", String(filters.precio_min));
    }

    if (typeof filters.precio_max === "number") {
        searchParams.set("precio_max", String(filters.precio_max));
    }

    return searchParams;
};

const getAllProducts = async (page = 1): Promise<PaginatedProductsResponse> => {
    try {
        const { data } = await apiClient.get<PaginatedProductsResponse>("/productos", {
            params: { page },
        });
        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudieron obtener los productos",
            prefix: "Productos",
        });
    }
}

const findByFilters = async (filters: ProductFilters, page = 1): Promise<PaginatedProductsResponse> => {
    try {
        const params = buildProductFiltersQueryParams({ filters, page });
        const { data } = await apiClient.get<PaginatedProductsResponse>("/productos/filters", {
            params,
        });
        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudieron filtrar los productos",
            prefix: "Productos",
        });
    }
}

const getProductById = async (id: number): Promise<Product> => {
    try {
        const { data } = await apiClient.get<Product>(`/productos/${id}`);
        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudo obtener el producto",
            prefix: "Productos",
        });
    }
}

const getAllProductsForAdmin = async (page = 1, pageSize = 10): Promise<PaginatedProductsResponse> => {
    try {
        const { data } = await apiClient.get<PaginatedProductsResponse>("/productos/admin/all", {
            params: { page, pageSize },
        });
        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudieron obtener los productos para administración",
            prefix: "Productos",
        });
    }
}

const findByFiltersForAdmin = async (
    filters: ProductFilters,
    page = 1,
    pageSize = 10,
): Promise<PaginatedProductsResponse> => {
    try {
        const params = buildProductFiltersQueryParams({ filters, page, pageSize });
        const { data } = await apiClient.get<PaginatedProductsResponse>("/productos/admin/filters", {
            params,
        });
        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudieron filtrar los productos para administración",
            prefix: "Productos",
        });
    }
}

const createProduct = async (payload: ProductCreateUpdatePayload, files: File[]): Promise<Product> => {
    try {
        const formData = new FormData();
        formData.append("producto", JSON.stringify(payload));
        files.forEach((file) => formData.append("file", file));

        const { data } = await apiClient.post<Product>("/productos", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudo crear el producto",
            prefix: "Productos",
        });
    }
}

const updateProduct = async (id: number, payload: ProductCreateUpdatePayload, files: File[]): Promise<Product> => {
    try {
        const formData = new FormData();
        formData.append("producto", JSON.stringify(payload));
        files.forEach((file) => formData.append("file", file));

        const { data } = await apiClient.put<Product>(`/productos/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudo actualizar el producto",
            prefix: "Productos",
        });
    }
}

const toggleProduct = async (id: number): Promise<Product> => {
    try {
        const { data } = await apiClient.put<Product>(`/productos/toggle/${id}`);
        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudo activar/desactivar el producto",
            prefix: "Productos",
        });
    }
}

const deleteProduct = async (id: number): Promise<ProductDeleteResponse> => {
    try {
        const { data } = await apiClient.delete<ProductDeleteResponse>(`/productos/${id}`);
        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudo borrar el producto",
            prefix: "Productos",
        });
    }
}

export const productosService = {
    getAllProducts,
    findByFilters,
    getProductById,
    getAllProductsForAdmin,
    findByFiltersForAdmin,
    createProduct,
    updateProduct,
    toggleProduct,
    deleteProduct,
}



