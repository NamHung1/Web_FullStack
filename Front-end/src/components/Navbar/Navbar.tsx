import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Avatar } from 'antd';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import styles from './Navbar.module.css';

import { useCart } from '../../hooks/useCart';
import api from '../../api/axios';

interface User {
  name: string;
  email: string;
}

export default function Navbar() {
  const { cartCount, refreshCartCount } = useCart();

  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data);
          refreshCartCount();
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
      return;
    }
  }, [token, refreshCartCount]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        MyShop
      </Link>

      <div className={styles.links}>
        <Link to="/">Home</Link>

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
