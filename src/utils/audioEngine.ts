import type { WeatherType } from '../data/animals';

export type SpeechMode = 'word' | 'phrase' | 'sentence';

class ClassroomAudioEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private musicRunning = false;
  private stepIndex = 0;
  private musicVolume = 0.22;
  private sfxEnabled = true;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
  }

  public setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  public isMusicPlaying(): boolean {
    return this.musicRunning;
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType,
    gainPeak: number,
    delaySec = 0,
    endFreq?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + durationSec);
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.02);
  }

  // Cheerful C-major marimba/kalimba loop for elementary classroom
  private readonly melodyNotes: (number | null)[] = [
    523.25, 659.25, 783.99, 659.25, // C5 E5 G5 E5
    880.0, 783.99, 659.25, 587.33,  // A5 G5 E5 D5
    523.25, 587.33, 659.25, 783.99, // C5 D5 E5 G5
    659.25, null, 587.33, null,     // E5 - D5 -
    523.25, 659.25, 783.99, 1046.5, // C5 E5 G5 C6
    880.0, 783.99, 659.25, 523.25,  // A5 G5 E5 C5
    587.33, 659.25, 587.33, 493.88, // D5 E5 D5 B4
    523.25, null, 523.25, null,     // C5 - C5 -
  ];

  private readonly bassNotes: (number | null)[] = [
    261.63, null, null, null, // C4
    174.61, null, null, null, // F3
    261.63, null, null, null, // C4
    196.0, null, null, null,  // G3
    261.63, null, null, null, // C4
    174.61, null, null, null, // F3
    196.0, null, 196.0, null, // G3
    261.63, null, null, null, // C4
  ];

  public startMusic(): void {
    if (this.musicRunning) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.musicRunning = true;
    const stepMs = 260; // ~115 BPM eighth-notes, cheerful and gentle

    const tick = () => {
      if (!this.musicRunning) return;
      const idx = this.stepIndex % this.melodyNotes.length;
      const mel = this.melodyNotes[idx];
      const bass = this.bassNotes[idx];

      if (mel && this.musicVolume > 0.01) {
        this.playTone(mel, 0.22, 'triangle', 0.09 * this.musicVolume, 0);
      }
      if (bass && this.musicVolume > 0.01) {
        this.playTone(bass, 0.42, 'sine', 0.08 * this.musicVolume, 0);
      }

      this.stepIndex += 1;
    };

    tick();
    this.musicTimer = window.setInterval(tick, stepMs);
  }

  public stopMusic(): void {
    this.musicRunning = false;
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public playSliceWhoosh(): void {
    if (!this.sfxEnabled) return;
    this.playTone(620, 0.08, 'sine', 0.04, 0, 260);
  }

  public playCatchSfx(weather: WeatherType): void {
    if (!this.sfxEnabled) return;
    // Crisp slice transient
    this.playTone(920, 0.07, 'sine', 0.1, 0, 380);
    if (weather === 'sunny') {
      // Bright sunny sparkle arpeggio
      this.playTone(587.33, 0.12, 'triangle', 0.14, 0.02);
      this.playTone(739.99, 0.12, 'triangle', 0.14, 0.07);
      this.playTone(880.0, 0.18, 'sine', 0.16, 0.12);
    } else {
      // Bubbly rainy-cloud splash chime
      this.playTone(493.88, 0.11, 'sine', 0.15, 0.02, 783.99);
      this.playTone(659.25, 0.14, 'sine', 0.13, 0.08, 987.77);
    }
  }

  public playReadBonusSfx(): void {
    if (!this.sfxEnabled) return;
    this.playTone(523.25, 0.11, 'triangle', 0.14, 0);
    this.playTone(659.25, 0.11, 'triangle', 0.14, 0.07);
    this.playTone(783.99, 0.12, 'triangle', 0.14, 0.14);
    this.playTone(1046.5, 0.24, 'sine', 0.16, 0.21);
  }

  public playVictorySfx(): void {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const delays = [0, 0.1, 0.2, 0.32, 0.48, 0.6];
    notes.forEach((n, i) => {
      this.playTone(n, i === notes.length - 1 ? 0.38 : 0.14, 'triangle', 0.15, delays[i]);
    });
  }

  private cachedVoices: SpeechSynthesisVoice[] = [];

  private loadVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    const list = window.speechSynthesis.getVoices();
    if (list.length > 0) {
      this.cachedVoices = list;
    }
    return this.cachedVoices;
  }

  public initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.loadVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      this.loadVoices();
    };
  }

  public speakAnimal(
    word: string,
    weather: WeatherType,
    sentence: string,
    mode: SpeechMode,
    onStateChange?: (speaking: boolean) => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const text =
        mode === 'word'
          ? word
          : mode === 'phrase'
          ? `${weather === 'sunny' ? 'Sunny day!' : 'Rainy day!'} ${word}!`
          : sentence;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.84;
      utterance.pitch = 1.08;
      utterance.volume = 1;

      const voices = this.loadVoices();
      const preferred =
        voices.find((v) => v.lang.startsWith('en-US') && /samantha|aria|google|natural|jenny/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        utterance.voice = preferred;
      }

      if (onStateChange) {
        utterance.onstart = () => onStateChange(true);
        utterance.onend = () => onStateChange(false);
        utterance.onerror = () => onStateChange(false);
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      onStateChange?.(false);
    }
  }
}

export const audioEngine = new ClassroomAudioEngine();

export interface SpeechCheckResult {
  matched: boolean;
  transcript: string;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function listenForWord(
  targetWord: string,
  onResult: (result: SpeechCheckResult) => void,
  onError: () => void
): () => void {
  const SpeechRec =
    (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
      .SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

  if (!SpeechRec) {
    onError();
    return () => {};
  }

  const recognition = new SpeechRec() as {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  };

  let settled = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    settled = true;
    const alts: string[] = [];
    const firstResult = event.results[0];
    if (firstResult) {
      for (let i = 0; i < firstResult.length; i += 1) {
        alts.push(firstResult[i].transcript.toLowerCase().trim());
      }
    }
    const target = targetWord.toLowerCase();
    const matched = alts.some((t) => t.includes(target));
    onResult({ matched, transcript: alts[0] || '' });
  };

  recognition.onerror = () => {
    if (!settled) {
      settled = true;
      onError();
    }
  };

  recognition.onend = () => {
    if (!settled) {
      settled = true;
      onError();
    }
  };

  try {
    recognition.start();
  } catch {
    onError();
  }

  return () => {
    try {
      recognition.stop();
    } catch {
      // Ignore stop errors
    }
  };
}
