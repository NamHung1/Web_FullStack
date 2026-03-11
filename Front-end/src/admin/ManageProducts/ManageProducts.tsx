import { Table, Button, message } from 'antd';
import styles from './ManageProducts.module.css';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      message.success('Product deleted');
    } catch (error) {
      message.error('Failed to delete product');
    }
  };
  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
    },

    {
      title: 'Price',
      dataIndex: 'price',
      render: (price: number) => `$${price}`,
    },

    {
      title: 'Stock',
      dataIndex: 'stock',
    },

    {
      title: 'Action',
      render: (record: Product) => (
        <div className={styles.actions}>
          <Button type="primary">Edit</Button>
          <Button danger onClick={() => deleteProduct(record._id)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manage Products</h1>

        <Button type="primary">Add Product</Button>
      </div>

      <Table dataSource={products} columns={columns} rowKey="_id" loading={loading} />
    </div>
  );
}
