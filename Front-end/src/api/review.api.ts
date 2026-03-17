import api from './axios';

interface AddReviewPayload {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string;
}

export const addReviewAPI = async (data: AddReviewPayload) => {
  const res = await api.post('/reviews', data);
  return res.data;
};

export const getProductReviewsAPI = async (productId: string) => {
  const res = await api.get(`/reviews/product/${productId}`);
  return res.data;
};