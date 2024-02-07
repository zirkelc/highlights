import React from "react";
import {
	Block,
	Line,
	Page,
	Paragraph,
	RecognizeResult,
	Word,
} from "tesseract.js";
import { HSV, RGB } from "../libs/color";
import { Progress } from "./Progress";

const renderPage = (page: Page) => {
	return <div>{page.blocks?.map(renderBlock)}</div>;
};

const renderBlock = (block: Block, index: number) => {
	return (
		<div id={block.id} key={block.id}>
			{block.paragraphs?.map((p, i) => renderParagraph(p, i))}
		</div>
	);
};

const renderParagraph = (paragraph: Paragraph, index: number) => {
	return (
		<p id={paragraph.id} key={paragraph.id}>
			{paragraph.lines?.map(renderLine)}
		</p>
	);
};

const renderLine = (line: Line, index: number) => {
	return (
		<span id={line.id} key={line.id}>
			{line.words?.map(renderWord)}
		</span>
	);
};

const renderWord = (word: Word, index: number) => {
	return (
		<span
			id={word.id}
			key={word.id}
			className={`${word.is_highlighted ? 'highlighted' : ''}`}
		>
			{word.text}{" "}
		</span>
	);
};

type Props = {
	loading?: boolean;
	progress?: number;
	result?: RecognizeResult;
	highlightColor?: HSV;
};

export function TextRenderer({ progress, result, highlightColor }: Props) {
	const loading = progress && progress < 1;
	return (
		<div className="w-full h-full">
			{progress === 1 ? (<style>{`
				.highlighted {
					background-color: ${highlightColor ? HSV.toString(highlightColor) : "inherit"}
				}
			`}</style>) : (<Progress progress={progress} />
			)}

			{result ? (
				<div className="font-mono">
					{renderPage(result.data)}
				</div>
			) : (
				<div className="flex items-center justify-center">
					<p className="text-xl font-bold font-mono text-gray-400">No image uploaded yet</p>
				</div>
			)}
		</div>
	);
}
