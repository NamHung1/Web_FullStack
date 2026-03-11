import api from "./axios"

export const getOrdersAPI = async () => {
  const res = await api.get("/orders")
  return res.data
}

export const createOrderAPI = async (data: any) => {

  const res = await api.post("/orders", data)

  return res.data
}

export const cancelOrderAPI = async (id: string, reason: string) => {

  const res = await api.patch(`/orders/${id}/cancel`, {

    reason

  })

  return res.data
}