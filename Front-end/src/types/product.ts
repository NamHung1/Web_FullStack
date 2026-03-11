export interface ProductCategory {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  description?: string;
  stock?: number;
  ratingAverage?: number;
  ratingCount?: number;
  category?: string | ProductCategory;
}
