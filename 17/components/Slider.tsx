import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
}) => {
  const display =
    formatValue?.(value) ??
    (typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : String(value));

  return (
    <div>
      <div className="panel17-row">
        <label>{label}</label>
        <div className="panel17-value">{display}</div>
      </div>
      <input
        className="panel17-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

export default Slider;
