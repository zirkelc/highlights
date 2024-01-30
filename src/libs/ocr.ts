import cv from "@techstark/opencv-js";
import { OEM, Word, createWorker } from "tesseract.js";

declare module "tesseract.js" {
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
}

type ImageLike = string | HTMLImageElement | HTMLCanvasElement;

export function threshold(srcImg: ImageLike, dstImg: ImageLike) {
	const src = cv.imread(srcImg);
	const dst = new cv.Mat();

	cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
	cv.normalize(src, dst, 0, 255, cv.NORM_MINMAX);

	const thresholdValue = 120;
	const maxValue = 255;
	cv.threshold(dst, dst, thresholdValue, maxValue, cv.THRESH_BINARY + cv.THRESH_OTSU);

	cv.imshow(dstImg, dst);

	src.delete();
	dst.delete();
	// return dst;
}

export function colorSegmentation(srcImg: ImageLike, dstImg: ImageLike) {
	const src = cv.imread(srcImg);
	const dst = new cv.Mat();

	cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
	cv.cvtColor(src, dst, cv.COLOR_RGB2HSV, 0);

	const hsv_lower = [22, 30, 30, 0];
	const hsv_upper = [45, 255, 255, 255];

	// let low = new cv.Mat(dst.size(), dst.type(), hsv_lower);
	// let high = new cv.Mat(dst.size(), dst.type(), hsv_upper);

	const low = new cv.Mat(dst.rows, dst.cols, dst.type(), hsv_lower);
	const high = new cv.Mat(dst.rows, dst.cols, dst.type(), hsv_upper);
	cv.inRange(dst, low, high, dst);

	cv.imshow(dstImg, dst);

	src.delete();
	dst.delete();
	// return dst;
}

export function denoise(srcImg: ImageLike, dstImg: ImageLike) {
	const src = cv.imread(srcImg);
	const dst = new cv.Mat();

	const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
	cv.morphologyEx(src, dst, cv.MORPH_OPEN, kernel, new cv.Point(-1, -1), 1);

	cv.imshow(dstImg, dst);

	kernel.delete();
	src.delete();
	dst.delete();
	// return dst;
}

export function applyMask(srcImg: ImageLike, dstImg: ImageLike, maskImg: ImageLike) {
	console.log('applyMask', { srcImg, dstImg, maskImg });
	const src = cv.imread(srcImg);
	const dst = new cv.Mat();

	const mask = cv.imread(maskImg);
	cv.cvtColor(mask, mask, cv.COLOR_RGBA2GRAY); //! mask must be one channel, not 3 channels

	cv.bitwise_and(src, src, dst, mask);

	cv.imshow(dstImg, dst);

	src.delete();
	mask.delete();
	dst.delete();
}

export async function recognize(srcImg: ImageLike, maskImg: ImageLike, thresholdPercentage: number = 25) {
	console.log('parse', srcImg, maskImg, thresholdPercentage);
	const worker = await createWorker('eng', OEM.DEFAULT, {
		logger: m => console.log(m),
	});

	const result = await worker.recognize(srcImg);
	await worker.terminate();

	const mask = cv.imread(maskImg);
	cv.cvtColor(mask, mask, cv.COLOR_RGBA2GRAY);

	const blocks = result.data.blocks ?? [];
	for (let bix = 0; bix < blocks.length ?? 0; bix++) {
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
					word.is_highlighted = isHighlighted(word, mask, thresholdPercentage);
				}
			}
		}
	}

	mask.delete();

	return result;
}

const isHighlighted = (word: Word, mask: cv.Mat, thresholdPercentage: number = 25): boolean => {
	const { x0, y0, x1, y1 } = word.bbox;
	const width = x1 - x0;
	const height = y1 - y0;

	const rectThresholdPixels = (width * height * thresholdPercentage) / 100;

	const imgMaskRoi = mask.roi(new cv.Rect(x0, y0, width, height));
	const count = cv.countNonZero(imgMaskRoi);

	return count > rectThresholdPixels;
}