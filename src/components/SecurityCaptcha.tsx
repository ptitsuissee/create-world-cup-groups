import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Shield } from 'lucide-react';

interface SecurityCaptchaProps {
  onVerify: (verified: boolean) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function SecurityCaptcha({ onVerify, difficulty = 'medium' }: SecurityCaptchaProps) {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const generateQuestion = () => {
    let num1: number, num2: number, operation: string;
    
    switch (difficulty) {
      case 'easy':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operation = '+';
        setQuestion(`${num1} + ${num2}`);
        setCorrectAnswer(num1 + num2);
        break;
      
      case 'medium':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        const ops = ['+', '-'];
        operation = ops[Math.floor(Math.random() * ops.length)];
        if (operation === '+') {
          setQuestion(`${num1} + ${num2}`);
          setCorrectAnswer(num1 + num2);
        } else {
          setQuestion(`${num1} - ${num2}`);
          setCorrectAnswer(num1 - num2);
        }
        break;
      
      case 'hard':
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
        const hardOps = ['+', '-', '×'];
        operation = hardOps[Math.floor(Math.random() * hardOps.length)];
        if (operation === '+') {
          setQuestion(`${num1} + ${num2}`);
          setCorrectAnswer(num1 + num2);
        } else if (operation === '-') {
          // Ensure positive result
          const larger = Math.max(num1, num2);
          const smaller = Math.min(num1, num2);
          setQuestion(`${larger} - ${smaller}`);
          setCorrectAnswer(larger - smaller);
        } else {
          setQuestion(`${num1} × ${num2}`);
          setCorrectAnswer(num1 * num2);
        }
        break;
    }
    
    setUserAnswer('');
    setIsVerified(false);
  };

  useEffect(() => {
    generateQuestion();
  }, [difficulty]);

  const handleVerify = () => {
    const answer = parseInt(userAnswer);
    
    if (isNaN(answer)) {
      return;
    }
    
    if (answer === correctAnswer) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setAttempts(prev => prev + 1);
      
      // After 3 failed attempts, generate new question
      if (attempts >= 2) {
        generateQuestion();
        setAttempts(0);
      }
      
      onVerify(false);
      setUserAnswer('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={18} className="text-green-400" />
        <span className="text-sm">Vérification de sécurité</span>
      </div>
      
      {!isVerified ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-lg p-3 border border-white/20 text-center text-xl">
              {question} = ?
            </div>
            <button
              onClick={generateQuestion}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              title="Nouvelle question"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Votre réponse"
              className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400"
              autoComplete="off"
            />
            <button
              onClick={handleVerify}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all"
            >
              Vérifier
            </button>
          </div>
          
          {attempts > 0 && (
            <p className="text-xs text-red-400">
              Réponse incorrecte. Essayez encore. ({3 - attempts} tentatives restantes)
            </p>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 text-green-400"
        >
          <Shield size={20} />
          <span>✓ Vérifié</span>
        </motion.div>
      )}
    </div>
  );
}
