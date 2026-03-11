import type { Product } from "../../types/product"

import ProductCard from "../ProductCard/ProductCard"
import { Spin } from "antd"

import styles from "./ProductList.module.css"

interface Props {
  products: Product[]
  loading?: boolean
}

export default function ProductList({ products, loading = false }: Props) {
  if (loading) {
    return <Spin size="large" />
  }

  return (

    <div className={styles.grid}>

      {products.map((p) => (

        <ProductCard
          key={p._id}
          product={p}
        />

      ))}

    </div>

  )
}