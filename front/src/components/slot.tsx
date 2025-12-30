import { FakeCaret } from "./caret";
import { cn } from "../lib/ui";
import type { SlotProps } from 'input-otp'

export function Slot(props: SlotProps) {
	return (
		<div
			className={cn(
				'relative w-8 h-12 text-[2rem]',
				'flex items-center justify-center',
				'transition-all duration-300',
				'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
				'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
				'outline-0 outline-accent-foreground/20',
				{ 'outline-4 outline-accent-foreground': props.isActive },
			)}
		>
			<div className="group-has-[input[data-input-otp-placeholder-shown]]:opacity-20">
				{props.char ?? props.placeholderChar}
			</div>
			{props.hasFakeCaret && <FakeCaret />}
		</div>
	)
}
