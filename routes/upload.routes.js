const express = require("express");
const path = require("path");
const fs = require("fs");

const {
  imageUpload,
  documentUpload,
  handleUploadError,
  DOCUMENT_DIR,
} = require("../middleware/upload");
const { processImage } = require("../utils/imageProcessor");




const router = express.Router();

const INLINE_VIEW_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
]);

function imageFileResponse(filePath) {
  const filename = path.basename(filePath);
  return {
    filename,
    type: "image",
    url: `/uploads/${filename}`,
    viewUrl: `/uploads/${filename}`,
  };
}

function documentFileResponse(file) {
  const filename = path.basename(file.filename);
  return {
    filename,
    type: "document",
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/uploads/documents/${filename}`,
    viewUrl: `/api/upload/file/${filename}`,
  };
}

// --- Image uploads (Sharp processing) ---

router.post(
  "/single",
  imageUpload.single("image"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const processedPath = await processImage(req.file.path, {
        width: 800,
        quality: 80,
        format: "webp",
      });

      res.status(201).json({
        message: "Image uploaded and processed",
        file: imageFileResponse(processedPath),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// 'imesg.webp'

// ['imesg.webp', 'imesg.webp', 'imesg.webp', 'imesg.webp', 'imesg.webp']



router.post(
  "/multiple",
  imageUpload.array("images", 5),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const files = await Promise.all(
        req.files.map((file) =>
          processImage(file.path, {
            width: 400,
            quality: 75,
            format: "webp",
          })
        )
      );

      res.status(201).json({
        message: `${files.length} images uploaded and processed`,
        files: files.map(imageFileResponse),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// --- Document / other file uploads (no Sharp) ---

router.post(
  "/file/single",
  documentUpload.single("file"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      res.status(201).json({
        message: "File uploaded successfully",
        file: documentFileResponse(req.file),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/file/multiple",
  documentUpload.array("files", 5),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      res.status(201).json({
        message: `${req.files.length} files uploaded successfully`,
        files: req.files.map(documentFileResponse),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// View or download uploaded document
router.get("/file/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(DOCUMENT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".zip": "application/zip",
  };

  const mimetype = mimeTypes[ext] || "application/octet-stream";
  const forceDownload = req.query.download === "true";
  const inline = !forceDownload && INLINE_VIEW_TYPES.has(mimetype);

  res.setHeader("Content-Type", mimetype);
  res.setHeader(
    "Content-Disposition",
    `${inline ? "inline" : "attachment"}; filename="${filename}"`
  );

  res.sendFile(filePath);
});

module.exports = router;
