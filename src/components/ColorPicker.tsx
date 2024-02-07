import React, { useEffect, useRef, useState } from "react";
import { RGB } from "../libs/color";
import { Size } from "../libs/image";

export interface ColorPickerProps {
	image: HTMLImageElement;
	size?: Size;
	onColorChange?: (color: RGB) => void;
	onClearImage?: () => void;
}

export function ColorPicker({ image, size, onColorChange, onClearImage }: ColorPickerProps) {
	const { width, height } = size ?? { width: 0, height: 0 };

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);

	const [hoverColor, setHoverColor] = useState<RGB>();
	// const [color, setColor] = useState<Color>({ red: 255, green: 255, blue: 255 });

	const [isPickerActive, setPickerActive] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		const canvasContainerRect =
			canvasContainerRef.current?.getBoundingClientRect();

		console.log("canvas", canvasContainerRect);

		if (canvas && canvasContainerRect) {
			const canvasContext = canvas.getContext("2d", {
				willReadFrequently: true,
			});
			if (!canvasContext) return;
			canvasContextRef.current = canvasContext;

			if (image && width && height) {
				// if (image.width > image.height) {
				const canvasMaxWidth = canvasContainerRect.width;
				const reducedImageWidth = Math.min(image.width, canvasMaxWidth);
				const imageWidthReduction = reducedImageWidth / image.width;

				canvas.width = width;
				canvas.height = height;
				// canvas.width = reducedImageWidth;
				// canvas.height = image.height * imageWidthReduction;
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
	}, [image, width, height]);

	const [isMouseOver, setIsMouseOver] = useState(false);
	const requestAnimationFrameRef = useRef<number>(0);

	useEffect(() => {
		const handleMouseEnter = () => setIsMouseOver(true);
		const handleMouseLeave = () => setIsMouseOver(false);

		const updateMousePosition = (event: MouseEvent) => {
			const canvasContext = canvasContextRef.current;
			if (canvasContext) {
				const [r, g, b] = canvasContext.getImageData(
					event.offsetX,
					event.offsetY,
					1,
					1,
				).data;
				setHoverColor({ r, g, b });
			}
		};

		const handleMouseMove = (event: MouseEvent) => {
			cancelAnimationFrame(requestAnimationFrameRef.current);
			requestAnimationFrameRef.current = requestAnimationFrame(() =>
				updateMousePosition(event),
			);
		};

		const handleMouseClick = (event: MouseEvent) => {
			const canvasContext = canvasContextRef.current;
			if (canvasContext) {
				const [r, g, b] = canvasContext.getImageData(
					event.offsetX,
					event.offsetY,
					1,
					1,
				).data;
				// setColor({ red, green, blue });
				setPickerActive(false);
				onColorChange?.({ r, g, b });
			}
		};

		const canvasContainer = canvasContainerRef.current;
		if (canvasContainer && isPickerActive) {
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
	}, [onColorChange, isPickerActive]);

	return (
		<div className="relative">
			<div ref={canvasContainerRef}>
				<canvas ref={canvasRef} />
			</div>

			{image && (<>
				<button
					onClick={() => setPickerActive(!isPickerActive)}
					className={`absolute top-5 left-5 bg-white hover:opacity-100 ${isPickerActive ? 'opacity-100' : 'opacity-50'} rounded-md text-md flex items-center p-1 shadow-md transition-opacity duration-300 ease-in-out`}
				>
					<div
						className="w-5 h-5 rounded-full border-1 border-black opacity-1 mr-1"
						style={{ backgroundColor: hoverColor ? RGB.toString(hoverColor) : 'black' }}
					>
					</div>
					<span>Pick Color</span>

				</button>
				<button
					onClick={() => onClearImage?.()}
					className={`absolute top-5 right-5 bg-white hover:opacity-100 opacity-50 rounded-md text-md flex items-center p-1 shadow-md transition-opacity duration-300 ease-in-out`}
				>Reset Image
				</button>
			</>)}
		</div>
	);
}
