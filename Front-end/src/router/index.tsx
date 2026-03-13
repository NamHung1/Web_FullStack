import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import OAuthSuccess from '../pages/OAuthSuccess/OAuthSuccess';
import Register from '../pages/Register/Register';
import ProductDetail from '../pages/ProductDetail/ProductDetail';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Checkout/Checkout';
import Orders from '../pages/Orders/Orders';

import Dashboard from '../admin/Dashboard/Dashboard';
import ManageUsers from '../admin/ManageUsers/ManageUsers';
import ManageProducts from '../admin/ManageProducts/ManageProducts';
import ManageOrders from '../admin/ManageOrders/ManageOrders';
import ManageCategories from '../admin/ManageCategories/ManageCategories';
import ProtectedRoute from '../components/ProtectedRoute';
import Messenger from '../admin/Messenger/Messenger';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },

      {
        path: '/login',
        element: <Login />,
      },

      {
        path: '/register',
        element: <Register />,
      },

      {
        path: '/oauth-success',
        element: <OAuthSuccess />,
      },

      {
        path: '/product/:id',
        element: <ProductDetail />,
      },

      {
        path: '/cart',
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },

      {
        path: '/checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },

      {
        path: '/orders',
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: '/admin',
    element: (
      <ProtectedRoute adminOnly={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },

      {
        path: 'users',
        element: <ManageUsers />,
      },

      {
        path: 'products',
        element: <ManageProducts />,
      },

      {
        path: 'orders',
        element: <ManageOrders />,
      },

      {
        path: 'categories',
        element: <ManageCategories />,
      },

      {
        path: 'chat',
        element: <Messenger/>,
      },
    ],
  },
]);
