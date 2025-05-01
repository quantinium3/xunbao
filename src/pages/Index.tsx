const Index = () => {
    return (
        <>
            <div className="absolute inset-0 opacity-30 pointer-events-none z-10 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-purple-800/20 via-transparent to-blue-800/20 animate-nebula"></div>
            </div>

            <div className="fixed inset-0 flex items-center justify-center z-10">
                <div className="flex flex-col items-center text-center px-4 sm:px-6 md:px-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-6 sm:mb-8 animate-glow drop-shadow-lg mx-auto">
                        Thank You for Participating in XUNBAO. Results will be released soon
                    </h1>
                </div>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-white my-5 text-center">
                Made by Manan
            </div>
        </>
    )
}

export default Index
