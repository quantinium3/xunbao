import { createFileRoute } from '@tanstack/react-router';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { useLeaderboard } from '../hooks/quizHooks';

export const Route = createFileRoute('/leaderboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-black border border-white rounded-lg shadow-lg p-6 w-full max-w-md text-white">
        <h2 className="text-xl font-bold mb-4 text-center">Leaderboard</h2>
        <SignedOut>
          <p className="text-center">Please sign in to view the leaderboard.</p>
          <SignInButton mode="modal">
            <button className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-[3px_4px_0_white]">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          {isLoading ? (
            <p className="text-center">Loading leaderboard...</p>
          ) : leaderboard && leaderboard.length > 0 ? (
            <ul className="space-y-2">
              {leaderboard.map((entry, index) => (
                <li key={index} className="flex justify-between border-b border-gray-700 pb-1">
                  <span>{index + 1}. {entry.username}</span>
                  <span className="font-bold">{entry.score}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center">No scores recorded yet.</p>
          )}
        </SignedIn>
      </div>
    </div>
  );
}
