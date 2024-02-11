import { useLayoutEffect, useMemo, useState } from "react";
import useResizeObserver from "@react-hook/resize-observer";
import { exp } from "@techstark/opencv-js";

export type Size = {
	width: number;
	height: number;
};

export function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		// const image = new Image();
		// image.crossOrigin = "Anonymous";
		// image.onload = () => resolve(image);
		// image.onerror = (errorEvent) => reject(errorEvent.error);
		// image.src = src;

		const fileReader = new FileReader();
		fileReader.readAsDataURL(file);
		fileReader.onloadend = (readEvent) => {
			const src = readEvent.target?.result?.toString();
			if (!src) throw Error("Could not read file...");

			const newImage = new Image();
			newImage.src = src;
			newImage.onload = () => resolve(newImage);
		};
	});
}

export function calculateCanvasSize(
	image: HTMLImageElement,
	containerSize: Size,
): Size {
	// const rect = container.getBoundingClientRect();
	const availableWidth = containerSize.width;
	const reducedImageWidth = Math.min(image.width, availableWidth);
	const scaleFactor = reducedImageWidth / image.width;

	const width = reducedImageWidth;
	const height = image.height * scaleFactor;

	return { width, height };
}

export function useContainerSize(target: React.RefObject<HTMLElement>) {
	const [size, setSize] = useState<Size>();

	useLayoutEffect(() => {
		const rect = target.current?.getBoundingClientRect();
		setSize(rect ? { width: rect.width, height: rect.height } : undefined);
	}, [target]);

	useResizeObserver(target, (entry) => setSize(entry.contentRect));

	return size;
}

export function useCanvasSize(image?: HTMLImageElement, containerSize?: Size) {
	const { width, height } = containerSize ?? { width: 0, height: 0 };

	return useMemo(() => {
		if (!image) return { width: 0, height: 0 };

		const size = calculateCanvasSize(image, {
			width,
			height,
		});
		console.log("resize", size);
		return size;
	}, [image, height, width]);
}
