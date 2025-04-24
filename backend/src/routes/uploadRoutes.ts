import { Router } from 'express';
import multer from 'multer';
import { uploadImages } from '../controllers/uploadController.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { __dirname } from '../utils/path.js';


const router = Router();


// Setup uploads directory
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.array('images'), uploadImages);

export default router;
