import { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Popconfirm, Table } from 'antd';
import {
  createCategoryAPI,
  deleteCategoryAPI,
  getCategoriesAPI,
  type Category,
  updateCategoryAPI,
} from '../../api/category.api';
import styles from './ManageCategories.module.css';

interface CategoryFormValues {
  name: string;
}

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm<CategoryFormValues>();

  const fetchCategories = async () => {
    try {
      const data = await getCategoriesAPI();
      setCategories(data);
    } catch {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({ name: category.name });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleSave = async (values: CategoryFormValues) => {
    setSubmitting(true);

    try {
      if (editingCategory) {
        const updated = await updateCategoryAPI(editingCategory._id, values.name);
        setCategories((prev) =>
          prev.map((item) => (item._id === editingCategory._id ? updated : item)),
        );
        message.success('Category updated');
      } else {
        const created = await createCategoryAPI(values.name);
        setCategories((prev) => [...prev, created]);
        message.success('Category created');
      }

      closeModal();
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        `Failed to ${editingCategory ? 'update' : 'create'} category`;
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategoryAPI(id);
      setCategories((prev) => prev.filter((item) => item._id !== id));
      message.success('Category deleted');
    } catch {
      message.error('Failed to delete category');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Categories</h1>
        <Button type="primary" onClick={openCreateModal} className={styles.cate_create}>
          Add Category
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={categories}
        loading={loading}
        className={styles.table}
        scroll={{ x: 700 }}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        columns={[
          {
            title: 'Category name',
            dataIndex: 'name',
          },
          {
            title: 'Action',
            render: (record: Category) => (
              <div className={styles.actions}>
                <Button type="primary" onClick={() => openEditModal(record)} className={styles.cate_edit}>
                  Edit
                </Button>
                <Popconfirm
                  title="Delete category"
                  description="Are you sure to delete this category?"
                  onConfirm={() => handleDelete(record._id)}
                >
                  <Button danger className={styles.cate_delete}>Delete</Button>
                </Popconfirm>
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={open}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText={editingCategory ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Category name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}