import React from 'react';
import type { ChangeEvent, JSX } from "react";

interface INumberInputProps {
  value: number;
  placeholder?: string;
  min?: number;
  max?: number;
  onChange?: (value: number) => void; 
}


function NumberInput(props: INumberInputProps): JSX.Element{
    const { value, placeholder, min, max, onChange } = props;

    const clamp = (v: number) => {
      let out = v;
      if (typeof min === "number") out = Math.max(out, min);
      if (typeof max === "number") out = Math.min(out, max);
      return out;
    };

    const handleIncrement = () => {
      onChange?.(clamp(value + 1));
    };

    const handleDecrement = () => {
      onChange?.(clamp(value - 1));
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      if(e?.target == null) return;
      
      const n = Number(e.target.value);
      if (!Number.isNaN(n)) onChange?.(clamp(n));
    };

  return (
    <div className="number-input-wrapper">
      <button type="button" onClick={handleDecrement}>-</button>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="number-input"
      />
      <button type="button" onClick={handleIncrement}>+</button>
    </div>
  );
}


export default React.memo(NumberInput);