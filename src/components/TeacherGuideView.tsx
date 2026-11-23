import React from 'react';
import { Volume2, Sparkles, Trophy, Play } from 'lucide-react';

interface TeacherGuideViewProps {
  onStartGame: () => void;
  onOpenWordCards: () => void;
}

export const TeacherGuideView: React.FC<TeacherGuideViewProps> = ({
  onStartGame,
  onOpenWordCards,
}) => {
  return (
    <section className="mx-auto max-w-[1000px] px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-teal-700">
          备课与课堂组织建议 · Teacher Guide
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
          Sunny Day &amp; Rainy Day 课堂三步教学法
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          适合小学 1–4 年级英语课堂白板互动或平板分组练习，通过视听结合帮助学生建立「天气—动物—英语发音」的直接记忆联结。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            01. 词卡热身带读
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            先打开「单词词卡」，分别展示 Sunny Day 的 6 个动物（Bee, Butterfly, Rabbit, Bird, Dog, Cat）与 Rainy Day 的 6 个动物（Frog, Duck, Fish, Turtle, Snail, Crab），点击卡片带学生齐读两遍。
          </p>
          <button
            type="button"
            onClick={onOpenWordCards}
            className="text-sm font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-4 cursor-pointer"
          >
            打开单词词卡
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            02. 点读大挑战
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            开启游戏后，太阳（Sun）与雨云（Rainy Cloud）会从草地跳入天空！让学生划动或点击把它们切成两半，系统会立刻播报英语发音并在右侧放大「跟着读展示牌」，全班大声跟读！
          </p>
          <button
            type="button"
            onClick={onStartGame}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-4 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            进入游戏舞台
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            03. 跟读打卡与榜单激励
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            当学生大声跟读正确时，老师点击右侧「跟读真棒 +5分」（或直接按键盘空格键 Space），即可送出鼓励音效并追加分数；也可开启麦克风体验语音跟读自动识别！
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts for Classroom Whiteboard / Laptop */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
          老师电脑快捷键（游戏进行中可用）
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono font-bold text-slate-900">Space</span>
            <p className="text-slate-600 mt-1">奖励全班/学生「跟读过关 +5分」</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono font-bold text-slate-900">R</span>
            <p className="text-slate-600 mt-1">再读一遍当前动物单词</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono font-bold text-slate-900">P</span>
            <p className="text-slate-600 mt-1">暂停 / 继续天空掉落</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-mono font-bold text-slate-900">M</span>
            <p className="text-slate-600 mt-1">一键开启 / 静音背景音乐</p>
          </div>
        </div>
      </div>
    </section>
  );
};
