import React from 'react';
import type { WeatherType } from '../data/animals';

interface AnimalSvgProps {
  animalId: string;
  className?: string;
}

export const AnimalIllustration: React.FC<AnimalSvgProps> = ({ animalId, className = 'w-14 h-14' }) => {
  switch (animalId) {
    case 'bee':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Wings */}
          <ellipse cx="32" cy="24" rx="11" ry="15" transform="rotate(-22 32 24)" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
          <ellipse cx="48" cy="24" rx="11" ry="15" transform="rotate(22 48 24)" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
          {/* Body */}
          <ellipse cx="40" cy="46" rx="20" ry="16" fill="#FACC15" stroke="#78350F" strokeWidth="2.8" />
          {/* Stripes */}
          <path d="M31 32 C29 41 29 51 31 60" stroke="#451A03" strokeWidth="5" strokeLinecap="round" />
          <path d="M41 31 C40 41 40 51 41 61" stroke="#451A03" strokeWidth="5" strokeLinecap="round" />
          {/* Stinger */}
          <path d="M18 46 L11 46 L18 42 Z" fill="#451A03" />
          {/* Cute face */}
          <circle cx="52" cy="43" r="2.6" fill="#1E293B" />
          <circle cx="53" cy="42" r="0.9" fill="#FFFFFF" />
          <circle cx="54" cy="48" r="2.8" fill="#FB7185" opacity="0.65" />
          <path d="M48 50 Q51 53 54 50" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
          {/* Antennae */}
          <path d="M51 31 Q54 22 59 22" stroke="#451A03" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="59" cy="22" r="2.5" fill="#451A03" />
        </svg>
      );

    case 'butterfly':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Upper wings */}
          <path d="M40 38 C24 14 6 20 12 40 C15 49 28 48 40 42Z" fill="#FB7185" stroke="#881337" strokeWidth="2.5" />
          <path d="M40 38 C56 14 74 20 68 40 C65 49 52 48 40 42Z" fill="#FB7185" stroke="#881337" strokeWidth="2.5" />
          {/* Lower wings */}
          <path d="M40 44 C26 45 14 54 20 64 C26 72 37 62 40 50Z" fill="#FBBF24" stroke="#881337" strokeWidth="2.5" />
          <path d="M40 44 C54 45 66 54 60 64 C54 72 43 62 40 50Z" fill="#FBBF24" stroke="#881337" strokeWidth="2.5" />
          {/* Wing dots */}
          <circle cx="22" cy="34" r="4.5" fill="#FEF08A" />
          <circle cx="58" cy="34" r="4.5" fill="#FEF08A" />
          <circle cx="26" cy="57" r="3" fill="#FFF1F2" />
          <circle cx="54" cy="57" r="3" fill="#FFF1F2" />
          {/* Body */}
          <rect x="36.5" y="29" width="7" height="29" rx="3.5" fill="#4C1D95" />
          <circle cx="40" cy="27" r="5.5" fill="#5B21B6" />
          <circle cx="38" cy="26.5" r="1.2" fill="#FFFFFF" />
          <circle cx="42" cy="26.5" r="1.2" fill="#FFFFFF" />
          {/* Antennae */}
          <path d="M38 22 Q32 14 28 16" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" />
          <path d="M42 22 Q48 14 52 16" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'rabbit':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Ears */}
          <ellipse cx="30" cy="23" rx="6.5" ry="17" transform="rotate(-10 30 23)" fill="#FFFFFF" stroke="#475569" strokeWidth="2.5" />
          <ellipse cx="30" cy="24" rx="3.2" ry="11" transform="rotate(-10 30 24)" fill="#FDA4AF" />
          <ellipse cx="50" cy="23" rx="6.5" ry="17" transform="rotate(10 50 23)" fill="#FFFFFF" stroke="#475569" strokeWidth="2.5" />
          <ellipse cx="50" cy="24" rx="3.2" ry="11" transform="rotate(10 50 24)" fill="#FDA4AF" />
          {/* Head */}
          <ellipse cx="40" cy="49" rx="20" ry="17" fill="#FFFFFF" stroke="#475569" strokeWidth="2.5" />
          {/* Cheeks & Eyes */}
          <circle cx="32" cy="46" r="2.7" fill="#1E293B" />
          <circle cx="48" cy="46" r="2.7" fill="#1E293B" />
          <circle cx="33" cy="45" r="0.9" fill="#FFFFFF" />
          <circle cx="49" cy="45" r="0.9" fill="#FFFFFF" />
          <circle cx="27" cy="52" r="3.5" fill="#FDA4AF" opacity="0.7" />
          <circle cx="53" cy="52" r="3.5" fill="#FDA4AF" opacity="0.7" />
          {/* Nose & Mouth */}
          <ellipse cx="40" cy="51" rx="3.2" ry="2.2" fill="#F43F5E" />
          <path d="M36 55 Q40 58 40 53 Q40 58 44 55" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'bird':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Tail */}
          <path d="M18 45 L8 38 L12 49 L8 54 L20 51Z" fill="#0284C7" stroke="#0C4A6E" strokeWidth="2.2" strokeLinejoin="round" />
          {/* Body */}
          <ellipse cx="41" cy="45" rx="20" ry="17" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="2.5" />
          {/* Belly */}
          <path d="M28 50 Q41 62 55 49 Q48 59 41 60 Q32 59 28 50Z" fill="#E0F2FE" />
          {/* Wing */}
          <path d="M27 42 C25 32 42 33 44 45 C42 52 29 51 27 42Z" fill="#0EA5E9" stroke="#0C4A6E" strokeWidth="2.2" />
          {/* Crest */}
          <path d="M40 28 Q39 20 45 21 Q43 25 46 28" stroke="#0C4A6E" strokeWidth="2.4" strokeLinecap="round" fill="#38BDF8" />
          {/* Beak */}
          <path d="M58 41 L69 44 L58 48 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2.2" strokeLinejoin="round" />
          {/* Eye */}
          <circle cx="51" cy="39" r="2.8" fill="#0F172A" />
          <circle cx="52" cy="38" r="1" fill="#FFFFFF" />
          <circle cx="52" cy="45" r="2.8" fill="#FB7185" opacity="0.6" />
          {/* Feet */}
          <path d="M36 62 L36 69 M46 62 L46 69" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'dog':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Floppy Ears */}
          <ellipse cx="20" cy="43" rx="8" ry="16" transform="rotate(16 20 43)" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
          <ellipse cx="60" cy="43" rx="8" ry="16" transform="rotate(-16 60 43)" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
          {/* Head */}
          <circle cx="40" cy="43" r="21" fill="#FBBF24" stroke="#451A03" strokeWidth="2.5" />
          {/* Spot */}
          <circle cx="31" cy="39" r="7" fill="#D97706" opacity="0.6" />
          {/* Muzzle */}
          <ellipse cx="40" cy="51" rx="11" ry="8.5" fill="#FEF3C7" />
          {/* Eyes */}
          <circle cx="31" cy="39" r="2.8" fill="#1E293B" />
          <circle cx="49" cy="39" r="2.8" fill="#1E293B" />
          <circle cx="32" cy="38" r="1" fill="#FFFFFF" />
          <circle cx="50" cy="38" r="1" fill="#FFFFFF" />
          {/* Nose & Tongue */}
          <ellipse cx="40" cy="47.5" rx="4.2" ry="3" fill="#451A03" />
          <path d="M37 54 Q40 61 43 54" fill="#FB7185" stroke="#9F1239" strokeWidth="1.8" />
          <path d="M34 52 Q40 56 46 52" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'cat':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Ears */}
          <path d="M21 36 L18 16 L35 26 Z" fill="#FB923C" stroke="#7C2D12" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M59 36 L62 16 L45 26 Z" fill="#FB923C" stroke="#7C2D12" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M23 32 L21 21 L31 27 Z" fill="#FDBA74" />
          <path d="M57 32 L59 21 L49 27 Z" fill="#FDBA74" />
          {/* Head */}
          <ellipse cx="40" cy="45" rx="21" ry="18" fill="#FDBA74" stroke="#7C2D12" strokeWidth="2.5" />
          {/* Forehead stripes */}
          <path d="M40 28 L40 34 M35 29 L36 34 M45 29 L44 34" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="31" cy="43" r="2.8" fill="#1E293B" />
          <circle cx="49" cy="43" r="2.8" fill="#1E293B" />
          <circle cx="32" cy="42" r="1" fill="#FFFFFF" />
          <circle cx="50" cy="42" r="1" fill="#FFFFFF" />
          {/* Nose & Whiskers */}
          <path d="M37 49 L43 49 L40 52 Z" fill="#F43F5E" />
          <path d="M35 54 Q40 57 45 54" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 45 L25 46 M16 51 L25 50 M64 45 L55 46 M64 51 L55 50" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'frog':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Eye bumps */}
          <circle cx="27" cy="29" r="9.5" fill="#4ADE80" stroke="#14532D" strokeWidth="2.5" />
          <circle cx="53" cy="29" r="9.5" fill="#4ADE80" stroke="#14532D" strokeWidth="2.5" />
          <circle cx="27" cy="29" r="5" fill="#FFFFFF" />
          <circle cx="53" cy="29" r="5" fill="#FFFFFF" />
          <circle cx="28" cy="29" r="2.6" fill="#0F172A" />
          <circle cx="54" cy="29" r="2.6" fill="#0F172A" />
          {/* Body / Face */}
          <ellipse cx="40" cy="48" rx="23" ry="17" fill="#4ADE80" stroke="#14532D" strokeWidth="2.5" />
          <ellipse cx="40" cy="54" rx="15" ry="9" fill="#DCFCE7" />
          {/* Cheeks & Big Smile */}
          <circle cx="24" cy="47" r="3.8" fill="#FB7185" opacity="0.65" />
          <circle cx="56" cy="47" r="3.8" fill="#FB7185" opacity="0.65" />
          <path d="M29 47 Q40 56 51 47" stroke="#14532D" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'duck':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Body */}
          <ellipse cx="38" cy="52" rx="20" ry="14" fill="#FDE047" stroke="#854D0E" strokeWidth="2.5" />
          {/* Head */}
          <circle cx="44" cy="34" r="14" fill="#FDE047" stroke="#854D0E" strokeWidth="2.5" />
          {/* Wing */}
          <path d="M24 50 C25 42 40 44 41 53 C38 59 26 57 24 50Z" fill="#FACC15" stroke="#854D0E" strokeWidth="2.2" />
          {/* Beak */}
          <ellipse cx="59" cy="36" rx="9" ry="4.5" fill="#FB923C" stroke="#9A3412" strokeWidth="2.2" />
          {/* Eye */}
          <circle cx="47" cy="31" r="2.6" fill="#1E293B" />
          <circle cx="48" cy="30" r="0.9" fill="#FFFFFF" />
          <circle cx="44" cy="37" r="2.8" fill="#FB7185" opacity="0.6" />
          {/* Little tuft */}
          <path d="M40 20 Q42 14 46 17" stroke="#854D0E" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'fish':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Tail */}
          <path d="M22 42 L8 28 L12 42 L8 56 Z" fill="#FB7185" stroke="#9F1239" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Top Fin */}
          <path d="M35 26 Q43 14 50 26Z" fill="#FDA4AF" stroke="#9F1239" strokeWidth="2.2" />
          {/* Body */}
          <ellipse cx="44" cy="42" rx="22" ry="16" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="2.5" />
          {/* Stripes */}
          <path d="M38 27 Q35 42 38 57" stroke="#BAE6FD" strokeWidth="4" strokeLinecap="round" />
          <path d="M47 27 Q44 42 47 57" stroke="#BAE6FD" strokeWidth="3.5" strokeLinecap="round" />
          {/* Eye & Smile */}
          <circle cx="56" cy="38" r="3.2" fill="#FFFFFF" stroke="#0C4A6E" strokeWidth="1.5" />
          <circle cx="57" cy="38" r="1.7" fill="#0F172A" />
          <path d="M56 46 Q60 49 63 45" stroke="#0C4A6E" strokeWidth="2" strokeLinecap="round" />
          {/* Bubbles */}
          <circle cx="70" cy="30" r="2.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
          <circle cx="73" cy="22" r="1.8" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
        </svg>
      );

    case 'turtle':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Legs */}
          <ellipse cx="26" cy="59" rx="5" ry="6" fill="#86EFAC" stroke="#14532D" strokeWidth="2.3" />
          <ellipse cx="48" cy="59" rx="5" ry="6" fill="#86EFAC" stroke="#14532D" strokeWidth="2.3" />
          {/* Head */}
          <circle cx="60" cy="45" r="10" fill="#86EFAC" stroke="#14532D" strokeWidth="2.5" />
          <circle cx="63" cy="43" r="2.1" fill="#0F172A" />
          <path d="M61 49 Q64 51 67 48" stroke="#14532D" strokeWidth="1.8" strokeLinecap="round" />
          {/* Shell */}
          <path d="M16 53 C16 32 54 32 54 53 Z" fill="#10B981" stroke="#064E3B" strokeWidth="2.8" />
          <path d="M14 53 L56 53" stroke="#064E3B" strokeWidth="3.2" strokeLinecap="round" />
          {/* Shell hexagons */}
          <path d="M29 40 L41 40 L45 48 L25 48 Z" fill="#FBBF24" stroke="#064E3B" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );

    case 'snail':
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Soft Body */}
          <path d="M14 58 C18 52 50 54 62 46 C67 43 69 52 63 57 C54 63 22 63 14 58 Z" fill="#FDE68A" stroke="#78350F" strokeWidth="2.5" />
          {/* Antennae */}
          <path d="M58 46 L61 34 M63 47 L68 36" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="61" cy="33" r="2.6" fill="#78350F" />
          <circle cx="68" cy="35" r="2.6" fill="#78350F" />
          {/* Cute face */}
          <circle cx="61" cy="52" r="1.8" fill="#1E293B" />
          {/* Shell */}
          <circle cx="35" cy="42" r="16" fill="#F472B6" stroke="#831843" strokeWidth="2.6" />
          <path
            d="M35 42 C35 38 40 38 40 42 C40 47 31 48 30 42 C29 34 43 32 45 41"
            stroke="#831843"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'crab':
    default:
      return (
        <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true">
          {/* Legs */}
          <path d="M22 50 L12 56 M24 55 L15 63 M58 50 L68 56 M56 55 L65 63" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" />
          {/* Claws */}
          <path d="M22 42 Q14 32 18 24" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="18" cy="22" r="6.5" fill="#EF4444" stroke="#991B1B" strokeWidth="2.3" />
          <path d="M58 42 Q66 32 62 24" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="62" cy="22" r="6.5" fill="#EF4444" stroke="#991B1B" strokeWidth="2.3" />
          {/* Eye stalks */}
          <path d="M33 34 L31 24 M47 34 L49 24" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="31" cy="23" r="4.2" fill="#FFFFFF" stroke="#991B1B" strokeWidth="2" />
          <circle cx="49" cy="23" r="4.2" fill="#FFFFFF" stroke="#991B1B" strokeWidth="2" />
          <circle cx="31" cy="23" r="1.8" fill="#0F172A" />
          <circle cx="49" cy="23" r="1.8" fill="#0F172A" />
          {/* Shell Body */}
          <ellipse cx="40" cy="47" rx="21" ry="15" fill="#EF4444" stroke="#991B1B" strokeWidth="2.6" />
          <circle cx="28" cy="49" r="3" fill="#FCA5A5" opacity="0.65" />
          <circle cx="52" cy="49" r="3" fill="#FCA5A5" opacity="0.65" />
          <path d="M34 50 Q40 55 46 50" stroke="#7F1D1D" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
      );
  }
};

