import React, { useState } from 'react';
import { Trophy, RotateCcw, Play, Sun, CloudRain } from 'lucide-react';
import {
  clearLeaderboard,
  restoreSampleLeaderboard,
  type LeaderboardEntry,
  type RoundMode,
} from '../utils/leaderboard';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  onEntriesChange: (next: LeaderboardEntry[]) => void;
  onPlayNow: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  onEntriesChange,
  onPlayNow,
}) => {
  const [modeFilter, setModeFilter] = useState<'all' | RoundMode>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered =
    modeFilter === 'all' ? entries : entries.filter((e) => e.mode === modeFilter);
  const topThree = filtered.slice(0, 3);

  const handleClearConfirm = () => {
    const empty = clearLeaderboard();
    onEntriesChange(empty);
    setConfirmClear(false);
  };

  const handleRestoreSample = () => {
    const sample = restoreSampleLeaderboard();
    onEntriesChange(sample);
    setConfirmClear(false);
  };

  return (
    <section className="mx-auto max-w-[1100px] px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-700">
            班级积分榜 · Class Leaderboard
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
            英语跟读小达人排行榜
          </h1>
          <p className="text-slate-600 text-base">
            记录每位同学在课堂上点击太阳与雨云、大声跟读单词的积分成绩。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(['all', '60s', '90s', 'free'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModeFilter(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  modeFilter === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m === 'all' ? '全部场次' : m === 'free' ? '自由点读' : `${m} 挑战`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onPlayNow}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            开始新一轮
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topThree.map((item, idx) => {
            const medalStyles =
              idx === 0
                ? 'border-amber-300 bg-amber-50/60'
                : idx === 1
                ? 'border-slate-300 bg-slate-50'
                : 'border-orange-200 bg-orange-50/40';
            const rankText = idx === 0 ? '第 1 名 · 金牌之星' : idx === 1 ? '第 2 名 · 银牌之星' : '第 3 名 · 铜牌之星';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 shadow-sm flex flex-col justify-between gap-4 ${medalStyles}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{rankText}</span>
                  <Trophy
                    className={`w-5 h-5 ${
                      idx === 0
                        ? 'text-amber-500'
                        : idx === 1
                        ? 'text-slate-500'
                        : 'text-orange-500'
                    }`}
                  />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 truncate">
                    {item.studentName}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 tabular-nums">
                    点读 {item.wordsCaught} 次 · 跟读打卡 {item.readAloudCount} 次
                  </p>
                </div>
                <div className="flex items-baseline justify-between pt-3 border-t border-slate-200/80">
                  <span className="text-xs font-medium text-slate-500">
                    {item.mode === 'free' ? '自由点读' : `${item.mode} 挑战赛`}
                  </span>
                  <span className="font-display text-3xl font-bold text-slate-900 tabular-nums">
                    {item.score} <span className="text-sm font-sans font-medium text-slate-500">分</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <p className="font-display text-xl font-semibold text-slate-800">
              当前还没有积分记录
            </p>
            <p className="text-sm text-slate-500">
              开始一局游戏并让孩子们点击太阳与雨云跟读，分数会自动保存在这里。
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onPlayNow}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors cursor-pointer"
              >
                去玩一局
              </button>
              <button
                type="button"
                onClick={handleRestoreSample}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                载入示例成绩
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500">
                  <th className="py-3.5 px-5 w-20">名次</th>
                  <th className="py-3.5 px-5">学生 / 小组</th>
                  <th className="py-3.5 px-5">晴雨统计</th>
                  <th className="py-3.5 px-5 text-right">跟读打卡</th>
                  <th className="py-3.5 px-5 text-right">模式</th>
                  <th className="py-3.5 px-5 text-right">总得分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((row, index) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-display font-bold text-slate-700 tabular-nums">
                      #{index + 1}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {row.studentName}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 tabular-nums">
                      <span className="inline-flex items-center gap-1 text-amber-700 mr-3">
                        <Sun className="w-3.5 h-3.5" />
                        {row.sunnyCount}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sky-700">
                        <CloudRain className="w-3.5 h-3.5" />
                        {row.rainyCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-slate-700 tabular-nums">
                      {row.readAloudCount} 次
                    </td>
                    <td className="py-3.5 px-5 text-right text-slate-500">
                      {row.mode === 'free' ? '自由模式' : row.mode}
                    </td>
                    <td className="py-3.5 px-5 text-right font-display text-lg font-bold text-slate-900 tabular-nums">
                      {row.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Teacher Reset Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-sm text-slate-500">
        <span>成绩保存在当前课堂浏览器中，支持课前清空或重新载入示例。</span>
        <div className="flex items-center gap-3">
          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空排行榜
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-700 font-medium">确认清空全部成绩？</span>
              <button
                type="button"
                onClick={handleClearConfirm}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                确认清空
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
