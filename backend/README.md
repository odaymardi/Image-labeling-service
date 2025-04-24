# 🖼️ Image Processing API

This backend service enables image uploads, analyzes the content using Hugging Face models, and stores metadata and results in MongoDB. It includes automated metadata extraction, object detection, scene classification, and processing status tracking.

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/odaymardi/Image-labeling-service.git

cd image-processing-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

Then, add your configuration:

```env
HUGGINGFACE_API_TOKEN=your_token_here
MONGODB_URI=mongodb://localhost:27017/image-labeler
```


### 4. Get a Hugging Face Token

1. Go to: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click "New token" and select "read" scope
3. Copy and paste the token into your `.env`

### 5. Start the Development Server

```bash
docker-compose up
```

Visit the API at: `http://localhost:3000`

---

## 🧪 Running Tests

This project uses **Vitest** for unit testing.

```bash
npm run test
```

---

## 🏗️ Implementation Notes

- **Image Processing**
  - Metadata (width, height, size) is extracted via `sharp`
  - Hugging Face models are used for object detection and scene classification
  - Progress is tracked in the database in stages (25%, 50%, 75%, 100%)

- **Database**
  - Uses MongoDB via Mongoose
  - Stores uploaded image metadata, status, and analysis results

- **Models**
  - `ImageUploadModel` includes dimensions, file info, processing status, labels, and error handling

- **Testing**
  - Focuses on unit testing image metadata extraction and process simulation
  - Hugging Face API calls and MongoDB operations are mocked in tests

---

## 📬 Questions?

Contact: [odaymard88@gmail.com]

---

## 📄 License

MIT License

