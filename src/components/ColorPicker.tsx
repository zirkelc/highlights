import React, { useEffect, useRef, useState } from "react";


export interface ColorPickerProps {
	image: HTMLImageElement;
	onColorChange?: (color: { red: number; green: number; blue: number }) => void;
}

export function ColorPicker(props: ColorPickerProps) {
	const { image, onColorChange } = props;

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);

	const [hoverColor, setHoverColor] = useState<{ red: number; green: number; blue: number } | undefined>();
	const [color, setColor] = useState<{ red: number; green: number; blue: number } | undefined>();

	useEffect(() => {
		const canvas = canvasRef.current;
		const canvasContainerRect = canvasContainerRef.current?.getBoundingClientRect();

		console.log('canvas', canvasContainerRect)

		if (canvas && canvasContainerRect) {
			const canvasContext = canvas.getContext("2d", {
				willReadFrequently: true
			});
			if (!canvasContext) return;
			canvasContextRef.current = canvasContext;

			if (image) {
				// if (image.width > image.height) {
				const canvasMaxWidth = canvasContainerRect.width;
				const reducedImageWidth = Math.min(image.width, canvasMaxWidth);
				const imageWidthReduction = reducedImageWidth / image.width;

				canvas.width = reducedImageWidth;
				canvas.height = image.height * imageWidthReduction;
				// } else {
				// 	const canvasMaxHeight = window.innerHeight * 0.75;
				// 	const reducedImageHeight = Math.min(image.height, canvasMaxHeight);
				// 	const imageHeightReduction = reducedImageHeight / image.height;

				// 	canvas.width = image.width * imageHeightReduction;
				// 	canvas.height = reducedImageHeight;
				// }

				// TODO if canvas height is greater than 0.75 of window height, reduce canvas height to 0.75 of window height

				canvasContext.drawImage(image, 0, 0, canvas.width, canvas.height);
			} else {
				canvasContext.clearRect(0, 0, canvas.width, canvas.height);
			}
		}
	}, [image]);

	const [isMouseOver, setIsMouseOver] = useState(false);
	const requestAnimationFrameRef = useRef<number>(0);

	useEffect(() => {
		const handleMouseEnter = () => setIsMouseOver(true);
		const handleMouseLeave = () => setIsMouseOver(false);

		const updateMousePosition = (event: MouseEvent) => {
			const canvasContext = canvasContextRef.current;
			if (canvasContext) {
				const [red, green, blue] = canvasContext.getImageData(event.offsetX, event.offsetY, 1, 1).data;
				setHoverColor({ red, green, blue });
			}
		};

		const handleMouseMove = (event: MouseEvent) => {
			cancelAnimationFrame(requestAnimationFrameRef.current);
			requestAnimationFrameRef.current = requestAnimationFrame(() => updateMousePosition(event));
		};

		const handleMouseClick = (event: MouseEvent) => {
			const canvasContext = canvasContextRef.current;
			if (canvasContext) {
				const [red, green, blue] = canvasContext.getImageData(event.offsetX, event.offsetY, 1, 1).data;
				// setColor({ red, green, blue });
				onColorChange?.({ red, green, blue });
			}
		}

		const canvasContainer = canvasContainerRef.current;
		if (canvasContainer) {
			canvasContainer.addEventListener("mouseenter", handleMouseEnter);
			canvasContainer.addEventListener("mouseleave", handleMouseLeave);
			canvasContainer.addEventListener("mousemove", handleMouseMove);
			canvasContainer.addEventListener("click", handleMouseClick);
		}

		return () => {
			if (canvasContainer) {
				canvasContainer.removeEventListener("mouseenter", handleMouseEnter);
				canvasContainer.removeEventListener("mouseleave", handleMouseLeave);
				canvasContainer.removeEventListener("mousemove", handleMouseMove);
				canvasContainer.removeEventListener("click", handleMouseClick);
			}
		};
	}, [onColorChange]);

	return (
		// <div >
		<div ref={canvasContainerRef}>
			<canvas ref={canvasRef} />
		</div>

		/* {image && (
			<div className={styles.colorPreview}>
				<div>
					<div>Hovered color</div>
					<ColorPreview rgb={hoverColor} />
				</div>
			</div>
		)} */
		// </div>
	);
};