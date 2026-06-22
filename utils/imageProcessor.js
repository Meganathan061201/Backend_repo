const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

async function processImage(inputPath, options = {}) {
  const {
    width = 800,
    height,
    quality = 80,
    format = "webp",
  } = options;

  const parsed = path.parse(inputPath);
  const outputPath = path.join(parsed.dir, `${parsed.name}-processed.${format}`);

  let pipeline = sharp(inputPath).resize(width, height, {
    fit: "inside",
    withoutEnlargement: true,
  });

  if (format === "jpeg") {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else if (format === "png") {
    pipeline = pipeline.png({ quality, compressionLevel: 9 });
  } else {
    pipeline = pipeline.webp({ quality });
  }

  await pipeline.toFile(outputPath);
  await fs.unlink(inputPath);

  return outputPath;
}

module.exports = { processImage };
