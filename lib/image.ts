import sharp from "sharp";

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 70;

export async function createThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: THUMBNAIL_QUALITY })
    .toBuffer();
}
