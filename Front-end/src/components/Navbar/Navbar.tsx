import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Avatar } from 'antd';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

import styles from './Navbar.module.css';

import api from '../../api/axios';

export default function Navbar() {
  const { cartCount, refreshCartCount } = useCart();
  const { user, token, setAuth, logout } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      return;
    }

    if (user) {
      return;
    }
    let cancelled = false;

    api
      .get('/auth/me')
      .then((res) => {
        if (cancelled) {
          return;
        }

        setAuth(res.data, token);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        logout();
      });

    return () => {
      cancelled = true;
    };
  }, [token, user, setAuth, logout, refreshCartCount]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        BÁCH HÓA CÔNG NGHỆ
      </Link>

      <div className={styles.links}>

        {user && <Link to="/orders">Orders</Link>}

        {user && (
          <Link to="/cart">
            <Badge count={cartCount} offset={[5, 0]}>
              <ShoppingCartOutlined className={styles.cartIcon} />
            </Badge>
          </Link>
        )}

        {!user ? (
          <Button type="primary" onClick={() => navigate('/login')}>
            Login
          </Button>
        ) : (
          <div className={styles.userBox}>
            <Avatar icon={<UserOutlined />} />

            <span>{user.name}</span>

            <Button danger size="small" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
