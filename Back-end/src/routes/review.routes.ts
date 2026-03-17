import { Router } from 'express';
import { addReview, getProductReviews } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, addReview);
router.get('/product/:productId', getProductReviews);

export default router;