import XButton from '@/components/XButton';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    return (
        <div className="relative min-h-screen overflow-hidden">
            <div>
                <img
                    src="/plane.gif"
                    className="absolute left-[60%] top-[10vh] w-[18vw] max-w-[140px] min-w-[70px] animate-bounce rotate-22 md:w-[15vw] md:max-w-[160px]"
                    alt="Spaceship"
                />
            </div>

            <div>
                <img
                    src="/asteroid_1.gif"
                    className="absolute right-[15%] top-[25vh] w-[12vw] max-w-[90px] min-w-[40px] animate-bounce rotate-45 md:w-[10vw] md:max-w-[100px]"
                    alt="Asteroid 1"
                />
            </div>

            <div>
                <img
                    src="/asteroid_2.gif"
                    className="absolute left-[15%] bottom-[20vh] w-[12vw] max-w-[90px] min-w-[40px] animate-bounce rotate-40 md:w-[10vw] md:max-w-[100px]"
                    alt="Asteroid 2"
                />
            </div>

            <div>
                <img
                    src="/alien_ship.gif"
                    className="absolute right-[10%] bottom-[15vh] w-[15vw] max-w-[120px] min-w-[60px] animate-pulse md:w-[12vw] md:max-w-[130px]"
                    alt="Alien Ship"
                />
            </div>

            <div>
                <img
                    src="/mars.png"
                    className="absolute left-[20%] top-[15vh] w-[10vw] max-w-[80px] min-w-[40px] animate-spin-very-slow opacity-70 md:w-[8vw] md:max-w-[90px]"
                    alt="Mars"
                />
            </div>

            <div>
                <img
                    src="/earth.png"
                    className="absolute right-[20%] bottom-[25vh] w-[14vw] max-w-[110px] min-w-[50px] animate-spin-very-slow opacity-80 md:w-[12vw] md:max-w-[120px]"
                    alt="Earth"
                />
            </div>

            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-purple-800/20 via-transparent to-blue-800/20 animate-nebula"></div>
            </div>

            <div className="fixed inset-0 flex items-center justify-center z-10">
                <div className="flex flex-col items-center text-center px-4 sm:px-6 md:px-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-6 sm:mb-8 animate-glow drop-shadow-lg">
                        WELCOME TO XUNBAO
                    </h1>
                    <Link to="/register" className="flex justify-center">
                        <XButton className="px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-semibold transition-colors duration-300 border py-2 px-3 rounded-sm shadow-[3px_4px_0_white] active:shadow-[1px_2px_0_white]">
                            REGISTER
                        </XButton>
                    </Link>
                </div>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-white my-5">
                Made by Manan
            </div>

            <style>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8); }
          50% { text-shadow: 0 0 20px rgba(255, 255, 255, 1); }
        }
        @keyframes spin-very-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-10%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-very-slow { animation: spin-very-slow 30s linear infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-bounce {animation: bounce 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-spin-fast { animation: spin-fast 8s linear infinite; }
      `}</style>
        </div>
    );
}
