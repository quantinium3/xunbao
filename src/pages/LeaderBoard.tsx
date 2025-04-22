import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface LeaderboardEntry {
  userId: string;
  rank: number;
  username: string;
  score: number;
}

const LeaderBoard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<string | number>("N/A");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const clerkUserId = user?.id || "";
  const navigate = useNavigate();

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!clerkUserId) {
        throw new Error("User not authenticated. Please sign in.");
      }

      const response = await fetch(`https://xunback.manantechnosurge.tech/api/leaderboard/${clerkUserId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      if (
        json.status === "success" &&
        json.data &&
        Array.isArray(json.data.leaderboard) &&
        json.data.user
      ) {
        setLeaderboard(json.data.leaderboard);
        setUserRank(json.data.user.rank ?? "N/A");
      } else {
        console.error("Invalid API response:", json);
        throw new Error("Invalid data format received from server");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [clerkUserId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center px-4 text-white bg-black/50">
        <div className="text-center p-5 rounded-md bg-black/70 backdrop-blur">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  if (!clerkUserId) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center px-4 text-white bg-black/50">
        <div className="text-center p-5 rounded-md bg-black/70 backdrop-blur">
          <p>Please sign in to view the leaderboard</p>
          <button
            onClick={() => navigate("/signin")}
            className="mt-3 px-4 py-2 border rounded-md hover:bg-zinc-300/20"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center px-4 text-white bg-black/50">
        <div className="text-center p-5 rounded-md bg-black/70 backdrop-blur text-red-400">
          <p>Error: {error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-3 px-4 py-2 border rounded-md hover:bg-zinc-300/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center px-4 text-white overflow-auto">
      <div className="relative border p-5 rounded-md max-w-3xl w-full text-center backdrop-blur bg-black/50">
        <div className="max-w-prose mx-auto">
          <h2 className="font-bold underline text-xl lg:text-3xl">Leaderboard</h2>
          <h2 className="font-bold underline text-lg lg:text-xl mt-5">Your Position is {userRank}</h2>
        </div>

        <div className="mt-5 max-h-[60vh] overflow-y-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-black/70 backdrop-blur">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-center border">
                  Rank
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-center border">
                  Player
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm text-center">
                    No leaderboard data available
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={entry.userId === clerkUserId ? "bg-zinc-200/20" : ""}
                  >
                    <td className="border px-4 py-3 whitespace-nowrap text-sm font-medium text-center">
                      #{entry.rank}
                    </td>
                    <td className="border px-4 py-3 whitespace-nowrap text-sm text-center">
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
