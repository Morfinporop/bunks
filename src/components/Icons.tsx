/**
 * SVG Icon Components with style support
 */
import React from 'react';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const BunkerIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21V11L12 3L21 11V21H14V15H10V21H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const UserIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const CardIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
    <circle cx="7" cy="15" r="1.5" fill="currentColor"/>
  </svg>
);

export const VoteIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const TimerIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 9V13L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const WarningIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 19H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16.5" r="0.5" fill="currentColor" stroke="currentColor"/>
  </svg>
);

export const RadioactiveIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <path d="M12 4V8M12 16V20M4 12H8M16 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const TrophyIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 6H17V11C17 13.7614 14.7614 16 12 16C9.23858 16 7 13.7614 7 11V6Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 16V20M8 20H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 8H5C4.44772 8 4 8.44772 4 9V10C4 11.1046 4.89543 12 6 12H7" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 8H19C19.5523 8 20 8.44772 20 9V10C20 11.1046 19.1046 12 18 12H17" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const PlayIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
  </svg>
);

export const PauseIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
  </svg>
);

export const ChatIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20V16H8L4 20V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M8 10H16M8 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SettingsIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 2V5M12 19V22M22 12H19M5 12H2M19.07 4.93L17 7M7 17L4.93 19.07M19.07 19.07L17 17M7 7L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const DiceIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="8" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
  </svg>
);

export const CheckIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CrossIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const ArrowRightIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArrowLeftIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LockIcon = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
  </svg>
);
