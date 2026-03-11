import { Layout, Menu } from "antd";
import { Link, Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const { Sider, Content } = Layout;

const AdminLayout = () => {
  return (
    <Layout>
      <Sider>
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
        </Menu>
      </Sider>

      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AdminLayout;