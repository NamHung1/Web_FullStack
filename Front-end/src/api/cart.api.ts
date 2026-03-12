import api from './axios';

export const addToCartAPI = async (productId: string, quantity = 1) => {
  const res = await api.post('/cart', { productId, quantity });
  return res.data;
};

export const getCartAPI = async () => {
  const res = await api.get('/cart');
  return res.data;
};

export const removeFromCartAPI = async (productId: string) => {
  const res = await api.delete(`/cart/${productId}`);
  return res.data;
};

export const updateCartItemQuantityAPI = async (
  productId: string,
  quantity: number,
) => {
  const res = await api.patch(`/cart/${productId}`, { quantity });
  return res.data;
};
