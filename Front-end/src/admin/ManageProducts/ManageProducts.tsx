import {
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd';
import styles from './ManageProducts.module.css';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  category?: string | Category;
}

interface ProductFormValues {
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  category?: string;
}

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm<ProductFormValues>();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {
      message.warning('Failed to load categories');
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
      category:
        typeof product.category === 'object'
          ? product.category?._id
          : product.category,
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
    } catch {
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
        category: values.category,
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
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
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
      title: 'Category',
      render: (record: Product) =>
        typeof record.category === 'object'
          ? record.category?.name
          : categories.find((c) => c._id === record.category)?.name || '-',
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
          <Button type="primary" onClick={() => openEditModal(record)} className={styles.productEdit}>
            Edit
          </Button>
          <Button danger onClick={() => deleteProduct(record._id)} className={styles.productDelete}>
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

        <Button type="primary" onClick={openCreateModal} className={styles.productCreate}>
          Add Product
        </Button>
      </div>

      <Table
        className={styles.table}
        dataSource={products}
        columns={columns}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 850 }}
        pagination={{ pageSize: 8, showSizeChanger: false }}
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
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select
              placeholder="Select category"
              options={categories.map((category) => ({
                value: category._id,
                label: category.name,
              }))}
            />
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
