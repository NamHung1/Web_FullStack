import { useParams } from 'react-router-dom';
import { Button, Spin, Rate, Empty, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { getProductAPI } from '../../api/product.api';
import { addToCartAPI } from '../../api/cart.api';
import { getProductReviewsAPI } from '../../api/review.api';
import { useCart } from '../../hooks/useCart';
import type { Product } from '../../types/product';
import type { Review } from '../../types/order';
import { getApiErrorMessage } from '../../utils/apiError';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { incrementCount } = useCart();

  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id]);

  const fetchProductData = async (productId: string) => {
    setLoading(true);
    try {
      const productData = await getProductAPI(productId);
      setProduct(productData);
      try {
        const reviewData = await getProductReviewsAPI(productId);
        setReviews(reviewData);
      } catch {
        setReviews([]);
      }
    } catch {
      setProduct(null);
      message.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAdding(true);
    try {
      await addToCartAPI(product._id, 1);
      incrementCount(1);
      message.success('Added to cart');
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, 'Failed to add to cart. Please login first.'));
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const categoryName = typeof product.category === 'object' ? product.category?.name : '';
  const averageRating = reviews.length
    ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1))
    : Number(product.ratingAverage || 0);
  const stock = Number(product.stock) || 0;
  const isOutOfStock = stock <= 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <img src={product.images?.[0] || 'https://picsum.photos/300'} className={styles.image} alt={product.name} />

        <div className={styles.info}>
          <h2>{product.name}</h2>

          {categoryName ? <p>Category: {categoryName}</p> : null}
          <p>Stock: {stock}</p>
          <p>{product.description}</p>
          <Typography.Text>Rating: {averageRating}/5 ({reviews.length} reviews)</Typography.Text>

          <Button
            type="primary"
            loading={adding}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      <div className={styles.reviewSection}>
        <h3>Đánh giá sản phẩm ({reviews.length})</h3>
        {!reviews.length ? (
          <Empty description="Chưa có đánh giá" />
        ) : (
          <div className={styles.reviewList}>
            {reviews.map((review) => {
              const reviewer =
                typeof review.userId === 'object' ? review.userId.name || review.userId.email || 'User' : 'User';
                return (
                <div key={review._id} className={styles.reviewItem}>
                  <div className={styles.reviewHead}>
                    <strong>{reviewer}</strong>
                    <Rate disabled value={review.rating} />
                  </div>
                  <p>{review.comment || 'Không có nội dung'}</p>
                  <small>{new Date(review.createdAt).toLocaleString()}</small>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
