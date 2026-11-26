import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export const Amount = ({ value, decimals = 0, className = '' }) => {
  const { formatMoney } = useApp();
  return (
    <span className={`font-mono font-bold ${className}`}>
      {formatMoney(value, decimals)}
    </span>
  );
};
