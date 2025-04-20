export const Whatsapp = () => {
    const handleRedirect = () => {
        window.location.href = "https://chat.whatsapp.com/KEL3vs60wAqKzcnctxlTSL";
    };

    return (
        <div className="fixed h-full w-full z-30">
        <div className="min-h-screen flex justify-center items-center px-6">
            <button
                onClick={handleRedirect}
                className="border py-3 px-6 rounded bg-green-500 text-white text-xl shadow-[3px_4px_0_white] hover:bg-green-600 transition"
            >
                Message on WhatsApp
            </button>
        </div>
        </div>
    );
};

