import { Router } from 'express';
import { getAllImages, getImageById } from '../controllers/imageController.js';

const router = Router();

router.get('/images', getAllImages);
router.get('/images/:id', getImageById);

export default router;
