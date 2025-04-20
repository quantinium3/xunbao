import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

const Quiz = () => {
    return (
        <div className="min-h-screen flex justify-center items-center px-6">
            <div className="w-full max-w-xl text-center">
                <SignedOut>
                    <div className="flex flex-col border rounded-xl p-6 gap-6 text-white bg-black/50 backdrop-blur-sm">
                        <p>Please sign in to view the quiz.</p>
                        <SignInButton mode="modal">
                            <button className="border py-2 px-4 rounded bg-blue-500 text-white shadow-[3px_4px_0_white]">
                                Sign In
                            </button>
                        </SignInButton>
                    </div>
                </SignedOut>
                <SignedIn>
                    <div className="text-white text-2xl bg-black/50 backdrop-blur-sm border rounded-xl p-10">
                        No questions — please come back later.
                    </div>
                </SignedIn>
            </div>
        </div>
    );
};

export default Quiz;
