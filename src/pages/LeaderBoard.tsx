import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

interface LeaderboardEntry {
  userId: string;
  rank: number;
  username: string;
  score: number;
}

const LeaderBoard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const clerkUserId = user?.id || "";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("https://xunback.manantechnosurge.tech/api/leaderboard");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setLeaderboard(json.data);
        } else {
          setError("Invalid data format");
        }
      } catch (err) {
        setError("Failed to fetch leaderboard");
        console.error("Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Sort leaderboard by rank
  const sortedLeaderboard = [...leaderboard].sort((a, b) => a.rank - b.rank);
  
  // Find current user's entry
  const userEntry = sortedLeaderboard.find((entry) => entry.userId === clerkUserId);
  const userRank = userEntry ? userEntry.rank : "N/A";

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 text-white">
      <div className="text-center p-5">Loading leaderboard...</div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 text-white">
      <div className="text-center p-5 text-red-400">Error: {error}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 text-white overflow-auto">
      <div className="relative border p-5 rounded-md max-w-3xl w-full text-center backdrop-blur bg-black/50">
        <div className="max-w-prose mx-auto">
          <h2 className="font-bold underline text-3xl">Leaderboard</h2>
          <h2 className="font-bold underline text-xl mt-5">Your Position is {userRank}</h2>
        </div>
        
        <div className="mt-5 max-h-[60vh] overflow-y-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-black backdrop-blur">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-center border">
                  Rank
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-center border">
                  Player
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm text-center">
                    No leaderboard data available
                  </td>
                </tr>
              ) : (
                sortedLeaderboard.map((entry: LeaderboardEntry) => (
                  <tr
                    key={entry.userId}
                    className={entry.userId === clerkUserId ? "bg-zinc-200/20" : ""}
                  >
                    <td className="border px-4 py-3 whitespace-nowrap text-sm font-medium">
                      #{entry.rank}
                    </td>
                    <td className="border px-4 py-3 whitespace-nowrap text-sm">
                      {entry.username}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;
