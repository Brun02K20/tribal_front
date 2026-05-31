import apiClient, { parseApiError } from '@/shared/api/apiClient';
import type { BlogListItem, BlogDetail, BlogFormValues } from '@/types/blogs';

const getAll = async (): Promise<BlogListItem[]> => {
    try {
        const { data } = await apiClient.get<BlogListItem[]>('/blogs');
        return data;
    } catch (error) {
        throw parseApiError(error, { fallbackMessage: 'No se pudieron cargar los artículos', prefix: 'Blog' });
    }
};

const getById = async (id: number): Promise<BlogDetail> => {
    try {
        const { data } = await apiClient.get<BlogDetail>(`/blogs/${id}`);
        return data;
    } catch (error) {
        throw parseApiError(error, { fallbackMessage: 'No se pudo cargar el artículo', prefix: 'Blog' });
    }
};

const getAllForAdmin = async (): Promise<BlogListItem[]> => {
    try {
        const { data } = await apiClient.get<BlogListItem[]>('/blogs/admin/all');
        return data;
    } catch (error) {
        throw parseApiError(error, { fallbackMessage: 'No se pudieron cargar los artículos', prefix: 'Blog' });
    }
};

const create = async (values: BlogFormValues, files: File[]): Promise<BlogDetail> => {
    const formData = new FormData();
    formData.append('blog', JSON.stringify(values));
    files.forEach(file => formData.append('file', file));

    try {
        const { data } = await apiClient.post<BlogDetail>('/blogs', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    } catch (error) {
        throw parseApiError(error, { fallbackMessage: 'No se pudo crear el artículo', prefix: 'Blog' });
    }
};

const update = async (id: number, values: BlogFormValues, files?: File[]): Promise<BlogDetail> => {
    const formData = new FormData();
    formData.append('blog', JSON.stringify(values));
    if (files) files.forEach(file => formData.append('file', file));

    try {
        const { data } = await apiClient.put<BlogDetail>(`/blogs/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    } catch (error) {
        throw parseApiError(error, { fallbackMessage: 'No se pudo actualizar el artículo', prefix: 'Blog' });
    }
};

const toggle = async (id: number): Promise<BlogDetail> => {
    try {
        const { data } = await apiClient.put<BlogDetail>(`/blogs/toggle/${id}`);
        return data;
    } catch (error) {
        throw parseApiError(error, { fallbackMessage: 'No se pudo cambiar el estado', prefix: 'Blog' });
    }
};

const deleteBlog = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/blogs/${id}`);
    } catch (error) {
        throw parseApiError(error, { fallbackMessage: 'No se pudo eliminar el artículo', prefix: 'Blog' });
    }
};

export const blogsService = { getAll, getById, getAllForAdmin, create, update, toggle, delete: deleteBlog };