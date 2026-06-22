const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOAD_DIR = path.join(__dirname, "../uploads");
const DOCUMENT_DIR = path.join(UPLOAD_DIR, "documents");

for (const dir of [UPLOAD_DIR, DOCUMENT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB




function createStorage(destination) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}


function createFileFilter(allowedTypes, errorMessage) {
  return (_req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(errorMessage));
    }
  };
}

const imageUpload = multer({
  storage: createStorage(UPLOAD_DIR),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: createFileFilter(
    IMAGE_MIME_TYPES,
    "Only JPEG, PNG, and WebP images are allowed"
  ),
});

const documentUpload = multer({
  storage: createStorage(DOCUMENT_DIR),
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: createFileFilter(
    DOCUMENT_MIME_TYPES,
    "Allowed files: PDF, TXT, CSV, DOC, DOCX, XLS, XLSX, ZIP"
  ),
});

function handleUploadError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "File too large",
      LIMIT_UNEXPECTED_FILE: `Unexpected field "${err.field}"`,
      MISSING_FIELD_NAME:
        "Form field name is missing. In Postman: Body → form-data → set key and type File",
    };

    return res.status(400).json({
      message: messages[err.code] || err.message,
      code: err.code,
    });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
}

module.exports = {
  imageUpload,
  documentUpload,
  handleUploadError,
  UPLOAD_DIR,
  DOCUMENT_DIR,
};
