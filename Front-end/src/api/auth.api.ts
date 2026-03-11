import api from "./axios"

export const loginAPI = async (email: string, password: string) => {

  const res = await api.post("/auth/login", { email, password })

  return res.data

}

export const registerAPI = async (

  name: string,
  email: string,
  password: string

) => {

  const res = await api.post("/auth/register", {

    name,
    email,
    password

  })

  return res.data

}