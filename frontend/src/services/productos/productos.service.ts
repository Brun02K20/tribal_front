import apiClient from "../apiClient";
import type {
    Product,
    ProductCreateUpdatePayload,
    ProductDeleteResponse,
} from "@/types/products";
import { parseApiError } from "../apiClient";


const getAllProducts = async (): Promise<Product[]> => {
    try {
        const { data } = await apiClient.get<Product[]>("/productos");
        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudieron obtener los productos",
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

const getAllProductsForAdmin = async (): Promise<Product[]> => {
    try {
        const { data } = await apiClient.get<Product[]>("/productos/admin/all");
        return data;
    } catch (error) {
        throw parseApiError(error, {
            fallbackMessage: "No se pudieron obtener los productos para administración",
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
    getProductById,
    getAllProductsForAdmin,
    createProduct,
    updateProduct,
    toggleProduct,
    deleteProduct,
}



