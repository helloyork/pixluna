import sharp from 'sharp';
import axios from 'axios';
import { Lolicon } from './Interface';
import stream from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(stream.pipeline);

async function fetchImageStream(url: string): Promise<NodeJS.ReadableStream> {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });
  return response.data;
}

function getImageMimeType(url: string): string {
  const extension = url
    .split(".")
    .pop()
    ?.toLowerCase();
  const typeMap = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif"
  };
  return typeMap[extension] || "application/octet-stream";
}

async function streamToBuffer(stream: NodeJS.ReadableStream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function mixImage(image: Lolicon): Promise<string> {
  const imageStream = await fetchImageStream(image.urls.original);

  const imageBuffer = await streamToBuffer(imageStream);
  const { width, height } = await sharp(imageBuffer).metadata();

  const { data, info } = await sharp(imageBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const startX = Math.max(0, width - 50);
  const startY = Math.max(0, height - 50);

  for (let y = startY; y < height; y++) {
    for (let x = startX; x < width; x++) {
      const idx = (y * width + x) * info.channels;
      data[idx] = (data[idx] + 100 < 255) ? data[idx] + 10 : 255;
      data[idx + 1] = (data[idx + 1] + 100 < 255) ? data[idx + 1] + 10 : 255;
      data[idx + 2] = (data[idx + 2] + 100 < 255) ? data[idx + 2] + 10 : 255;
    }
  }

  const processedImageBuffer = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  }).png().toBuffer();

  console.debug("Image processed");

  return `data:${getImageMimeType(image.urls.original)};base64,${processedImageBuffer.toString("base64")}`;
}
