import api from "./axios"

export const getProductsAPI = async () => {

  const res = await api.get("/products")

  return res.data
}

export const searchProductsAPI = async (search: string) => {

  const res = await api.get(`/products?search=${search}`)

  return res.data
}

export const getProductAPI = async (id: string) => {

  const res = await api.get(`/products/${id}`)

  return res.data
}