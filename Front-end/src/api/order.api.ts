import api from './axios';

interface CreateOrderPayload {
  address: string;
  phone: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'momo';
}

export const getOrdersAPI = async () => {
  const res = await api.get('/orders');
  return res.data;
};

export const createOrderAPI = async (data: CreateOrderPayload) => {
  const res = await api.post('/orders', data);

  return res.data;
};

export const cancelOrderAPI = async (id: string, reason: string) => {
  const res = await api.patch(`/orders/${id}/cancel`, {
    reason,
  });

  return res.data;
};

export const updateOrderStatusAPI = async (
  id: string,
  status: 'pending' | 'completed' | 'cancelled',
) => {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data;
};
