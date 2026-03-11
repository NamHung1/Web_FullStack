import api from "./axios"

export interface Category {
  _id: string
  name: string
}

export const getCategoriesAPI = async () => {
  const res = await api.get("/categories")
  return res.data as Category[]
}