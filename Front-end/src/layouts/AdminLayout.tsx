import { Layout, Menu, Button, Typography } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const { Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const selectedKey = location.pathname.split('/')[2] || 'dashboard';

  return (
    <Layout className={styles.layout}>
      <Sider breakpoint="lg" collapsedWidth={0} className={styles.sider}>
        <Title level={3} className={styles.brand}>
          Admin
        </Title>

        <Menu theme="dark" selectedKeys={[selectedKey]} className={styles.menu}>
          <Menu.Item key="dashboard">
            <Link to="/admin/dashboard">Dashboard</Link>
          </Menu.Item>

          <Menu.Item key="users">
            <Link to="/admin/users">Users</Link>
          </Menu.Item>

          <Menu.Item key="products">
            <Link to="/admin/products">Products</Link>
          </Menu.Item>

          <Menu.Item key="orders">
            <Link to="/admin/orders">Orders</Link>
          </Menu.Item>

          <Menu.Item key="categories">
            <Link to="/admin/categories">Categories</Link>
          </Menu.Item>

          <Menu.Item key="logout">
            <Button danger onClick={handleLogout} className={styles.btn_logout}>
              Logout
            </Button>
          </Menu.Item>
        </Menu>
      </Sider>

      <Content className={styles.content}>
        <div className={styles.panel}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default AdminLayout;
