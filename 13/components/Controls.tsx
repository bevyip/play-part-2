import { ReactNode } from 'react';
import { AsciiSettings } from '../types';

interface ControlsProps {
  settings: AsciiSettings;
  updateSetting: <K extends keyof AsciiSettings>(key: K, value: AsciiSettings[K]) => void;
}

const SliderGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col w-full sm:w-64 max-w-full">
    <div className="flex justify-between items-center mb-2">
      <label className="text-xs uppercase tracking-widest text-neutral-400 font-medium">{label}</label>
    </div>
    {children}
  </div>
);

const Slider = ({
  value,
  min,
  max,
  step,
  onChange
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={(e) => onChange(parseFloat(e.target.value))}
    className="w-full h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-neutral-300 focus:outline-none"
  />
);

// Helper function to extract emoji characters from text
const extractEmoji = (text: string): string => {
  if (!text) return '';
  
  // Remove whitespace first
  const cleaned = text.trim();
  
  // Try Unicode property escapes (modern browsers)
  try {
    const emojiRegex = /[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Modifier}\p{Emoji_Component}]/gu;
    const matches = cleaned.match(emojiRegex);
    if (matches && matches.length > 0) {
      return matches.slice(0, 2).join('');
    }
  } catch (e) {
    // Fallback for browsers that don't support Unicode property escapes
  }
  
  // Fallback: Match common emoji ranges manually
  // This covers most emojis including skin tones and combined emojis
  const fallbackRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
  const fallbackMatches = cleaned.match(fallbackRegex);
  if (fallbackMatches && fallbackMatches.length > 0) {
    return fallbackMatches.slice(0, 2).join('');
  }
  
  // If no emoji found, return empty string
  return '';
};

export const Controls = ({ settings, updateSetting }: ControlsProps) => {
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const emoji = extractEmoji(pastedText);
    if (emoji) {
      updateSetting('emoji', emoji);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Extract emoji characters and limit to 2
    const emoji = extractEmoji(value);
    updateSetting('emoji', emoji || ' ');
  };

  return (
    <div className="flex flex-col w-full max-w-4xl items-center gap-6 p-6 md:p-8 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-auto select-none backdrop-blur-sm rounded-t-3xl md:rounded-none">
      
      {/* Input Section */}
      <div className="flex flex-col items-center gap-2 w-full">
         <div className="text-xs text-neutral-500 uppercase tracking-widest font-bold">SYMBOL</div>
         <input
          type="text"
          value={settings.emoji}
          onChange={handleChange}
          onPaste={handlePaste}
          className="bg-transparent border-b-2 border-neutral-700 text-5xl py-2 w-full max-w-[200px] text-center focus:outline-none focus:border-white font-emoji text-white transition-colors"
        />
      </div>

      {/* Sliders Section - Stacks on mobile, Row on larger screens */}
      <div className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center">
        <SliderGroup label={`Resolution ${settings.resolution}`}>
          <Slider
            value={settings.resolution}
            min={10}
            max={150}
            step={2}
            onChange={(v) => updateSetting('resolution', v)}
          />
        </SliderGroup>

        <SliderGroup label={`Contrast ${settings.contrast.toFixed(1)}`}>
          <Slider
            value={settings.contrast}
            min={0.1}
            max={3.0}
            step={0.1}
            onChange={(v) => updateSetting('contrast', v)}
          />
        </SliderGroup>
      </div>

    </div>
  );
};