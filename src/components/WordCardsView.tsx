import React, { useState } from 'react';
import { Volume2, Sun, CloudRain } from 'lucide-react';
import { ANIMAL_WORDS, type AnimalWord, type WeatherType } from '../data/animals';
import { AnimalIllustration } from './AnimalArtwork';
import { audioEngine, type SpeechMode } from '../utils/audioEngine';

interface WordCardsViewProps {
  onStartGameWithFilter?: (weatherFilter: 'both' | WeatherType) => void;
}

export const WordCardsView: React.FC<WordCardsViewProps> = ({ onStartGameWithFilter }) => {
  const [filter, setFilter] = useState<'all' | WeatherType>('all');
  const [speechMode, setSpeechMode] = useState<SpeechMode>('phrase');
  const [activeId, setActiveId] = useState<string | null>(null);

  const visibleAnimals =
    filter === 'all' ? ANIMAL_WORDS : ANIMAL_WORDS.filter((a) => a.weather === filter);

  const handleCardSpeak = (animal: AnimalWord) => {
    setActiveId(animal.id);
    audioEngine.playCatchSfx(animal.weather);
    audioEngine.speakAnimal(animal.word, animal.weather, animal.sentence, speechMode);
  };

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-8 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm font-semibold text-amber-700">
            备课词卡 · Vocabulary Preview
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-balance">
            Sunny Day &amp; Rainy Day 动物词库
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            上课热身时可点击任意动物卡片带全班齐读。点击「Sunny Day」或「Rainy Day」可单独练习对应天气的 6 个核心单词。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Weather Filter Tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 (12)
            </button>
            <button
              type="button"
              onClick={() => setFilter('sunny')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'sunny'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-4 h-4" />
              Sunny Day (6)
            </button>
            <button
              type="button"
              onClick={() => setFilter('rainy')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'rainy'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              Rainy Day (6)
            </button>
          </div>

          {/* Speech Mode Switch */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSpeechMode('word')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                speechMode === 'word'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              单词跟读
            </button>
            <button
              type="button"
              onClick={() => setSpeechMode('phrase')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                speechMode === 'phrase'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              天气短语
            </button>
            <button
              type="button"
              onClick={() => setSpeechMode('sentence')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                speechMode === 'sentence'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              完整句型
            </button>
          </div>
        </div>
      </div>

      {/* Weather Theme Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm flex flex-col sm:flex-row items-stretch">
          <div className="sm:w-44 h-40 sm:h-auto shrink-0 bg-amber-50">
            <img
              src="/src/assets/images/sunny_day_card_art_1795428013187.jpg"
              alt="Sunny Day meadow illustration"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                <Sun className="w-4 h-4" />
                <span>Sunny Day · 晴天小动物</span>
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
                阳光草地里的好朋友
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Bee · Butterfly · Rabbit · Bird · Dog · Cat
              </p>
            </div>
            {onStartGameWithFilter && (
              <button
                type="button"
                onClick={() => onStartGameWithFilter('sunny')}
                className="self-start px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                只练 Sunny Day 词组
              </button>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm flex flex-col sm:flex-row items-stretch">
          <div className="sm:w-44 h-40 sm:h-auto shrink-0 bg-sky-50">
            <img
              src="/src/assets/images/rainy_day_card_art_1795428012755.jpg"
              alt="Rainy Day pond illustration"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
                <CloudRain className="w-4 h-4" />
                <span>Rainy Day · 雨天小动物</span>
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
                雨天池塘边的好朋友
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Frog · Duck · Fish · Turtle · Snail · Crab
              </p>
            </div>
            {onStartGameWithFilter && (
              <button
                type="button"
                onClick={() => onStartGameWithFilter('rainy')}
                className="self-start px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                只练 Rainy Day 词组
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Word Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleAnimals.map((animal) => {
          const isSunny = animal.weather === 'sunny';
          const isActive = activeId === animal.id;
          return (
            <button
              key={animal.id}
              type="button"
              onClick={() => handleCardSpeak(animal)}
              className={`group text-left rounded-2xl border p-5 transition-all duration-150 cursor-pointer bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isSunny
                  ? 'border-amber-200 hover:border-amber-400 focus-visible:ring-amber-500'
                  : 'border-sky-200 hover:border-sky-400 focus-visible:ring-sky-500'
              } ${isActive ? 'ring-2 ring-offset-2 ' + (isSunny ? 'ring-amber-400' : 'ring-sky-500') : 'shadow-sm'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                    isSunny ? 'bg-amber-50' : 'bg-sky-50'
                  }`}
                >
                  <AnimalIllustration animalId={animal.id} className="w-16 h-16" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {isSunny ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-amber-800">Sunny Day</span>
                      </>
                    ) : (
                      <>
                        <CloudRain className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="text-sky-800">Rainy Day</span>
                      </>
                    )}
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-slate-500">{animal.chinese}</span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-slate-900 mt-1 truncate">
                    {animal.word}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {animal.phonetic}
                  </p>
                </div>

                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSunny
                      ? 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                      : 'bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white'
                  }`}
                  aria-hidden="true"
                >
                  <Volume2 className="w-5 h-5" />
                </span>
              </div>

              <p className="mt-4 pt-3 border-t border-slate-100 text-sm text-slate-700 leading-snug">
                “{animal.sentence}”
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
