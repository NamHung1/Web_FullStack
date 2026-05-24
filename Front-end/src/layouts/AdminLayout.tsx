import { useCallback, useEffect, useState } from 'react';
import { Layout, Menu, Button, Typography, Badge, message } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { chatApi } from '../api/chat.api';
import { useChatEvents } from '../hooks/useChatEvents';
import styles from './AdminLayout.module.css';

const { Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [chatUnread, setChatUnread] = useState(0);

  const loadUnread = useCallback(async () => {
    const data = await chatApi.getUnreadCount();
    setChatUnread(data.unreadCount);
  }, []);

  useChatEvents(
    useCallback(() => {
      loadUnread();
      message.info('Admin: There is a new message from user');
    }, [loadUnread])
  );

  useEffect(() => {
    let ignore = false;

    const fetchUnread = async () => {
      const data = await chatApi.getUnreadCount();

      if (!ignore) {
        setChatUnread(data.unreadCount);
      }
    };

    void fetchUnread();

    return () => {
      ignore = true;
    };
  }, []);

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

          <Menu.Item key="chat">
            <Link to="/admin/chat">
              <Badge count={chatUnread} size="small" offset={[8, 0]}>
                <span className={styles.menuText}>Chat</span>
              </Badge>
            </Link>
          </Menu.Item>

          <Menu.Item key="logout">
            <Button danger onClick={handleLogout} className={styles.btnLogout}>
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
