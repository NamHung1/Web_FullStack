import { Table, Button, message, Modal, Form, Input, InputNumber } from 'antd';
import styles from './ManageProducts.module.css';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
}

interface ProductFormValues {
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
}

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm<ProductFormValues>();

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

  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      image: product.images?.[0],
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      message.success('Product deleted');
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const saveProduct = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        price: values.price,
        stock: values.stock,
        description: values.description,
        images: values.image ? [values.image] : [],
      };

      if (editingProduct) {
        const res = await api.patch(`/products/${editingProduct._id}`, payload);
        setProducts((prev) =>
          prev.map((product) =>
            product._id === editingProduct._id ? res.data : product,
          ),
        );
        message.success('Product updated');
      } else {
        const res = await api.post('/products', payload);
        setProducts((prev) => [res.data, ...prev]);
        message.success('Product created');
      }

      closeModal();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        `Failed to ${editingProduct ? 'update' : 'create'} product`;
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
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
          <Button type="primary" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Button danger onClick={() => deleteProduct(record._id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manage Products</h1>

        <Button type="primary" onClick={openCreateModal}>
          Add Product
        </Button>
      </div>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={open}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText={editingProduct ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" onFinish={saveProduct}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter product price' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Stock"
            rules={[{ required: true, message: 'Please enter stock quantity' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="image" label="Image URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
