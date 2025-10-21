'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { DiagonalSlideTransition } from './Transition';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('register');
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const switchMode = (next: AuthMode) => {
    if (isAnimating || next === mode) return;
    setDirection(next === 'register' ? 'right' : 'left');
    setIsAnimating(true);
  };

  const onAnimationComplete = () => {
    setMode(direction === 'right' ? 'register' : 'login');
    setIsAnimating(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="px-6 pt-5 pb-3 text-center">
        <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow">
          <span className="text-white text-xl">🌊</span>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          Welcome to Fix4Ever
        </h2>
        <p className="text-xs text-gray-500 mt-1">Your trusted repair marketplace</p>
      </div>

      <div className="mx-6 mb-3 flex bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-1 border border-sky-200">
        <button
          onClick={() => switchMode('register')}
          className={`flex-1 py-2 text-sm rounded-lg font-semibold transition-all ${
            mode === 'register'
              ? 'bg-white text-sky-600 shadow'
              : 'text-sky-500 hover:text-sky-600'
          }`}
        >
          Create Account
        </button>
        <button
          onClick={() => switchMode('login')}
          className={`flex-1 py-2 text-sm rounded-lg font-semibold transition-all ${
            mode === 'login'
              ? 'bg-white text-sky-600 shadow'
              : 'text-sky-500 hover:text-sky-600'
          }`}
        >
          Sign In
        </button>
      </div>

      <div className="relative mx-6 mb-4 min-h-[440px] rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 overflow-hidden shadow-inner">
        <AnimatePresence mode="wait">
          {isAnimating && (
            <DiagonalSlideTransition
              direction={direction}
              onAnimationComplete={onAnimationComplete}
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 p-5 overflow-y-auto">
          {mode === 'register' ? (
            <RegisterForm
              onSuccess={onClose}
              onSwitchToLogin={() => switchMode('login')}
            />
          ) : (
            <LoginForm
              onSuccess={onClose}
              onSwitchToRegister={() => switchMode('register')}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
