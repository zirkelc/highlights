import React from 'react';
import type { Block, Line, Page, Paragraph, RecognizeResult, Word, Symbol } from 'tesseract.js';
import { HSV, RGB } from '../libs/color';
import { Progress } from './Progress';

type HighlightMode = 'word' | 'symbol';

type Props = {
  result?: RecognizeResult;
  highlightColor?: HSV;
};

export function TextRenderer({ result, highlightColor }: Props) {
  const [highlightMode, setHighlightMode] = React.useState<HighlightMode>('word');


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
    return highlightMode === 'word' ? (
      <span
        id={word.id}
        key={word.id}
        className={`${word.is_highlighted ? 'highlighted' : ''}`}
      >
        {word.text}{' '}
      </span>
    ) : (
      <span id={word.id} key={word.id}>
        {word.symbols?.map(renderSymbol)}{' '}
      </span>
    );
  };

  const renderSymbol = (symbol: Symbol, index: number) => {
    return (
      <span id={symbol.id} key={symbol.id} className={`${symbol.is_highlighted ? 'highlighted' : ''}`}>
        {symbol.text}
      </span>
    );
  };

  // TODO on word or symbol hover, hightlight the bounding box in the image
  // TODO add bounding boxes on the image and on hover highlight the text

  return (
    <div className="w-full h-full">
      <style>{`
				.highlighted {
					background-color: ${highlightColor ? HSV.toString(highlightColor) : 'inherit'}
				}
			`}</style>

      <div className="inline-flex rounded-lg shadow-2xs">
        <button 
          type="button" 
          className={`py-1 px-2 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-xs font-medium focus:z-10 border border-gray-200 shadow-2xs focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none ${
            highlightMode === 'word' 
              ? 'bg-black text-white dark:bg-black dark:text-white' 
              : 'bg-white text-black dark:bg-white dark:text-black'
          }`}
          onClick={() => setHighlightMode('word')}>
          Word
        </button>
        <button 
          type="button" 
          className={`py-1 px-2 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-xs font-medium focus:z-10 border border-gray-200 shadow-2xs focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none ${
            highlightMode === 'symbol' 
              ? 'bg-black text-white dark:bg-black dark:text-white' 
              : 'bg-white text-black dark:bg-white dark:text-black'
          }`}
          onClick={() => setHighlightMode('symbol')}>
          Symbol
        </button>
      </div>

      {result ? (
        <div className="font-mono">{renderPage(result.data)}</div>
      ) : (
        <div className="flex items-center justify-center">
          <p className="text-xl font-bold font-mono text-gray-400">No image uploaded yet</p>
        </div>
      )}
    </div>
  );
}
