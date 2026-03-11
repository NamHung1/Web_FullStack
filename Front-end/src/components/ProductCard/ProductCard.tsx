import { Card, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';
import { useCart } from '../../hooks/useCart';
import { addToCartAPI } from '../../api/cart.api';

import type { Product } from '../../types/product';

import styles from './ProductCard.module.css';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart, incrementCount } = useCart();
  const navigate = useNavigate();

  const handleNavigateToDetail = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = async (event: MouseEvent<HTMLElement>) => {
    event?.stopPropagation();

    try {
      await addToCartAPI(product._id, 1);
      addToCart(product);
      incrementCount(1);
      message.success('Added to cart');
    } catch {
      message.error('Failed to add to cart. Please login first.');
    }
  };

  return (
    <Card
      hoverable
      className={styles.card}
      onClick={handleNavigateToDetail}
      cover={
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/200'}
          alt={product.name}
        />
      }
    >
      <h3>{product.name}</h3>

      <p>${product.price}</p>

      <Button type="primary" onClick={handleAddToCart}>
        Add to cart
      </Button>
    </Card>
  );
}
