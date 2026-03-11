import { Form, Input, Button, Card } from 'antd';
import styles from './Checkout.module.css';

export default function Checkout() {
  const onFinish = (values: any) => {
    console.log(values);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h2>Checkout</h2>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Address" name="address">
            <Input />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Place Order
          </Button>
        </Form>
      </Card>
    </div>
  );
}
