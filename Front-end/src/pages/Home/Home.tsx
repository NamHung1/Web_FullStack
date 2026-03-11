import { useState, useEffect, useCallback } from 'react';
import ProductList from '../../components/ProductList/ProductList';
import SearchBar from '../../components/SearchBar/SearchBar';
import { getProductsAPI, searchProductsAPI } from '../../api/product.api';
import { getCategoriesAPI } from '../../api/category.api';
import type { Product } from '../../types/product';
import { message } from 'antd';
import styles from './Home.module.css';

interface Category {
  _id: string;
  name: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchProducts = useCallback(async (categoryId?: string) => {
    try {
      const data = await getProductsAPI(categoryId);
      setProducts(data);
    } catch {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    getCategoriesAPI()
      .then((data) => setCategories(data))
      .catch(() => message.warning('Could not load categories'));
  }, [fetchProducts]);

  const handleSearch = useCallback(
    async (value: string) => {
      setLoading(true);
      try {
        if (!value.trim()) {
          const data = await getProductsAPI(selectedCategory || undefined);
          setProducts(data);
          return;
        }

        const data = await searchProductsAPI(
          value,
          selectedCategory || undefined,
        );
        setProducts(data);
      } catch {
        message.error('Search failed');
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory],
  );

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setLoading(true);

    try {
      const data = await getProductsAPI(categoryId || undefined);
      setProducts(data);
    } catch {
      message.error('Failed to filter products by category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <SearchBar
        onSearch={handleSearch}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <ProductList products={products} loading={loading} />
    </div>
  );
}
