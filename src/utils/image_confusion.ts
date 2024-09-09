import { h } from "koishi";
import sharp from "sharp";

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
  imageBuffer: ArrayBuffer,
  imageType: IMAGE_MINE_TYPE,
) {
  let image = sharp(imageBuffer);

  let qualifedImage: Buffer;

  if (imageType === "jpeg" || imageType === "jpg") {
    qualifedImage = await image.jpeg({ quality: 65 }).toBuffer();
  } else {
    qualifedImage = await image.png({ quality: 65 }).toBuffer();
  }

  image.destroy();

  image = undefined;

  return qualifedImage;
}

export async function mixImage(
  [imageBuffer, imageType]: [
    imageBuffer: ArrayBuffer,
    imageType: IMAGE_MINE_TYPE,
  ],
  compress: boolean = false,
) {
  if (compress) {
    imageBuffer = await qualityImage(imageBuffer, imageType);
  }

  let image = sharp(
    imageBuffer,
  );

  const { width, height } = await image.metadata();

  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const startX = Math.max(0, width - 50);
  const startY = Math.max(0, height - 50);

  for (let y = startY; y < height; y++) {
    for (let x = startX; x < width; x++) {
      const idx = (y * width + x) * info.channels;
      data[idx] = data[idx] + 10 < 255 ? data[idx] + 10 : 245;
      data[idx + 1] = data[idx + 1] + 10 < 255 ? data[idx + 1] + 10 : 245;
      data[idx + 2] = data[idx + 2] + 10 < 255 ? data[idx + 2] + 10 : 245;
    }
  }

  // clear the memory?
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
