'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface Props {
  direction?: 'left' | 'right';
  onAnimationComplete?: () => void;
}

export const DiagonalSlideTransition: React.FC<Props> = ({
  direction = 'right',
  onAnimationComplete,
}) => {
  const fromX = direction === 'right' ? '-100%' : '100%';
  const toX = '0%';
  const exitX = direction === 'right' ? '100%' : '-100%';

  return (
    <motion.div
      className="absolute inset-0 z-40 pointer-events-none"
      initial={{ x: fromX }}
      animate={{ x: toX }}
      exit={{ x: exitX }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onAnimationComplete}
      style={{
        background:
          'linear-gradient(115deg, #38bdf8 0%, #0ea5e9 50%, #3b82f6 100%)',
        transform: 'skewY(-12deg)',
        boxShadow: '0 0 30px rgba(56,189,248,0.4)',
      }}
    />
  );
};
