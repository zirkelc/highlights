export type ColorRange<T> = {
	current: T;
	lower: T;
	upper: T;
};

export type RGB = {
	r: number; // 0-255
	g: number; // 0-255
	b: number; // 0-255
};

export type HSV = {
	h: number; // 0-360
	s: number; // 0-100
	v: number; // 0-100
};

export type Scale = [number, number, number];

export type Range<T> = [T, T];

export type Norm = [number, number, number];

export const RGB = {
	black: { r: 0, g: 0, b: 0 },
	white: { r: 255, g: 255, b: 255 },

	/**
	 * @see https://gist.github.com/mjackson/5311256
	 */
	toHSV({ r, g, b }: RGB): HSV {
		r /= 255;
		g /= 255;
		b /= 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;

		let h = 0;
		const s = max === 0 ? 0 : d / max;
		const v = max;

		if (max === min) {
			h = 0; // achromatic
		} else {
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}

			h /= 6;
		}

		return {
			h: Math.round(h * 360),
			s: Math.round(s * 100),
			v: Math.round(v * 100),
		};
	},

	toString({ r, g, b }: RGB): string {
		return `rgb(${r}, ${g}, ${b})`;
	},
};

export const HSV = {
	black: { h: 0, s: 0, v: 0 },
	white: { h: 0, s: 0, v: 100 },

	/**
	 * @see https://gist.github.com/mjackson/5311256
	 */
	toRGB({ h, s, v }: HSV): RGB {
		h /= 360;
		s /= 100;
		v /= 100;

		let r = 0;
		let g = 0;
		let b = 0;

		const i = Math.floor(h * 6);
		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			case 5:
				r = v;
				g = p;
				b = q;
				break;
		}

		return {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255),
		};
	},

	range({ h, s, v }: HSV, [scaleH, scaleS, scaleV]: Scale): Range<HSV> {
		let lowH = h * (1 - scaleH / 100);
		if (lowH < 0) lowH += 360;

		const low = {
			h: lowH,
			s: Math.max(0, s * (1 - scaleS / 100)),
			v: Math.max(0, v * (1 - scaleV / 100)),
		};

		const highH = (h * (1 + scaleH / 100)) % 360;

		const high = {
			h: highH,
			s: Math.min(100, s * (1 + scaleS / 100)),
			v: Math.min(100, v * (1 + scaleV / 100)),
		};

		return [low, high];
	},

	normalize({ h, s, v }: HSV, [normH, normS, normV]: Norm): HSV {
		const factorH = normH / 360;
		const factorS = normS / 100;
		const factorV = normV / 100;

		const normalizedH = Math.min(h * factorH, normH);
		const normalizedS = Math.min(s * factorS, normS);
		const normalizedV = Math.min(v * factorV, normV);

		return {
			h: Math.round(normalizedH),
			s: Math.round(normalizedS),
			v: Math.round(normalizedV),
		};
	},

	toString({ h, s, v }: HSV): string {
		const rgb = HSV.toRGB({ h, s, v });

		return RGB.toString(rgb);
	},
};
