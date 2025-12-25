/**
 * CharacterPortrait Component
 *
 * Displays a character's portrait with mood indicator.
 */

import React from 'react';
import type { Scene } from '../../types/storyEngine';

interface CharacterPortraitProps {
  speaker: NonNullable<Scene['speaker']>;
  size?: 'sm' | 'md' | 'lg';
}

const CharacterPortrait: React.FC<CharacterPortraitProps> = ({ speaker, size = 'md' }) => {
  // Get mood-based styling
  const getMoodStyles = () => {
    switch (speaker.mood) {
      case 'happy':
        return {
          borderColor: 'border-green-500',
          bgColor: 'bg-green-950/30',
          icon: 'fa-smile',
        };
      case 'angry':
        return {
          borderColor: 'border-red-500',
          bgColor: 'bg-red-950/30',
          icon: 'fa-angry',
        };
      case 'worried':
        return {
          borderColor: 'border-yellow-500',
          bgColor: 'bg-yellow-950/30',
          icon: 'fa-frown',
        };
      case 'smug':
        return {
          borderColor: 'border-purple-500',
          bgColor: 'bg-purple-950/30',
          icon: 'fa-meh',
        };
      case 'disappointed':
        return {
          borderColor: 'border-gray-500',
          bgColor: 'bg-gray-950/30',
          icon: 'fa-sad-tear',
        };
      default:
        return {
          borderColor: 'border-gray-600',
          bgColor: 'bg-gray-900',
          icon: 'fa-user',
        };
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10 text-lg';
      case 'lg':
        return 'w-20 h-20 text-4xl';
      default:
        return 'w-14 h-14 text-2xl';
    }
  };

  // Get character icon based on ID
  const getCharacterIcon = () => {
    const id = speaker.id.toLowerCase();
    if (id.includes('chad')) return 'fa-user-tie';
    if (id.includes('sarah')) return 'fa-user-graduate';
    if (id.includes('hunter')) return 'fa-user-secret';
    if (id.includes('miles')) return 'fa-headset';
    if (speaker.avatar) return speaker.avatar;
    return 'fa-user';
  };

  const moodStyles = getMoodStyles();
  const sizeClasses = getSizeClasses();

  return (
    <div
      className={`
        ${sizeClasses}
        ${moodStyles.borderColor}
        ${moodStyles.bgColor}
        border-2 rounded-sm
        flex items-center justify-center
        relative
        transition-all duration-300
      `}
    >
      <i className={`fas ${getCharacterIcon()} text-gray-300`} />

      {/* Mood indicator */}
      {speaker.mood && speaker.mood !== 'neutral' && (
        <div
          className={`
            absolute -bottom-1 -right-1
            w-4 h-4 rounded-full
            ${moodStyles.bgColor}
            border ${moodStyles.borderColor}
            flex items-center justify-center
            text-[8px]
          `}
        >
          <i className={`fas ${moodStyles.icon}`} />
        </div>
      )}
    </div>
  );
};

export default CharacterPortrait;
