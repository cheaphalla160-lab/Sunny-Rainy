import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Sun,
  CloudRain,
  Star,
  Mic,
  Trophy,
  Check,
  Sparkles,
} from 'lucide-react';
import { ANIMAL_WORDS, type AnimalWord, type WeatherType } from '../data/animals';
import { AnimalIllustration, FallingWeatherToken } from './AnimalArtwork';
import {
  audioEngine,
  isSpeechRecognitionSupported,
  listenForWord,
  type SpeechMode,
} from '../utils/audioEngine';
import {
  addLeaderboardEntry,
  type LeaderboardEntry,
  type RoundMode,
} from '../utils/leaderboard';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'ROUND_SUMMARY';
type FallSpeed = 'slow' | 'normal' | 'fast';
type WeatherFilter = 'both' | WeatherType;

interface AirborneToken {
  uid: string;
  animal: AnimalWord;
  xPx: number;
  yPx: number;
  vx: number;
  vy: number;
  rotDeg: number;
  rotSpeed: number;
}

interface SlicedHalfEffect {
  id: string;
  animal: AnimalWord;
  xPx: number;
  yPx: number;
  angleDeg: number;
  label: string;
}

interface TrailPoint {
  x: number;
  y: number;
  ts: number;
}

interface GameStageProps {
  initialWeatherFilter?: WeatherFilter;
  leaderboard: LeaderboardEntry[];
  onLeaderboardUpdate: (next: LeaderboardEntry[]) => void;
  onOpenLeaderboard: () => void;
}

const SPEED_CONFIG: Record<
  FallSpeed,
  { gravity: number; spawnMs: number; doubleChance: number }
> = {
  slow: { gravity: 245, spawnMs: 1750, doubleChance: 0.15 },
  normal: { gravity: 410, spawnMs: 1400, doubleChance: 0.35 },
  fast: { gravity: 610, spawnMs: 1100, doubleChance: 0.55 },
};

function segmentHitsCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = 0;
  if (lenSq > 0.0001) {
    t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / lenSq));
  }
  const nearX = x1 + t * dx;
  const nearY = y1 + t * dy;
  const distSq = (cx - nearX) * (cx - nearX) + (cy - nearY) * (cy - nearY);
  return distSq <= r * r;
}

const QUICK_NAMES = ['Sunny 1组', 'Rainy 2组', '全班齐读', 'Mia', 'Leo'];

