import React from "react";


type CarouselItemProps = {
	active?: boolean;
	children?: React.ReactNode;
};

export function CarouselItem({ active, children }: CarouselItemProps) {
	return (
		<div className={`${active ? '' : 'hidden'} duration-700 ease-in-out`}>
			{children}
		</div>
	);
}

type CarouselProps = {
	children: Array<React.ReactElement<CarouselItemProps> | null>;
};





export function Carousel({ children }: CarouselProps) {
	const lastIndex = children.filter(child => React.isValidElement(child)).length - 1;
	const [activeIndex, setActiveIndex] = React.useState(0);
	// console.log(children.length, lastIndex);

	// const items = children
	// 	.filter((child): child is React.ReactElement<CarouselItemProps> => React.isValidElement<CarouselItemProps>(child))
	// 	.map((child, index) => {
	// 		return React.cloneElement(child, {
	// 			key: index,
	// 			active: activeIndex === 0,
	// 		});
	// 	});
	// console.log(items);

	const next = () =>
		setActiveIndex((prev) => (prev === lastIndex ? 0 : prev + 1));


	const prev = () =>
		setActiveIndex((prev) => (prev === 0 ? lastIndex : prev - 1));


	return (
		<div className="relative w-full" >
			<div className="overflow-hidden rounded-lg">
				{React.Children.map(children, (child, index) => React.isValidElement(child) ? React.cloneElement(child, { active: activeIndex === index }) : null)}

				{/* {items.map((item, index) => (<div className={`hidden duration-700 ease-in-out ${index === 0 ? 'active' : ''}`} data-carousel-item>{item}</div>))} */}
				{/* <div className="hidden duration-700 ease-in-out" data-carousel-item>
					<img src="/docs/images/carousel/carousel-1.svg" className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..." />
				</div>
				<div className="hidden duration-700 ease-in-out" data-carousel-item="active">
					<img src="/docs/images/carousel/carousel-2.svg" className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..." />
				</div>
				<div className="hidden duration-700 ease-in-out" data-carousel-item>
					<img src="/docs/images/carousel/carousel-3.svg" className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..." />
				</div>
				<div className="hidden duration-700 ease-in-out" data-carousel-item>
					<img src="/docs/images/carousel/carousel-4.svg" className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..." />
				</div>
				<div className="hidden duration-700 ease-in-out" data-carousel-item>
					<img src="/docs/images/carousel/carousel-5.svg" className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..." />
				</div> */}
			</div>
			<button
				type="button"
				className="absolute top-1/2 -translate-y-2/4 start-0 z-30 px-4 cursor-pointer group focus:outline-none"
				onClick={prev}
			>
				<span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
					<svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4" />
					</svg>
				</span>
			</button>

			<button
				type="button"
				className="absolute top-1/2 -translate-y-2/4 end-0 z-30 px-4 cursor-pointer group focus:outline-none"
				onClick={next}
			>
				<span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
					<svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
					</svg>
				</span>
			</button>
		</div>

	);
}