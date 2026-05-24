import { Router } from 'express';
import { addReview, getAllReviews, getProductReviews } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

router.post('/', authMiddleware, addReview);
router.get('/product/:productId', getProductReviews);
router.get('/', authMiddleware, adminMiddleware, getAllReviews);

export default router;