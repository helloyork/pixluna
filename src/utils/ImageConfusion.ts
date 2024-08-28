import Jimp from 'jimp';
import JimpConstructors from 'jimp/types';

export async function readRemoteImage(url: string, onRead?: (image: JimpConstructors) => void): Promise<ArrayBuffer> {
  const MimeType = url.split('.').pop();
  const TypeMap = {
    jpg: Jimp.MIME_JPEG,
    jpeg: Jimp.MIME_JPEG,
    png: Jimp.MIME_PNG,
    gif: Jimp.MIME_GIF,
  };
  return Jimp.read(url).then((image) => {
    if (onRead) {
      onRead(image);
    }
    return image.getBufferAsync(TypeMap[MimeType]);
  });
}

export function applyImageConfusion(image: JimpConstructors): void {
  const dotDiameter = 10;
  const x = image.bitmap.width - dotDiameter;
  const y = image.bitmap.height - dotDiameter;

  for (let i = 0; i < dotDiameter; i++) {
    for (let j = 0; j < dotDiameter; j++) {
      const color = image.getPixelColor(x + i, y + j);
      const _r = (color >> 24) & 0xFF;
      const r = _r + 10 > 255 ? _r - 10 : _r + 10;
      const _g = (color >> 16) & 0xFF;
      const g = _g + 10 > 255 ? _g - 10 : _g + 10;
      const _b = (color >> 8) & 0xFF;
      const b = _b + 10 > 255 ? _b - 10 : _b + 10;
      const a = color & 0xFF;
      const newColor = Jimp.rgbaToInt(r, g, b, a);
      image.setPixelColor(newColor, x + i, y + j);
    }
  }
}
