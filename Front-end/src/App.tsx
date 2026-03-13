import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/authStore';
import api from './api/axios';

import './App.css';

function App() {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!token) {
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setAuth(res.data, token);
      })
      .catch(() => {
        logout();
      });
  }, [logout, setAuth, token]);

  return <RouterProvider router={router} />;
}

export default App;
