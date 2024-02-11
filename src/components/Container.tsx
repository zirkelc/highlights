import React from "react";

type Props = {
	children?: React.ReactNode;
};

export const Container = React.forwardRef<HTMLDivElement, Props>(
	({ children }, ref) => {
		return (
			<div
				ref={ref}
				className="p-4 bg-white border-gray-200 border rounded-lg shadow-sm"
			>
				{children}
			</div>
		);
	},
);
