import { useState } from 'react';
import { GameStage } from './components/GameStage';
import { WordCardsView } from './components/WordCardsView';
import { LeaderboardView } from './components/LeaderboardView';
import { TeacherGuideView } from './components/TeacherGuideView';
import { getLeaderboard, type LeaderboardEntry } from './utils/leaderboard';
import { audioEngine } from './utils/audioEngine';
import type { WeatherType } from './data/animals';

type ActiveTab = 'game' | 'cards' | 'leaderboard' | 'guide';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('game');
  const [weatherPreset, setWeatherPreset] = useState<'both' | WeatherType>('both');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => getLeaderboard());

  const handleNavigate = (tab: ActiveTab) => {
    if (tab !== 'game') {
      audioEngine.stopMusic();
    }
    setActiveTab(tab);
  };

  const handleStartWithWeather = (filter: 'both' | WeatherType) => {
    setWeatherPreset(filter);
    setActiveTab('game');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigate('game')}
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sunny &amp; Rainy Zoo
          </button>

          {/* Zone 2: Clean Single-Line Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => handleNavigate('game')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'game'
                  ? 'text-slate-900 border-teal-600 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              游戏舞台
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('cards')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'cards'
                  ? 'text-slate-900 border-teal-600 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              单词词卡
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('leaderboard')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'leaderboard'
                  ? 'text-slate-900 border-teal-600 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              分数排行榜
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('guide')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'guide'
                  ? 'text-slate-900 border-teal-600 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              备课指南
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() =>
                handleNavigate(activeTab === 'leaderboard' ? 'game' : 'leaderboard')
              }
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {activeTab === 'leaderboard' ? '返回游戏' : '查看排行榜'}
            </button>
          </div>
        </div>

        {/* Mobile quick nav row (hidden on desktop) */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-100 px-2 py-2 text-xs font-medium text-slate-600">
          {(
            [
              { id: 'game', label: '游戏' },
              { id: 'cards', label: '词卡' },
              { id: 'leaderboard', label: '排行榜' },
              { id: 'guide', label: '指南' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'game' && (
          <GameStage
            initialWeatherFilter={weatherPreset}
            leaderboard={leaderboard}
            onLeaderboardUpdate={setLeaderboard}
            onOpenLeaderboard={() => handleNavigate('leaderboard')}
          />
        )}

        {activeTab === 'cards' && (
          <WordCardsView onStartGameWithFilter={handleStartWithWeather} />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            entries={leaderboard}
            onEntriesChange={setLeaderboard}
            onPlayNow={() => handleNavigate('game')}
          />
        )}

        {activeTab === 'guide' && (
          <TeacherGuideView
            onStartGame={() => handleNavigate('game')}
            onOpenWordCards={() => handleNavigate('cards')}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1380px] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Sunny &amp; Rainy Zoo · 小学英语晴雨动物词汇课堂工具</span>
          <span>支持电脑白板与平板触屏点读 · 词库共 12 个核心动物单词</span>
        </div>
      </footer>
    </div>
  );
}
