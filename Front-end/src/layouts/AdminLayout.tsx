import { Layout, Menu, Button, Typography } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const { Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout>
      <Sider>
        <Title className={styles.title}>Admin</Title>
        <Menu theme="dark">
          <Menu.Item key="1">
            <Link to="/admin/dashboard">Dashboard</Link>
          </Menu.Item>

          <Menu.Item key="2">
            <Link to="/admin/users">Users</Link>
          </Menu.Item>

          <Menu.Item key="3">
            <Link to="/admin/products">Products</Link>
          </Menu.Item>

          <Menu.Item key="4">
            <Link to="/admin/orders">Orders</Link>
          </Menu.Item>

          <Menu.Item key="5">
            <Link to="/admin/categories">Categories</Link>
          </Menu.Item>

          <Menu.Item key="6">
            <Button onClick={handleLogout} className={styles.logout}>Logout</Button>
          </Menu.Item>
        </Menu>
      </Sider>

      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AdminLayout;