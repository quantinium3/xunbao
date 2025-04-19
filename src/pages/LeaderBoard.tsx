import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

type LeaderboardEntry = {
    rank: number;
    userId: string;
    username: string;
    score: number;
};

const LeaderBoard: React.FC = () => {
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch("https://xunback.manantechnosurge.tech/api/leaderboard");
                const json = await response.json();
                if (json.status === "success" && Array.isArray(json.data)) {
                    setData(json.data);
                } else {
                    setError("Invalid data format");
                }
            } catch (err) {
                setError("Failed to fetch leaderboard");
                console.log("Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const currentUserEntry = data.find((entry) => entry.userId === user?.id);
    const currentUserRank = currentUserEntry ? currentUserEntry.rank : null;

    // Function to render medal based on rank
    const renderMedal = (rank: number) => {
        switch (rank) {
            case 1:
                return <span className="text-xl md:text-2xl">🥇</span>;
            case 2:
                return <span className="text-xl md:text-2xl">🥈</span>;
            case 3:
                return <span className="text-xl md:text-2xl">🥉</span>;
            default:
                return rank;
        }
    };

    if (loading) return <p className="text-center p-4">Loading leaderboard...</p>;
    if (error) return <p className="text-center p-4">Error: {error}</p>;

    return (
        <div className="fixed p-2 sm:p-4 w-full h-full z-50 flex items-center justify-center text-white">
            <div className="border p-3 sm:p-4 md:p-5 rounded-md w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl bg-black/50 backdrop-blur-md shadow-[2px_3px_0_white] overflow-auto max-h-[90vh]">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 text-center underline">Leaderboard</h2>
                
                {user && currentUserRank ? (
                    <p className="text-center mb-2 md:mb-4 font-bold text-lg sm:text-xl md:text-2xl">
                        Your Current Rank: {renderMedal(currentUserRank)} {currentUserRank}
                    </p>
                ) : user && !currentUserRank ? (
                    <p className="text-center mb-2 md:mb-4 text-sm sm:text-base">You are not ranked yet.</p>
                ) : null}
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 rounded-md">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm md:text-base">Rank</th>
                                <th className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm md:text-base">Username</th>
                                <th className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm md:text-base">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((entry) => (
                                <tr key={entry.userId} className={entry.userId === user?.id ? "bg-zinc-700/50" : ""}>
                                    <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm md:text-base">
                                        {renderMedal(entry.rank)} {entry.rank > 3 ? entry.rank : ""}
                                    </td>
                                    <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm md:text-base truncate max-w-[100px] sm:max-w-none">
                                        {entry.username}
                                    </td>
                                    <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm md:text-base">
                                        {entry.score}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaderBoard;
