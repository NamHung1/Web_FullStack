import { Table, Tag } from 'antd';
import styles from './ManageOrders.module.css'

interface Order {
  _id: string;
  user: string;
  total: number;
  status: string;
}

const orders: Order[] = [
  { _id: '1', user: 'John', total: 120, status: 'pending' },

  { _id: '2', user: 'Anna', total: 400, status: 'completed' },
];

export default function ManageOrders() {
  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
    },

    {
      title: 'Total',
      dataIndex: 'total',
      render: (total: number) => `$${total}`,
    },

    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manage Orders</h1>

      <Table dataSource={orders} columns={columns} rowKey="_id" />
    </div>
  );
}
