import api from './axios';

interface AddReviewPayload {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string;
}

export const addReviewAPI = async (data: AddReviewPayload) => {
  try {
    const res = await api.post(`/orders/${data.orderId}/reviews`, {
      productId: data.productId,
      rating: data.rating,
      comment: data.comment,
    });
    return res.data;
  } catch {
    const res = await api.post('/reviews', data);
    return res.data;
  }
};

export const getProductReviewsAPI = async (productId: string) => {
  const res = await api.get(`/reviews/product/${productId}`);
  return res.data;
};