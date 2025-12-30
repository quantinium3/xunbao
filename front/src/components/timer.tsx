import { useEffect, useMemo, useState } from "react";

interface TimerProps {
	shownAt: string;
	stoppedAt?: number | null;
}

export function Timer({ shownAt, stoppedAt }: TimerProps) {
	const [currentTime, setCurrentTime] = useState(() => Date.now());
	const startTime = useMemo(() => new Date(shownAt).getTime(), [shownAt]);
	useEffect(() => {
		if (stoppedAt) {
			return;
		}
		const interval = setInterval(() => {
			setCurrentTime(Date.now());
		}, 100);

		return () => clearInterval(interval);
	}, [stoppedAt]);

	const elapsed = stoppedAt
		? Math.max(0, stoppedAt - startTime)
		: Math.max(0, currentTime - startTime);

	const seconds = (elapsed / 1000).toFixed(1);

	return (
		<div className="text-center">
			<div className="text-sm text-gray-300 mb-1">Time</div>
			<div className="text-2xl font-bold font-mono">{seconds}s</div>
		</div>
	);
}
