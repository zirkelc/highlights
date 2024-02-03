import { useEffect, useRef, useState } from "react";
import { RecognizeResult } from "tesseract.js";
import { ColorPicker } from "./components/ColorPicker";
import { ImagePreview } from "./components/ImagePreview";
import { ImageUpload } from "./components/ImageUpload";
import { TextRenderer } from "./components/TextRenderer";
import { HSV, RGB } from "./libs/color";
import {
  applyMask,
  colorSegmentation,
  recognize,
  threshold
} from "./libs/ocr";

function App() {
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [imageSize, setImageSize] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
	const [canvas2, setCanvas2] = useState<HTMLCanvasElement | null>(null);
	const [canvas3, setCanvas3] = useState<HTMLCanvasElement | null>(null);
	const [canvas4, setCanvas4] = useState<HTMLCanvasElement | null>(null);

	const containerRef = useRef<HTMLDivElement>(null);

	const [result, setResult] = useState<RecognizeResult>();
	const [highlightColor, setHighlightColor] = useState<RGB>({
		r: 255,
		g: 255,
		b: 255,
	});

	// const clearImage = () => setImage(null);

	const handleImageUpload = (file: File) => {
		const fileReader = new FileReader();
		fileReader.readAsDataURL(file);
		fileReader.onloadend = (readEvent) => {
			const src = readEvent.target?.result?.toString();
			if (!src) throw Error("Could not read file...");

			const newImage = new Image();
			newImage.src = src;
			newImage.onload = () => {
				const rect = containerRef.current?.getBoundingClientRect();

				const availableWidth = rect?.width ?? Number.POSITIVE_INFINITY;
				const reducedImageWidth = Math.min(newImage.width, availableWidth);
				const scaleFactor = reducedImageWidth / newImage.width;

				const width = reducedImageWidth;
				const height = newImage.height * scaleFactor;

				setImageSize({ width, height });
				setImage(newImage);
			};
		};

		// const src = URL.createObjectURL(file);
		// const newImage = new Image()
		// newImage.crossOrigin = 'Anonymous'
		// newImage.onload = () => setImage(newImage);
		// newImage.src = src
	};

	const handleColorChange = (rgb: RGB) => {
		// const hsv = RGB.toHSV(rgb);
		console.log("color", { rgb });
		setHighlightColor(rgb);
	};

	useEffect(() => {
		if (!image) return;

		console.log("size", imageSize);

		// setLoading(true);

		const run = async () => {
			try {
				// convert RGB to HSV
				const hsv = RGB.toHSV(highlightColor);

				// create a color range for the mask
				const [lowerHsv, upperHsv] = HSV.range(hsv, [20, 40, 40]);

				// TODO create one working canvas for OCR re-do all steps for ImagePreview?

				const thresholdCanvas = threshold(image);
				setCanvas(thresholdCanvas);

				const maskCanvas = colorSegmentation({
					srcImg: image,
					lowerHsv,
					upperHsv,
				});
				setCanvas2(maskCanvas);

				// const denoisedMaskCanvas = denoise(maskCanvas);
				// setCanvas3(denoisedMaskCanvas);

				const imageMaskedCanvas = applyMask(image, maskCanvas);
				setCanvas4(imageMaskedCanvas);

				const result = await recognize(thresholdCanvas, maskCanvas, {
					thresholdPercentage: 25,
					highlightColor: highlightColor,
				});
				console.log(result);
				setResult(result);

				//     // setLoading(false);
			} catch (error) {
				// const e = cv.exceptionFromPtr(error);
				console.error(error);
				// setLoading(false);
			}
		};

		run();
	}, [image, imageSize, highlightColor]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-between">
			<div className="container mx-auto p-4">
				<div className="grid xl:grid-cols-2 gap-4">
					<div className="bg-red-200 p-4">
						<div ref={containerRef}>
							{image ? (
								// TODO resize each canvas again on window resize
								<div>
									<ColorPicker
										onColorChange={handleColorChange}
										image={image}
									/>

									<ImagePreview image={image} sourceCanvas={canvas} />
									<ImagePreview image={image} sourceCanvas={canvas2} />
									<ImagePreview image={image} sourceCanvas={canvas3} />
									<ImagePreview image={image} sourceCanvas={canvas4} />
								</div>
							) : (
								<div>
									<ImageUpload onUpload={handleImageUpload} />
								</div>
							)}
						</div>
					</div>
					<div className="bg-blue-200 p-4">
						<TextRenderer result={result} />
					</div>
				</div>
			</div>
		</main>
	);
}

export default App;
