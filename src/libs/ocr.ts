import cv from '@techstark/opencv-js';
import { type Bbox, OEM, createWorker } from 'tesseract.js';
import { HSV } from './color';

declare module 'tesseract.js' {
  interface Block {
    id: string;
  }
  interface Paragraph {
    id: string;
  }
  interface Line {
    id: string;
  }
  interface Word {
    id: string;
    is_highlighted: boolean;
  }
  interface Symbol {
    id: string;
    is_highlighted: boolean;
  }
}

type ImageLike = HTMLImageElement | HTMLCanvasElement;

export function rgb(srcImg: ImageLike, dstImg?: HTMLCanvasElement): HTMLCanvasElement {
  const src = cv.imread(srcImg);
  const dst = new cv.Mat();

  const canvas = dstImg ?? document.createElement('canvas');
  cv.imshow(canvas, src);

  src.delete();
  dst.delete();

  return canvas;
}

export function threshold(srcImg: ImageLike, dstImg?: HTMLCanvasElement): HTMLCanvasElement {
  const src = cv.imread(srcImg);
  const dst = new cv.Mat();

  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
  cv.normalize(src, dst, 0, 255, cv.NORM_MINMAX);

  const thresholdValue = 120;
  const maxValue = 255;
  cv.threshold(dst, dst, thresholdValue, maxValue, cv.THRESH_BINARY + cv.THRESH_OTSU);

  const canvas = dstImg ?? document.createElement('canvas');
  cv.imshow(canvas, dst);

  src.delete();
  dst.delete();

  return canvas;
}

type ColorSegmentation = {
  srcImg: ImageLike;
  dstImg?: HTMLCanvasElement;
  lowerHsv: HSV;
  upperHsv: HSV;
};
export function colorSegmentation({ srcImg, dstImg, lowerHsv, upperHsv }: ColorSegmentation) {
  const src = cv.imread(srcImg);
  console.log('src', { src, type: src.type(), channels: src.channels() });
  const dst = new cv.Mat();

  // TODO check if RGBA or RGB, and if RGB or BGR?
  cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
  console.log('src', { src, type: src.type(), channels: src.channels() });

  cv.cvtColor(src, dst, cv.COLOR_RGB2HSV, 0);
  console.log('dst', { dst, type: dst.type(), channels: dst.channels() });

  // normalize HSV values to OpenCV range (H: 0-179, S: 0-255, V: 0-255)
  const normLowerHsv = HSV.normalize(lowerHsv, [179, 255, 255]);
  const normUpperHsv = HSV.normalize(upperHsv, [180, 255, 255]);

  // https://cvexplained.wordpress.com/2020/04/28/color-detection-hsv/
  // const hsv_lower = [22, 30, 30, 0];
  // const hsv_upper = [45, 255, 255, 255];

  const low = new cv.Mat(dst.rows, dst.cols, dst.type(), new cv.Scalar(normLowerHsv.h, normLowerHsv.s, normLowerHsv.v));
  const high = new cv.Mat(
    dst.rows,
    dst.cols,
    dst.type(),
    new cv.Scalar(normUpperHsv.h, normUpperHsv.s, normUpperHsv.v),
  );

  cv.inRange(dst, low, high, dst);

  // denoise mask
  const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
  cv.morphologyEx(dst, dst, cv.MORPH_OPEN, kernel, new cv.Point(-1, -1), 1);

  const canvas = dstImg ?? document.createElement('canvas');
  cv.imshow(canvas, dst);

  src.delete();
  dst.delete();

  return canvas;
}

export function applyMask(srcImg: ImageLike, maskImg: ImageLike, dstImg?: HTMLCanvasElement) {
  const src = cv.imread(srcImg);
  const dst = new cv.Mat();

  const mask = cv.imread(maskImg);
  cv.cvtColor(mask, mask, cv.COLOR_RGBA2GRAY); //! mask must be one channel, not 3 channels

  cv.bitwise_and(src, src, dst, mask);

  const canvas = dstImg ?? document.createElement('canvas');
  cv.imshow(canvas, dst);

  src.delete();
  mask.delete();
  dst.delete();

  return canvas;
}

export type RecognizeProgress = {
  progress: number;
  status: string;
};
type RecognizeInput = {
  srcImg: ImageLike;
  maskImg?: ImageLike;
  thresholdPercentage: number;
  onProgress?: (progress: RecognizeProgress) => void;
};
export async function recognize({ srcImg, maskImg, thresholdPercentage, onProgress }: RecognizeInput) {
  console.log('parse', srcImg, maskImg, thresholdPercentage);
  const worker = await createWorker('eng', OEM.DEFAULT, {
    logger: (m) => {
      console.log(m);
      onProgress?.(m);
    },
  });

  const result = await worker.recognize(srcImg);
  await worker.terminate();

  const src = cv.imread(srcImg);
  const mask = maskImg ? cv.imread(maskImg) : cv.Mat.zeros(src.rows, src.cols, src.type());
  cv.cvtColor(mask, mask, cv.COLOR_RGBA2GRAY);

  const blocks = result.data.blocks ?? [];
  for (let bix = 0; bix < blocks.length; bix++) {
    const block = blocks[bix];
    block.id = `b-${bix}`;

    for (let pix = 0; pix < block.paragraphs.length; pix++) {
      const paragraph = block.paragraphs[pix];
      paragraph.id = `${block.id}-p-${pix}`;

      for (let lix = 0; lix < paragraph.lines.length; lix++) {
        const line = paragraph.lines[lix];
        line.id = `${paragraph.id}-l-${lix}`;

        for (let wix = 0; wix < line.words.length; wix++) {
          const word = line.words[wix];
          word.id = `${line.id}-w-${wix}`;
          word.is_highlighted = isHighlighted(word.bbox, mask, thresholdPercentage);

          for (let sx = 0; sx < word.symbols.length; sx++) {
            const symbol = word.symbols[sx];
            symbol.id = `${word.id}-s-${sx}`;

            // TODO for single chars we should calculate the space each character needs and substract it from te bounding box area
            // then use the remaining area to calculate the threshold
            // we can use teh font data on the Word to calculate the space each character needs

            // Single characters have less available space, so we need to lower the threshold
            // Some chars like 'I', 'i' and 'l' are to narrow, so we need to lower the threshold even more
            let symbolThresholdPercentage = 10;
            switch (symbol.text) {
              case 'I':
              case 'i':
              case 'l':
                symbolThresholdPercentage = 5;
                break;
            }
            symbol.is_highlighted = isHighlighted(symbol.bbox, mask, symbolThresholdPercentage);
          }
        }
      }
    }
  }

  mask.delete();

  return result;
}

const isHighlighted = (bbox: Bbox, mask: cv.Mat, thresholdPercentage = 25): boolean => {
  const { x0, y0, x1, y1 } = bbox;
  const width = x1 - x0;
  const height = y1 - y0;

  const rectThresholdPixels = (width * height * thresholdPercentage) / 100;

  const imgMaskRoi = mask.roi(new cv.Rect(x0, y0, width, height));
  const count = cv.countNonZero(imgMaskRoi);

  return count > rectThresholdPixels;
};
