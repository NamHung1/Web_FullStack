import api from './axios';

interface AddReviewPayload {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string;
}

export const addReviewAPI = async ({ orderId, ...payload }: AddReviewPayload) => {
  const res = await api.post(`/orders/${orderId}/reviews`, payload);
  return res.data;
};

export const getProductReviewsAPI = async (productId: string) => {
  const res = await api.get(`/reviews/product/${productId}`);
  return res.data;
};

export const getAllReviewsAPI = async () => {
  const res = await api.get('/reviews');
  return res.data;
};