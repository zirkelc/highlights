import { ChangeEvent, DragEvent, useState } from "react";

export interface ImageUploadProps {
	onUpload: (file: File) => void;
}

let draggingCounter = 0;

/**
 * @see https://github.com/btmnk/image-color-picker
 */
export function ImageUpload(props: ImageUploadProps) {
	const { onUpload } = props;

	const [hasError, setHasError] = useState(false);
	const [error, setError] = useState<string>();
	const [isHovering, setIsHovering] = useState(false);

	const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
		draggingCounter++;
		event.preventDefault();
		event.stopPropagation();
		if (!isHovering) {
			setIsHovering(true);
		}
	};

	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setError(undefined);
		const transferItems = event.dataTransfer.items;
		if (transferItems.length > 1) {
			setError("Only one file is allowed!");
		}
	};

	const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
		draggingCounter--;
		event.preventDefault();
		event.stopPropagation();
		setError(undefined);
		if (draggingCounter === 0 && isHovering) {
			setIsHovering(false);
		}
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		if (hasError) return;
		event.preventDefault();
		event.stopPropagation();
		const [transferItem] = event.dataTransfer.items;
		if (transferItem.kind !== "file") return;
		const targetFile = transferItem.getAsFile();
		if (!targetFile) return;
		onUpload(targetFile);
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const [targetFile] = event.target.files ?? [];

		if (targetFile) {
			onUpload(targetFile);
		}
	};

	return (
		<div
			className="h-full font-mono"
			onDrop={handleDrop}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
		>
			<label>
				<p>Click here to choose a file or drag and drop it here</p>

				<div>
					<input type="file" onChange={handleInputChange} />
				</div>
			</label>
		</div>
	);
}
