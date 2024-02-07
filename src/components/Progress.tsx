type Props = {
	progress?: number;
};
export function Progress({ progress }: Props) {
	if (progress === undefined) return null;

	if (progress === 1) return null;

	return (<>
		<div className="flex justify-between mb-1">
			<span className="text-base font-medium text-blue-700 dark:text-white">Flowbite</span>
			<span className="text-sm font-medium text-blue-700 dark:text-white">45%</span>
		</div>
		<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
			<div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress * 100}%` }}></div>
		</div>
	</>);
}