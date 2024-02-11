type Props = {
	progress?: number;
	status?: string;
};
export function Progress({ progress, status }: Props) {
	const percentage = progress ? `${Math.round(progress * 100)}%` : undefined;
	return (
		<>
			<div className="flex justify-between mb-1">
				<span className="text-base font-medium text-black">{status ?? ""}</span>
				<span className="text-sm font-medium text-black">
					{percentage ?? ""}
				</span>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-2.5">
				<div
					className="bg-black h-2.5 rounded-full"
					style={{ width: percentage }}
				/>
			</div>
		</>
	);
}