export const FallingWeatherToken: React.FC<{
  weather: WeatherType;
  animalId: string;
  word: string;
}> = ({ weather, animalId, word }) => {
  if (weather === 'sunny') {
    return (
      <div className="relative flex flex-col items-center select-none pointer-events-none">
        {/* Sunburst halo */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg
            viewBox="0 0 110 110"
            className="absolute inset-0 w-full h-full drop-shadow-[0_6px_12px_rgba(245,158,11,0.35)]"
            aria-hidden="true"
          >
            {/* Sun rays */}
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x="52"
                y="2"
                width="6"
                height="13"
                rx="3"
                fill="#F59E0B"
                transform={`rotate(${i * 30} 55 55)`}
              />
            ))}
            <circle cx="55" cy="55" r="38" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="4" />
          </svg>
          <div className="relative z-10 flex items-center justify-center">
            <AnimalIllustration animalId={animalId} className="w-14 h-14" />
          </div>
        </div>
        <div className="mt-0.5 px-2.5 py-1 rounded-xl bg-amber-50/95 border border-amber-300 shadow-sm text-center leading-tight">
          <span className="block font-display text-sm font-bold text-amber-950 tracking-wide">
            {word}
          </span>
          <span className="block text-[10px] font-semibold text-amber-700">
            Sunny day
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none">
      {/* Rainy Cloud shell with falling raindrops */}
      <div className="relative w-28 h-24 flex items-center justify-center">
        <svg
          viewBox="0 0 130 108"
          className="absolute inset-0 w-full h-full drop-shadow-[0_6px_12px_rgba(2,132,199,0.28)]"
          aria-hidden="true"
        >
          {/* Fluffy Rainy Cloud */}
          <path
            d="M34 74 H98 C112 74 122 64 122 52 C122 41 114 32 103 31 C100 17 87 7 72 7 C59 7 47 15 43 27 C39 25 35 24 30 24 C17 24 8 34 8 47 C8 62 19 74 34 74 Z"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Soft cloud highlight */}
          <path
            d="M49 23 C54 16 63 12 72 12 C81 12 89 16 93 23"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* Falling raindrops below the cloud */}
          <path
            d="M39 81 C39 81 44 88 44 92 C44 95 41.8 97 39 97 C36.2 97 34 95 34 92 C34 88 39 81 39 81 Z"
            fill="#38BDF8"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          <path
            d="M65 84 C65 84 70 91 70 95 C70 98 67.8 100 65 100 C62.2 100 60 98 60 95 C60 91 65 84 65 84 Z"
            fill="#38BDF8"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          <path
            d="M91 81 C91 81 96 88 96 92 C96 95 93.8 97 91 97 C88.2 97 86 95 86 92 C86 88 91 81 91 81 Z"
            fill="#38BDF8"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
        </svg>
        <div className="relative z-10 pb-3 flex items-center justify-center">
          <AnimalIllustration animalId={animalId} className="w-13 h-13" />
        </div>
      </div>
      <div className="mt-0.5 px-2.5 py-1 rounded-xl bg-sky-50/95 border border-sky-300 shadow-sm text-center leading-tight">
        <span className="block font-display text-sm font-bold text-sky-950 tracking-wide">
          {word}
        </span>
        <span className="block text-[10px] font-semibold text-sky-700">
          Rainy day
        </span>
      </div>
    </div>
  );
};
