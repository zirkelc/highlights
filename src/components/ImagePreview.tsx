import React, { useEffect, useRef, useState } from "react";
import { Size } from "../libs/image";

export interface ColorPickerProps {
	size: Size;
	source?: HTMLCanvasElement;
}

export function ImagePreview({ size, source }: ColorPickerProps) {
	const { width, height } = size;
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const canvasContext = canvas.getContext("2d", {
			willReadFrequently: true,
		});
		if (!canvasContext) return;

		if (source) {
			canvas.width = width;
			canvas.height = height;

			canvasContext.drawImage(source, 0, 0, canvas.width, canvas.height);
		} else {
			canvasContext.clearRect(0, 0, canvas.width, canvas.height);
		}
	}, [source, width, height]);

	return <canvas ref={canvasRef} />;
}
