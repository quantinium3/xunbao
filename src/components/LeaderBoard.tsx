interface LeaderBoardEntry {
  userId: string;
  rank: number;
  username: string;
  score: number;
}

interface LeaderBoardProps {
  LeaderBoard: LeaderBoardEntry[];
  timeLeft: string | number;
  clerkUserId: string;
}

const LeaderBoard = ({ LeaderBoard, timeLeft, clerkUserId }: LeaderBoardProps) => {
  const sortedLeaderBoard = [...LeaderBoard].sort((a, b) => a.rank - b.rank);

  const userEntry = sortedLeaderBoard.find((entry) => entry.userId === clerkUserId);
  const userRank = userEntry ? userEntry.rank : "N/A";

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center px-4 text-white overflow-auto">
      <div className="relative border p-5 rounded-md max-w-3xl w-full text-center backdrop-blur bg-black/50">
        <div className="max-w-prose mx-auto">
          <h2 className="font-bold underline text-3xl">LeaderBoard</h2>
          <h2 className="font-bold underline text-xl mt-5">Your Position is {userRank}</h2>
          <div className="text-sm mt-4">Next question in {timeLeft}</div>
        </div>

        <div className="mt-5 max-h-[60vh] overflow-y-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-black/70 backdrop-blur">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-center border"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-center border"
                >
                  Player
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {sortedLeaderBoard.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm text-center">
                    No leaderboard data available
                  </td>
                </tr>
              ) : (
                sortedLeaderBoard.map((entry: LeaderBoardEntry) => (
                  <tr
                    key={entry.userId}
                    className={entry.userId === clerkUserId ? "bg-zinc-200/20" : ""}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      #{entry.rank}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
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

