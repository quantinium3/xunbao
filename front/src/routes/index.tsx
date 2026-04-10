import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: Index,
})

function Index() {
	const nav = useNavigate();
	return (
		<div className="flex justify-center h-screen lg:h-[66vh] flex-col space-y-2 px-4 pt-10">
			<h1 className="text-yellow-50 text-5xl sm:text-6xl md:text-[clamp(80px,15vw,130px)] font-enchanted-land text-center [text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">
				Thanks for playing Xunbao
			</h1>
			<img src="/assets/border.webp" alt="" className="w-40 md:w-125 mx-auto -mt-2 md:-mt-5 sepia hue-rotate-30" />
			<div className="flex gap-6 flex-col items-center mt-4">
				<button
					className="group relative text-xl sm:text-2xl md:text-5xl text-yellow-50 transition-all duration-300 hover:scale-103 font-bold [text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000] backdrop-blur-xl"
					onClick={() => nav({ to: "/leaderboard" })}
				>
					<img src="/assets/button-outline.webp" alt="" className="w-40 md:w-56 group-hover:scale-110 transition-transform sepia-[0.3] hue-rotate-30 group-hover:sepia-[0.5] group-hover:hue-rotate-40deg" />
					<span className="absolute inset-0 flex items-center justify-center group-hover:text-yellow-100 transition-colors">Leaderboard</span>
				</button>
			</div>
		</div>
	)
}

export default Index