export const GameStage: React.FC<GameStageProps> = ({
  initialWeatherFilter = 'both',
  leaderboard,
  onLeaderboardUpdate,
  onOpenLeaderboard,
}) => {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');

  // Setup options
  const [studentName, setStudentName] = useState('全班齐读');
  const [roundMode, setRoundMode] = useState<RoundMode>('60s');
  const [fallSpeed, setFallSpeed] = useState<FallSpeed>('slow');
  const [speechMode, setSpeechMode] = useState<SpeechMode>('phrase');
  const [weatherFilter, setWeatherFilter] = useState<WeatherFilter>(initialWeatherFilter);
  const [musicEnabled, setMusicEnabled] = useState(true);

  // Sync external weather filter changes (e.g. from Word Cards view)
  useEffect(() => {
    setWeatherFilter(initialWeatherFilter);
  }, [initialWeatherFilter]);

  // Active gameplay stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wordsCaught, setWordsCaught] = useState(0);
  const [readAloudCount, setReadAloudCount] = useState(0);
  const [sunnyCount, setSunnyCount] = useState(0);
  const [rainyCount, setRainyCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);

  // Spotlight & Mic state
  const [spotlightAnimal, setSpotlightAnimal] = useState<AnimalWord | null>(null);
  const [spotlightRewarded, setSpotlightRewarded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micSupported] = useState(() => isSpeechRecognitionSupported());
  const [isListening, setIsListening] = useState(false);
  const [micFeedback, setMicFeedback] = useState<string | null>(null);

  useEffect(() => {
    audioEngine.initVoices();
  }, []);

  // Summary state
  const [achievedRank, setAchievedRank] = useState<number | null>(null);

  // Airborne jump & slice canvas state
  const [tokens, setTokens] = useState<AirborneToken[]>([]);
  const [slicedEffects, setSlicedEffects] = useState<SlicedHalfEffect[]>([]);
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tokensRef = useRef<AirborneToken[]>([]);
  const isSlicingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const lastWhooshAtRef = useRef<number>(0);
  const lastSpawnAtRef = useRef<number>(0);
  const lastLaneRef = useRef<number>(2);
  const stopListenRef = useRef<(() => void) | null>(null);
  const savedRoundRef = useRef(false);

  // Keep latest stats in refs for clean end-of-round save
  const statsRef = useRef({
    score: 0,
    wordsCaught: 0,
    readAloudCount: 0,
    sunnyCount: 0,
    rainyCount: 0,
    studentName: '全班齐读',
    roundMode: '60s' as RoundMode,
  });

  useEffect(() => {
    statsRef.current = {
      score,
      wordsCaught,
      readAloudCount,
      sunnyCount,
      rainyCount,
      studentName,
      roundMode,
    };
  }, [score, wordsCaught, readAloudCount, sunnyCount, rainyCount, studentName, roundMode]);

  const activePool = useMemo(() => {
    if (weatherFilter === 'both') return ANIMAL_WORDS;
    return ANIMAL_WORDS.filter((a) => a.weather === weatherFilter);
  }, [weatherFilter]);

  const activePoolRef = useRef(activePool);
  useEffect(() => {
    activePoolRef.current = activePool;
  }, [activePool]);

  const finishRound = useCallback(() => {
    audioEngine.stopMusic();
    audioEngine.playVictorySfx();
    if (stopListenRef.current) {
      stopListenRef.current();
      stopListenRef.current = null;
    }
    setIsListening(false);

    if (!savedRoundRef.current && statsRef.current.wordsCaught > 0) {
      savedRoundRef.current = true;
      const cleanName = statsRef.current.studentName.trim() || '快乐小同学';
      const { entries, rank } = addLeaderboardEntry({
        studentName: cleanName,
        score: statsRef.current.score,
        wordsCaught: statsRef.current.wordsCaught,
        readAloudCount: statsRef.current.readAloudCount,
        sunnyCount: statsRef.current.sunnyCount,
        rainyCount: statsRef.current.rainyCount,
        mode: statsRef.current.roundMode,
      });
      onLeaderboardUpdate(entries);
      setAchievedRank(rank);
    } else {
      setAchievedRank(null);
    }

    setGameState('ROUND_SUMMARY');
  }, [onLeaderboardUpdate]);

  const startNewRound = useCallback(() => {
    savedRoundRef.current = false;
    tokensRef.current = [];
    setTokens([]);
    setSlicedEffects([]);
    setTrailPoints([]);
    isSlicingRef.current = false;
    lastPointerRef.current = null;
    setScore(0);
    setStreak(0);
    setWordsCaught(0);
    setReadAloudCount(0);
    setSunnyCount(0);
    setRainyCount(0);
    setDiscoveredIds([]);
    setSpotlightAnimal(null);
    setSpotlightRewarded(false);
    setMicFeedback(null);
    setAchievedRank(null);
    setTimeLeft(roundMode === '90s' ? 90 : 60);
    lastSpawnAtRef.current = 0;

    if (musicEnabled) {
      audioEngine.startMusic();
    } else {
      audioEngine.stopMusic();
    }

    setGameState('PLAYING');
  }, [musicEnabled, roundMode]);

  const toggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;
      if (next && gameState === 'PLAYING') {
        audioEngine.startMusic();
      } else {
        audioEngine.stopMusic();
      }
      return next;
    });
  }, [gameState]);

  // Cleanup audio & mic on unmount
  useEffect(() => {
    return () => {
      audioEngine.stopMusic();
      if (stopListenRef.current) {
        stopListenRef.current();
      }
    };
  }, []);

  // Countdown timer when in timed mode
  useEffect(() => {
    if (gameState !== 'PLAYING' || roundMode === 'free') return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          finishRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameState, roundMode, finishRound]);

  // Parabolic jump physics loop + slash trail fade
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let rafId = 0;
    let prevTime = performance.now();
    const cfg = SPEED_CONFIG[fallSpeed];

    const spawnOne = (now: number) => {
      const pool = activePoolRef.current;
      if (pool.length === 0) return;

      const stageWidth = stageRef.current?.clientWidth ?? 800;
      const stageHeight = stageRef.current?.clientHeight ?? 580;

      const animal = pool[Math.floor(Math.random() * pool.length)];
      let lane = Math.floor(Math.random() * 5);
      if (lane === lastLaneRef.current) {
        lane = (lane + 1 + Math.floor(Math.random() * 3)) % 5;
      }
      lastLaneRef.current = lane;

      const startX = stageWidth * (0.16 + lane * 0.17) + (Math.random() * 24 - 12);
      const startY = stageHeight + 65;

      // Peak height comfortably in the upper-middle sky (14% - 36% from top)
      const apexY = stageHeight * (0.14 + Math.random() * 0.22);
      const jumpHeight = startY - apexY;
      const vy = -Math.sqrt(2 * cfg.gravity * jumpHeight);

      // Gentle horizontal arc curving toward the center of the sky
      const centerPull = (stageWidth * 0.5 - startX) * 0.28;
      const vx = centerPull + (Math.random() * 48 - 24);

      const newToken: AirborneToken = {
        uid: `${now}-${Math.random().toString(36).slice(2, 7)}`,
        animal,
        xPx: startX,
        yPx: startY,
        vx,
        vy,
        rotDeg: (Math.random() - 0.5) * 10,
        rotSpeed: (Math.random() - 0.5) * 18,
      };

      tokensRef.current = [...tokensRef.current, newToken];
    };

    if (tokensRef.current.length === 0) {
      spawnOne(prevTime);
      lastSpawnAtRef.current = prevTime - cfg.spawnMs * 0.35;
    }

    const frame = (now: number) => {
      const dtSec = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      const stageWidth = stageRef.current?.clientWidth ?? 800;
      const stageHeight = stageRef.current?.clientHeight ?? 580;

      if (now - lastSpawnAtRef.current >= cfg.spawnMs && tokensRef.current.length < 7) {
        spawnOne(now);
        if (Math.random() < cfg.doubleChance && tokensRef.current.length < 6) {
          spawnOne(now + 1);
        }
        lastSpawnAtRef.current = now;
      }

      const nextTokens: AirborneToken[] = [];
      for (const item of tokensRef.current) {
        const nextVy = item.vy + cfg.gravity * dtSec;
        const nextX = Math.max(58, Math.min(stageWidth - 58, item.xPx + item.vx * dtSec));
        const nextY = item.yPx + nextVy * dtSec;
        const nextRot = Math.max(-16, Math.min(16, item.rotDeg + item.rotSpeed * dtSec));

        // Keep while still rising or visible above bottom exit
        if (!(nextY > stageHeight + 90 && nextVy > 0)) {
          nextTokens.push({
            ...item,
            xPx: nextX,
            yPx: nextY,
            vy: nextVy,
            rotDeg: nextRot,
          });
        }
      }

      tokensRef.current = nextTokens;
      setTokens(nextTokens);

      // Prune expired slice trail points (>160ms old)
      setTrailPoints((prev) => {
        if (prev.length === 0) return prev;
        const fresh = prev.filter((pt) => now - pt.ts < 160);
        return fresh.length === prev.length ? prev : fresh;
      });

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, fallSpeed]);

  const handleSliceToken = useCallback(
    (token: AirborneToken, angleDeg = -22) => {
      if (gameState !== 'PLAYING') return;
      if (!tokensRef.current.some((t) => t.uid === token.uid)) return;

      // Remove sliced token immediately to prevent double hits
      tokensRef.current = tokensRef.current.filter((t) => t.uid !== token.uid);
      setTokens(tokensRef.current);

      setStreak((prevStreak) => {
        const nextStreak = prevStreak + 1;
        const pointsEarned = nextStreak >= 5 ? 15 : 10;

        setScore((prev) => prev + pointsEarned);
        setWordsCaught((prev) => prev + 1);
        if (token.animal.weather === 'sunny') {
          setSunnyCount((prev) => prev + 1);
        } else {
          setRainyCount((prev) => prev + 1);
        }
        setDiscoveredIds((prev) =>
          prev.includes(token.animal.id) ? prev : [...prev, token.animal.id]
        );

        const sliceId = `slice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setSlicedEffects((prev) => [
          ...prev,
          {
            id: sliceId,
            animal: token.animal,
            xPx: token.xPx,
            yPx: token.yPx,
            angleDeg,
            label: `+${pointsEarned}`,
          },
        ]);

        window.setTimeout(() => {
          setSlicedEffects((prev) => prev.filter((s) => s.id !== sliceId));
        }, 720);

        return nextStreak;
      });

      // Spotlight + audio
      setSpotlightAnimal(token.animal);
      setSpotlightRewarded(false);
      setMicFeedback(null);
      if (stopListenRef.current) {
        stopListenRef.current();
        stopListenRef.current = null;
        setIsListening(false);
      }

      audioEngine.playCatchSfx(token.animal.weather);
      audioEngine.speakAnimal(
        token.animal.word,
        token.animal.weather,
        token.animal.sentence,
        speechMode,
        setIsSpeaking
      );
    },
    [gameState, speechMode]
  );

  const getStageCoords = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING') return;
    const pt = getStageCoords(e.clientX, e.clientY);
    if (!pt) return;

    isSlicingRef.current = true;
    lastPointerRef.current = pt;
    setTrailPoints([{ x: pt.x, y: pt.y, ts: performance.now() }]);

    // Instant tap slice if tapping directly on a Sun or Rainy Cloud
    for (const token of [...tokensRef.current]) {
      if (segmentHitsCircle(pt.x, pt.y, pt.x, pt.y, token.xPx, token.yPx, 62)) {
        handleSliceToken(token, -24);
      }
    }
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING' || !isSlicingRef.current) return;
    const pt = getStageCoords(e.clientX, e.clientY);
    if (!pt) return;

    const now = performance.now();
    const prev = lastPointerRef.current ?? pt;
    const dx = pt.x - prev.x;
    const dy = pt.y - prev.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 28 && now - lastWhooshAtRef.current > 240) {
      audioEngine.playSliceWhoosh();
      lastWhooshAtRef.current = now;
    }

    const angleDeg = dist > 2 ? (Math.atan2(dy, dx) * 180) / Math.PI : -22;

    for (const token of [...tokensRef.current]) {
      if (segmentHitsCircle(prev.x, prev.y, pt.x, pt.y, token.xPx, token.yPx, 62)) {
        handleSliceToken(token, angleDeg);
      }
    }

    lastPointerRef.current = pt;
    setTrailPoints((old) => [...old.slice(-14), { x: pt.x, y: pt.y, ts: now }]);
  };

  const handleStagePointerEnd = () => {
    isSlicingRef.current = false;
    lastPointerRef.current = null;
  };

  const handleAwardReadAloud = useCallback(() => {
    if (!spotlightAnimal || spotlightRewarded) return;
    setSpotlightRewarded(true);
    setScore((prev) => prev + 5);
    setReadAloudCount((prev) => prev + 1);
    audioEngine.playReadBonusSfx();
  }, [spotlightAnimal, spotlightRewarded]);

  const handleReplaySpotlight = useCallback(() => {
    if (!spotlightAnimal) return;
    audioEngine.speakAnimal(
      spotlightAnimal.word,
      spotlightAnimal.weather,
      spotlightAnimal.sentence,
      speechMode,
      setIsSpeaking
    );
  }, [spotlightAnimal, speechMode]);

  const handleMicPractice = () => {
    if (!spotlightAnimal || isListening) return;
    setIsListening(true);
    setMicFeedback('请大声说出单词...');

    stopListenRef.current = listenForWord(
      spotlightAnimal.word,
      ({ matched, transcript }) => {
        setIsListening(false);
        if (matched) {
          setMicFeedback(`太棒了！识别到 "${transcript}" (+10分)`);
          if (!spotlightRewarded) {
            setSpotlightRewarded(true);
            setScore((prev) => prev + 10);
            setReadAloudCount((prev) => prev + 1);
          }
          audioEngine.playReadBonusSfx();
        } else {
          setMicFeedback(
            transcript
              ? `听到了 "${transcript}"，再试着读一次 "${spotlightAnimal.word}"！`
              : '没有听清，再读大声一点试试看！'
          );
        }
      },
      () => {
        setIsListening(false);
        setMicFeedback('当前浏览器未开启麦克风权限，可直接点「跟读真棒 +5」打卡。');
      }
    );
  };

  // Classroom keyboard shortcuts during active play
  useEffect(() => {
    if (gameState !== 'PLAYING' && gameState !== 'PAUSED') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleAwardReadAloud();
      } else if (e.key.toLowerCase() === 'r') {
        handleReplaySpotlight();
      } else if (e.key.toLowerCase() === 'p') {
        setGameState((prev) => {
          if (prev === 'PLAYING') {
            audioEngine.stopMusic();
            return 'PAUSED';
          }
          if (musicEnabled) audioEngine.startMusic();
          return 'PLAYING';
        });
      } else if (e.key.toLowerCase() === 'm') {
        toggleMusic();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, handleAwardReadAloud, handleReplaySpotlight, musicEnabled, toggleMusic]);

  const topThree = leaderboard.slice(0, 3);

  // =========================================================================
  // VIEW 1: TITLE & SETUP MENU
  // =========================================================================
  if (gameState === 'TITLE_MENU') {
    return (
      <section className="mx-auto max-w-[1280px] px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* Left Hero Storybook Stage (7 cols) */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-sky-200 shadow-sm min-h-[440px] flex flex-col justify-between bg-sky-100">
            <img
              src="/src/assets/images/meadow_sky_backdrop_1795428012258.jpg"
              alt="Sunny sky and green meadow backdrop"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/35 to-slate-900/55"
              aria-hidden="true"
            />

            {/* Top Hero Copy */}
            <div className="relative z-10 p-7 sm:p-9 space-y-3 max-w-xl">
              <p className="text-sm font-semibold text-amber-800">
                小学英语互动课堂 · Sunny Day &amp; Rainy Day
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 leading-tight text-balance">
                晴雨小动物切切乐
              </h1>
              <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-medium">
                太阳（Sun）和雨云（Rainy Cloud）会从草地跳进天空！让学生滑动或点击把它们切成两半，听发音并大声跟读 12 个动物单词！
              </p>
            </div>

            {/* Bottom Preview Tokens */}
            <div className="relative z-10 p-7 sm:p-9 flex flex-wrap items-end justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="animate-gentle-bob">
                  <FallingWeatherToken weather="sunny" animalId="bee" word="Bee" />
                </div>
                <div className="animate-gentle-bob" style={{ animationDelay: '0.6s' }}>
                  <FallingWeatherToken weather="rainy" animalId="frog" word="Frog" />
                </div>
                <div className="hidden sm:block animate-gentle-bob" style={{ animationDelay: '1.2s' }}>
                  <FallingWeatherToken weather="sunny" animalId="butterfly" word="Butterfly" />
                </div>
              </div>

              <div className="rounded-2xl bg-white/92 backdrop-blur-sm border border-white px-4 py-3 text-xs text-slate-700 shadow-sm space-y-1">
                <p className="font-semibold text-slate-900">本课核心词库 (12 词)</p>
                <p>Sunny: Bee, Butterfly, Rabbit, Bird, Dog, Cat</p>
                <p>Rainy: Frog, Duck, Fish, Turtle, Snail, Crab</p>
              </div>
            </div>
          </div>

          {/* Right Classroom Setup Panel (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  课堂准备与规则设置
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  输入学生或小组名字即可开始，所有设置支持随时调整。
                </p>
              </div>

              {/* Student Name */}
              <div className="space-y-2">
                <label
                  htmlFor="student-name-input"
                  className="block text-sm font-semibold text-slate-800"
                >
                  参赛学生 / 班级小组名称
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  maxLength={24}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="例如：Mia 或 三(1)班 Sunny组"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {QUICK_NAMES.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStudentName(preset)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        studentName === preset
                          ? 'bg-teal-50 border-teal-300 text-teal-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Theme Filter */}
              <div className="space-y-2">
                <span className="block text-sm font-semibold text-slate-800">
                  练习天气词组
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWeatherFilter('both')}
                    className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      weatherFilter === 'both'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    晴雨混合 (12)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeatherFilter('sunny')}
                    className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      weatherFilter === 'sunny'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    仅 Sunny (6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeatherFilter('rainy')}
                    className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      weatherFilter === 'rainy'
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-sky-50/60 text-sky-900 border-sky-200 hover:bg-sky-100'
                    }`}
                  >
                    仅 Rainy (6)
                  </button>
                </div>
              </div>

              {/* Round Mode & Speed */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-slate-800">
                    游戏时长
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {(
                      [
                        { id: '60s', label: '60 秒挑战赛' },
                        { id: '90s', label: '90 秒加长赛' },
                        { id: 'free', label: '自由点读 (不限时)' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setRoundMode(m.id)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-colors cursor-pointer ${
                          roundMode === m.id
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-slate-800">
                    跳跃速度
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {(
                      [
                        { id: 'slow', label: '慢速 · 低年级轻松切' },
                        { id: 'normal', label: '适中 · 课堂标准' },
                        { id: 'fast', label: '欢快 · 连跳挑战' },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setFallSpeed(s.id)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-colors cursor-pointer ${
                          fallSpeed === s.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pronunciation Mode + Music Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  {(
                    [
                      { id: 'word', label: '仅读单词' },
                      { id: 'phrase', label: '晴雨+单词' },
                      { id: 'sentence', label: '完整句型' },
                    ] as const
                  ).map((sm) => (
                    <button
                      key={sm.id}
                      type="button"
                      onClick={() => setSpeechMode(sm.id)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        speechMode === sm.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {sm.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setMusicEnabled((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    musicEnabled
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {musicEnabled ? (
                    <Volume2 className="w-4 h-4 text-amber-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  {musicEnabled ? '背景音乐：开' : '背景音乐：关'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={startNewRound}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-display text-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              开始游戏 · Start Game
            </button>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // VIEW 2: ROUND SUMMARY MODAL / CARD
  // =========================================================================
  if (gameState === 'ROUND_SUMMARY') {
    return (
      <section className="mx-auto max-w-[900px] px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-teal-700">
                本轮学习完成 · Well Done!
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
                {studentName.trim() || '快乐小同学'} 获得了 {score} 分！
              </h1>
              {achievedRank !== null && (
                <p className="text-sm text-amber-800 font-semibold">
                  成绩已计入班级排行榜，当前排名第 {achievedRank} 名！
                </p>
              )}
            </div>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
              <p className="text-xs font-medium text-slate-500">总得分</p>
              <p className="font-display text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                {score}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4">
              <p className="text-xs font-medium text-amber-800">Sunny 点读</p>
              <p className="font-display text-3xl font-bold text-amber-900 mt-1 tabular-nums">
                {sunnyCount}
              </p>
            </div>
            <div className="rounded-2xl bg-sky-50/70 border border-sky-200 p-4">
              <p className="text-xs font-medium text-sky-800">Rainy 点读</p>
              <p className="font-display text-3xl font-bold text-sky-900 mt-1 tabular-nums">
                {rainyCount}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4">
              <p className="text-xs font-medium text-emerald-800">跟读打卡</p>
              <p className="font-display text-3xl font-bold text-emerald-900 mt-1 tabular-nums">
                {readAloudCount}
              </p>
            </div>
          </div>

          {discoveredIds.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700">
                本轮复习的动物单词 ({discoveredIds.length} / {activePool.length})
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {discoveredIds.map((id) => {
                  const animal = ANIMAL_WORDS.find((a) => a.id === id);
                  if (!animal) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        audioEngine.speakAnimal(
                          animal.word,
                          animal.weather,
                          animal.sentence,
                          speechMode
                        )
                      }
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                        animal.weather === 'sunny'
                          ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                          : 'bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100'
                      }`}
                    >
                      <AnimalIllustration animalId={animal.id} className="w-6 h-6" />
                      <span>{animal.word}</span>
                      <Volume2 className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={startNewRound}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              再玩一局 · Play Again
            </button>
            <button
              type="button"
              onClick={() => setGameState('TITLE_MENU')}
              className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
            >
              更换同学 / 调整设置
            </button>
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-sm transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              查看完整排行榜
            </button>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE PLAYING / PAUSED TWO-ZONE SANDBOX
  // =========================================================================
  return (
    <section className="mx-auto max-w-[1380px] px-4 sm:px-6 py-5 space-y-4">
      {/* Unobtrusive Top Stage HUD Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <div>
            <span className="text-xs text-slate-500 block">当前挑战</span>
            <span className="font-display font-bold text-slate-900 text-base">
              {studentName.trim() || '全班齐读'}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

          <div className="flex items-center gap-5 tabular-nums">
            <div>
              <span className="text-xs text-slate-500 block">得分</span>
              <span className="font-display text-2xl font-bold text-teal-700 leading-none">
                {score}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">连击</span>
              <span className="font-display text-xl font-bold text-amber-600 leading-none">
                {streak}x
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">
                {roundMode === 'free' ? '模式' : '剩余时间'}
              </span>
              <span
                className={`font-display text-xl font-bold leading-none ${
                  roundMode !== 'free' && timeLeft <= 10 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {roundMode === 'free' ? '自由点读' : `${timeLeft}s`}
              </span>
            </div>
          </div>
        </div>

        {/* Stage Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleMusic}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              musicEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {musicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {musicEnabled ? '音乐开' : '音乐关'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (gameState === 'PLAYING') {
                audioEngine.stopMusic();
                setGameState('PAUSED');
              } else {
                if (musicEnabled) audioEngine.startMusic();
                setGameState('PLAYING');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {gameState === 'PLAYING' ? (
              <>
                <Pause className="w-4 h-4" />
                暂停
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                继续
              </>
            )}
          </button>

          <button
            type="button"
            onClick={finishRound}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            结束并计分
          </button>
        </div>
      </div>

      {/* Two-Zone Main Layout: Sky Canvas (Left 8 cols) + Follow & Read Deck (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT ZONE: Interactive Jump & Slice Sky Stage */}
        <div
          ref={stageRef}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerEnd}
          onPointerCancel={handleStagePointerEnd}
          onPointerLeave={handleStagePointerEnd}
          className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-sky-200 bg-sky-100 shadow-sm h-[520px] sm:h-[600px] select-none touch-none cursor-crosshair"
        >
          <img
            src="/src/assets/images/meadow_sky_backdrop_1795428012258.jpg"
            alt="Sky and meadow play area"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 bg-white/15 pointer-events-none" aria-hidden="true" />

          {/* Subtle top hint on canvas before first slice */}
          {!spotlightAnimal && gameState === 'PLAYING' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
              <div className="px-4 py-1.5 rounded-xl bg-white/90 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs whitespace-nowrap">
                按住划过或点击跳出的 Sun 与 Rainy Cloud，把它切成两半！
              </div>
            </div>
          )}

          {/* Airborne Jumping Suns & Rainy Clouds */}
          {tokens.map((token) => (
            <button
              key={token.uid}
              type="button"
              onClick={() => handleSliceToken(token, -24)}
              aria-label={`Slice ${token.animal.weather === 'sunny' ? 'Sunny day' : 'Rainy day'} ${token.animal.word}`}
              style={{
                left: 0,
                top: 0,
                transform: `translate3d(${token.xPx.toFixed(1)}px, ${token.yPx.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${token.rotDeg.toFixed(1)}deg)`,
              }}
              className="absolute w-28 h-36 flex items-center justify-center cursor-crosshair focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-full"
            >
              <FallingWeatherToken
                weather={token.animal.weather}
                animalId={token.animal.id}
                word={token.animal.word}
              />
            </button>
          ))}

          {/* Split-in-Half Visual Effects */}
          {slicedEffects.map((fx) => (
            <div
              key={fx.id}
              style={{ left: `${fx.xPx}px`, top: `${fx.yPx}px` }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20"
              aria-hidden="true"
            >
              {/* Left Half */}
              <div
                className="animate-slice-left absolute inset-0 flex items-center justify-center"
                style={{ clipPath: 'polygon(0 0, 52% 0, 48% 100%, 0 100%)' }}
              >
                <FallingWeatherToken
                  weather={fx.animal.weather}
                  animalId={fx.animal.id}
                  word={fx.animal.word}
                />
              </div>
              {/* Right Half */}
              <div
                className="animate-slice-right flex items-center justify-center"
                style={{ clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 48% 100%)' }}
              >
                <FallingWeatherToken
                  weather={fx.animal.weather}
                  animalId={fx.animal.id}
                  word={fx.animal.word}
                />
              </div>

              {/* Slash Flash Line */}
              <div
                style={{ transform: `translate(-50%, -50%) rotate(${fx.angleDeg}deg)` }}
                className="absolute left-1/2 top-1/2 w-32 h-1.5"
              >
                <div
                  className={`animate-slash-flash w-full h-full rounded-full ${
                    fx.animal.weather === 'sunny' ? 'bg-amber-300 shadow-[0_0_12px_#F59E0B]' : 'bg-sky-300 shadow-[0_0_12px_#0284C7]'
                  }`}
                />
              </div>

              {/* Burst Ring & Floating Score */}
              <div
                className={`animate-ring-expand absolute left-1/2 top-1/2 w-24 h-24 rounded-full border-4 ${
                  fx.animal.weather === 'sunny' ? 'border-amber-400' : 'border-sky-400'
                }`}
              />
              <div
                className={`animate-pop-burst absolute left-1/2 top-1/2 font-display text-2xl font-bold drop-shadow-sm ${
                  fx.animal.weather === 'sunny' ? 'text-amber-700' : 'text-sky-800'
                }`}
              >
                {fx.label}
              </div>
            </div>
          ))}

          {/* Glowing Swipe Blade Trail */}
          {trailPoints.length > 1 && (
            <svg
              className="pointer-events-none absolute inset-0 w-full h-full z-20"
              aria-hidden="true"
            >
              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeOpacity="0.35"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={trailPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
              />
              <polyline
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={trailPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
              />
            </svg>
          )}

          {/* Interactive Bottom Prompt Banner showing latest word for smartboard tapping */}
          {spotlightAnimal && gameState === 'PLAYING' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <button
                type="button"
                onClick={handleReplaySpotlight}
                className="px-5 py-2 rounded-2xl bg-white/95 hover:bg-white backdrop-blur-sm border border-slate-200 shadow-sm flex items-center gap-3 whitespace-nowrap cursor-pointer transition-colors"
              >
                {spotlightAnimal.weather === 'sunny' ? (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <CloudRain className="w-4 h-4 text-sky-600 shrink-0" />
                )}
                <span className="text-xs font-semibold text-slate-500">
                  {spotlightAnimal.weather === 'sunny' ? 'Sunny day' : 'Rainy day'}
                </span>
                <span className="font-display text-lg font-bold text-slate-900">
                  {spotlightAnimal.word}
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="text-sm font-medium text-slate-700">
                  {spotlightAnimal.chinese}
                </span>
                <Volume2
                  className={`w-4 h-4 shrink-0 ${
                    isSpeaking ? 'text-teal-600' : 'text-slate-500'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Pause Overlay */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 z-30 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-6">
              <div className="rounded-3xl bg-white border border-slate-200 p-7 max-w-sm w-full text-center space-y-5 shadow-lg">
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  游戏已暂停
                </h2>
                <p className="text-sm text-slate-600">
                  现在可以带同学们复读刚才点中的动物单词，准备好后再继续。
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (musicEnabled) audioEngine.startMusic();
                      setGameState('PLAYING');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    继续游戏
                  </button>
                  <button
                    type="button"
                    onClick={finishRound}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    结束本轮
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT ZONE: Follow & Read Spotlight + Progress + Mini Top 3 */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Word Follow & Read Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex-1 flex flex-col justify-between gap-4">
            {spotlightAnimal ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {spotlightAnimal.weather === 'sunny' ? (
                        <>
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-800">Sunny Day · 晴天动物</span>
                        </>
                      ) : (
                        <>
                          <CloudRain className="w-4 h-4 text-sky-600" />
                          <span className="text-sky-800">Rainy Day · 雨天动物</span>
                        </>
                      )}
                    </span>
                    <span className="text-slate-500">请大声跟读</span>
                  </div>

                  {/* Visual Focal Animal Card */}
                  <div
                    className={`rounded-2xl p-5 flex items-center gap-4 border ${
                      spotlightAnimal.weather === 'sunny'
                        ? 'bg-amber-50/80 border-amber-200'
                        : 'bg-sky-50/80 border-sky-200'
                    }`}
                  >
                    <div className="w-24 h-24 rounded-2xl bg-white border border-white shadow-xs flex items-center justify-center shrink-0">
                      <AnimalIllustration animalId={spotlightAnimal.id} className="w-20 h-20" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 truncate">
                        {spotlightAnimal.word}
                      </h2>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        {spotlightAnimal.phonetic}
                      </p>
                      <p className="text-base font-semibold text-slate-700 mt-1">
                        {spotlightAnimal.chinese}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    “{spotlightAnimal.sentence}”
                  </p>
                </div>

                {/* Audio & Read-Aloud Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleReplaySpotlight}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-teal-600" />
                      再听一遍
                    </button>

                    <button
                      type="button"
                      onClick={handleAwardReadAloud}
                      disabled={spotlightRewarded}
                      className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                        spotlightRewarded
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                      }`}
                    >
                      {spotlightRewarded ? (
                        <>
                          <Check className="w-4 h-4" />
                          已跟读 +5
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 fill-current" />
                          跟读真棒 +5
                        </>
                      )}
                    </button>
                  </div>

                  {micSupported && (
                    <button
                      type="button"
                      onClick={handleMicPractice}
                      disabled={isListening}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        isListening
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      {isListening
                        ? `正在聆听，请说 "${spotlightAnimal.word}"...`
                        : '麦克风语音跟读测一测 (+10分)'}
                    </button>
                  )}

                  {micFeedback && (
                    <p className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      {micFeedback}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  准备好跟读了吗？
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                  让学生划动或点击左侧草地跳出来的 Sun（太阳）和 Rainy Cloud（雨云），把它们切成两半！系统会立刻读出英文单词，并在此处放大展示。
                </p>
              </div>
            )}
          </div>

          {/* Collected Words Mini Tracker + Top 3 Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                本局已收集单词
              </span>
              <span className="text-xs font-semibold text-teal-700 tabular-nums">
                {discoveredIds.length} / {activePool.length}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {activePool.map((animal) => {
                const caught = discoveredIds.includes(animal.id);
                return (
                  <button
                    key={animal.id}
                    type="button"
                    title={`${animal.word} (${animal.chinese})`}
                    onClick={() => {
                      setSpotlightAnimal(animal);
                      audioEngine.speakAnimal(
                        animal.word,
                        animal.weather,
                        animal.sentence,
                        speechMode
                      );
                    }}
                    className={`aspect-square rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      caught
                        ? animal.weather === 'sunny'
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-sky-50 border-sky-300'
                        : 'bg-slate-50 border-slate-200/70 opacity-45 hover:opacity-80'
                    }`}
                  >
                    <AnimalIllustration animalId={animal.id} className="w-7 h-7" />
                  </button>
                );
              })}
            </div>

            {topThree.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">班级前三名</span>
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.stopMusic();
                      onOpenLeaderboard();
                    }}
                    className="font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                  >
                    全部榜单
                  </button>
                </div>
                <div className="space-y-1 text-xs tabular-nums">
                  {topThree.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between text-slate-700"
                    >
                      <span className="truncate pr-2">
                        #{idx + 1} {entry.studentName}
                      </span>
                      <span className="font-display font-bold text-slate-900">
                        {entry.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
