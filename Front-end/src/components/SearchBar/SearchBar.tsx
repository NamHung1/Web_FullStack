import { Input, Select } from 'antd';
import { useEffect, useState } from 'react';

import styles from './SearchBar.module.css';

interface SearchCategory {
  _id: string;
  name: string;
}

interface Props {
  onSearch: (value: string) => void;
  categories?: SearchCategory[];
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
}

export default function SearchBar({
  onSearch,
  categories = [],
  selectedCategory = '',
  onCategoryChange,
}: Props) {
  const [value, setValue] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, onSearch]);

  return (
    <div className={styles.search}>
      <Input
        placeholder="Search product..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Select
        value={selectedCategory || 'all'}
        className={styles.categorySelect}
        onChange={(nextValue) =>
          onCategoryChange?.(nextValue === 'all' ? '' : nextValue)
        }
        options={[
          { label: 'All categories', value: 'all' },
          ...categories.map((category) => ({
            label: category.name,
            value: category._id,
          })),
        ]}
      />
    </div>
  );
}
