import type { Product } from '../../types/product';

import ProductCard from '../ProductCard/ProductCard';
import { Spin, Empty } from 'antd';

import styles from './ProductList.module.css';

interface Props {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function ProductList({
  products,
  loading = false,
  emptyMessage = 'No products available',
}: Props) {
  if (loading) {
    return <Spin size="large" />;
  }

  if (!products.length) {
    return <Empty description={emptyMessage} />;
  }

  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
