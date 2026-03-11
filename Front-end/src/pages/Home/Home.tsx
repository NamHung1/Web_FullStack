import { useState, useEffect } from "react"
import ProductList from "../../components/ProductList/ProductList"
import SearchBar from "../../components/SearchBar/SearchBar"
import { getProductsAPI, searchProductsAPI } from "../../api/product.api"
import { message } from "antd"
import styles from "./Home.module.css"

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await getProductsAPI()
      setProducts(data)
    } catch (error) {
      message.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (value: string) => {
    setLoading(true)
    try {
      const data = await searchProductsAPI(value)
      setProducts(data)
    } catch (error) {
      message.error("Search failed")
    } finally {
      setLoading(false)
    }
  }

  return (

    <div className={styles.container}>

      <SearchBar onSearch={handleSearch} />

      <ProductList products={products} loading={loading} />

    </div>

  )
}