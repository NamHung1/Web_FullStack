import { Card, Button } from "antd"

import type { Product } from "../../types/product"

import styles from "./ProductCard.module.css"

import { useCart } from "../../hooks/useCart"

interface Props {

  product: Product

}

export default function ProductCard({ product }: Props) {

  const { addToCart } = useCart()

  return (

    <Card

      hoverable

      className={styles.card}

      cover={
        <img
          src={product.images?.[0] || "https://via.placeholder.com/200"}
        />
      }

    >

      <h3>{product.name}</h3>

      <p>${product.price}</p>

      <Button
        type="primary"
        onClick={() => addToCart(product)}
      >

        Add to cart

      </Button>

    </Card>

  )
}