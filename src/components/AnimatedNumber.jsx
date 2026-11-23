import React from 'react';
import { useCountUp } from '../hooks/useCountUp.js';
import { useApp } from '../context/AppContext.jsx';

export const AnimatedNumber = ({ value, duration = 800, decimals = 0 }) => {
  const { formatMoney } = useApp();
  const animatedVal = useCountUp(value, duration);

  return <>{formatMoney(animatedVal, decimals)}</>;
};
