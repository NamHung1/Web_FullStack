import api from "./axios";

export interface Category {
  _id: string;
  name: string;
}

export const getCategoriesAPI = async () => {
  const res = await api.get('/categories');
  return res.data as Category[];
};

export const createCategoryAPI = async (name: string) => {
  const res = await api.post('/categories', { name });
  return res.data as Category;
};

export const updateCategoryAPI = async (id: string, name: string) => {
  const res = await api.patch(`/categories/${id}`, { name });
  return res.data as Category;
};

export const deleteCategoryAPI = async (id: string) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};
