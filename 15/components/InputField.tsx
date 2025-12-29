import React, { useRef, useEffect, useState } from 'react';

interface InputFieldProps {
  onInput: (char: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ onInput }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  // Keep focus on input for immersive experience
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    window.addEventListener('click', focusInput);
    focusInput();
    return () => window.removeEventListener('click', focusInput);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Check for added characters
    if (newValue.length > value.length) {
      const addedChars = newValue.slice(value.length);
      for (const char of addedChars) {
          // Only drop visible characters
          if (char.trim() !== '') {
            onInput(char);
          }
      }
    }
    
    setValue(newValue);
  };

  const glassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Neutral shadow
  };

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 w-full max-w-xs px-4">
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Start typing..."
          style={glassStyle}
          className="w-full text-left text-sm font-bold text-white rounded-full py-2 px-6 outline-none transition-all placeholder-white/30 tracking-widest uppercase"
          autoComplete="off"
          autoFocus
        />
      </div>
    </div>
  );
};

export default InputField;