import React from "react";
import { Block, Line, Page, Paragraph, RecognizeResult, Word } from "tesseract.js";

const renderPage = (page: Page) => {
	return (
		<div className="ocr_page">
			{page.blocks?.map(renderBlock)}
		</div>
	);
}

const renderBlock = (block: Block, index: number) => {
	return (
		<div id={block.id} key={block.id} className="ocr_carea">
			{block.paragraphs?.map((p, i) => renderParagraph(p, i))}
		</div>
	);
}

const renderParagraph = (paragraph: Paragraph, index: number) => {
	return (
		<p id={paragraph.id} key={paragraph.id} className="ocr_par">
			{paragraph.lines?.map(renderLine)}
		</p>
	);
}

const renderLine = (line: Line, index: number) => {
	return (
		<span id={line.id} key={line.id} className="ocr_line">
			{line.words?.map(renderWord)}
		</span>
	);
}

const renderWord = (word: Word, index: number) => {
	return (
		<span id={word.id} key={word.id} className={`ocrx_word ${word.is_highlighted ? 'bg-yellow-400' : 'bg-inherit'}`}>
			{word.text}{' '}
		</span>
	);
}

type Props = {
	result?: RecognizeResult;
}

export function TextRenderer({ result }: Props) {
	return (
		<div className='w-full h-full'>
			{result ? renderPage(result.data) : (
				<div className="flex items-center justify-center w-full h-full">
					<p className="text-4xl font-bold text-gray-400">No image uploaded</p>
				</div>
			)}
		</div>
	);
}