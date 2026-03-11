import api from './axios';

export const getProductsAPI = async (categoryId?: string) => {
  const query = categoryId ? `?category=${categoryId}` : '';
  const res = await api.get(`/products${query}`);

  return res.data;
};

export const searchProductsAPI = async (
  search: string,
  categoryId?: string,
) => {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set('search', search);
  }
  if (categoryId) {
    params.set('category', categoryId);
  }

  const query = params.toString();
  const res = await api.get(`/products${query ? `?${query}` : ''}`);

  return res.data;
};

export const getProductAPI = async (id: string) => {
  const res = await api.get(`/products/${id}`);

  return res.data;
};
