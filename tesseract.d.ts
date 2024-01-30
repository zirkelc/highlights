import { Block, Paragraph, Line, Word } from "tesseract.js";

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