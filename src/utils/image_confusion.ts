import { Context, h } from "koishi";
import sharp from "sharp"; // Import sharp library directly

const IMAGE_MINE_TYPE_MAP = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};

export type IMAGE_MINE_TYPE = keyof typeof IMAGE_MINE_TYPE_MAP;

export function getImageMimeType(
  extension: string,
): keyof typeof IMAGE_MINE_TYPE_MAP {
  return IMAGE_MINE_TYPE_MAP[extension] || "application/octet-stream";
}

export async function qualityImage(
  ctx: Context,
  imageBuffer: ArrayBuffer,
  imageType: IMAGE_MINE_TYPE,
) {
  let image = sharp(imageBuffer);

  let qualifiedImage: Buffer;

  if (imageType === "jpeg" || imageType === "jpg") {
    qualifiedImage = await image.jpeg({ quality: 65 }).toBuffer();
  } else {
    qualifiedImage = await image.png({ quality: 65 }).toBuffer();
  }

  image.destroy();

  image = undefined;

  return qualifiedImage;
}

export async function mixImage(
  ctx: Context,
  [imageBuffer, imageType]: [
    imageBuffer: ArrayBuffer,
    imageType: IMAGE_MINE_TYPE,
  ],
  compress: boolean = false,
) {
  if (compress) {
    imageBuffer = await qualityImage(ctx, imageBuffer, imageType);
  }

  let image = sharp(imageBuffer);

  const { width, height } = await image.metadata();

  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 选择右下角1*1像素
  const startX = Math.max(0, width - 1);
  const startY = Math.max(0, height - 1);

  for (let y = startY; y < height; y++) {
    for (let x = startX; x < width; x++) {
      const idx = (y * width + x) * info.channels;
      // 修改 R 通道
      data[idx] = data[idx] + 1 <= 255 ? data[idx] + 1 : data[idx] - 1;
      // 修改 G 通道
      data[idx + 1] = data[idx + 1] + 1 <= 255 ? data[idx + 1] + 1 : data[idx + 1] - 1;
      // 修改 B 通道
      data[idx + 2] = data[idx + 2] + 1 <= 255 ? data[idx + 2] + 1 : data[idx + 2] - 1;
    }
  }

  // 释放内存
  image.destroy();

  image = sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  });

  const processedImageBuffer = await image.png().toBuffer();

  image.destroy();

  image = undefined;

  return h.image(processedImageBuffer, getImageMimeType(imageType));
}
