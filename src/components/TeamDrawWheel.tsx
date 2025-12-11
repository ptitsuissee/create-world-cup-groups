import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Volume2, VolumeX } from 'lucide-react';
import type { Country, Group } from '../App';
import type { Translations } from '../translations';

interface TeamDrawWheelProps {
  group: Group;
  availableTeams: Country[];
  onComplete: (teamId: string) => void;
  onClose: () => void;
  translations: Translations;
}

export function TeamDrawWheel({ group, availableTeams, onComplete, onClose, translations }: TeamDrawWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Country | null>(null);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  // Create tick sound effect
  const playTickSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Silently fail if audio context not supported
    }
  };

  // Create SVG arc path for each segment
  const createArcPath = (index: number, total: number): string => {
    const radius = 200;
    const centerX = 250;
    const centerY = 250;
    const anglePerSegment = (2 * Math.PI) / total;
    const startAngle = index * anglePerSegment - Math.PI / 2;
    const endAngle = (index + 1) * anglePerSegment - Math.PI / 2;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = anglePerSegment > Math.PI ? 1 : 0;
    
    return `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
  };

  // Calculate text position for each segment
  const getTextPosition = (index: number, total: number) => {
    const anglePerSegment = (2 * Math.PI) / total;
    const midAngle = (index + 0.5) * anglePerSegment - Math.PI / 2;
    const radius = 140;
    const x = 250 + radius * Math.cos(midAngle);
    const y = 250 + radius * Math.sin(midAngle);
    const rotation = (midAngle * 180) / Math.PI + 90;
    
    return { x, y, rotation };
  };

  // Calculate flag position for each segment
  const getFlagPosition = (index: number, total: number) => {
    const anglePerSegment = (2 * Math.PI) / total;
    const midAngle = (index + 0.5) * anglePerSegment - Math.PI / 2;
    const radius = 110;
    const x = 250 + radius * Math.cos(midAngle);
    const y = 250 + radius * Math.sin(midAngle);
    const rotation = (midAngle * 180) / Math.PI + 90;
    
    return { x, y, rotation };
  };

  const startDraw = () => {
    if (hasSpun) return;
    setHasSpun(true);
    setSpinning(true);
    
    // Generate truly random rotation (8-10 full spins + random angle)
    const extraSpins = 8 + Math.random() * 2; // 8-10 spins
    const randomAngle = Math.random() * 360; // Random final angle
    const targetRotation = 360 * extraSpins + randomAngle;
    setRotation(targetRotation);
    
    // Calculate which team the wheel will land on after rotation
    // The pointer is at top, segments rotate clockwise
    const finalRotation = targetRotation % 360;
    const degreesPerTeam = 360 / availableTeams.length;
    // Since segments start at -90° (top) and rotate clockwise,
    // we need to find which segment ends up at -90° (270° in standard coords)
    const selectedIndex = Math.floor(((360 - finalRotation) / degreesPerTeam)) % availableTeams.length;
    const selectedTeamObj = availableTeams[selectedIndex];
    
    setSelectedTeamIndex(selectedIndex);
    setSelectedTeam(selectedTeamObj);
    
    // Tick sound effect
    let tickCount = 0;
    const maxTicks = 40;
    const startInterval = 50;
    const endInterval = 200;
    
    const scheduleTick = () => {
      if (tickCount >= maxTicks || !soundEnabled) {
        if (tickIntervalRef.current) {
          clearInterval(tickIntervalRef.current);
        }
        return;
      }
      
      playTickSound();
      tickCount++;
      
      const progress = tickCount / maxTicks;
      const currentInterval = startInterval + (endInterval - startInterval) * Math.pow(progress, 2);
      
      setTimeout(scheduleTick, currentInterval);
    };
    
    if (soundEnabled) {
      scheduleTick();
    }
    
    // Complete after animation
    setTimeout(() => {
      setSpinning(false);
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      setTimeout(() => {
        setShowResult(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }, 800);
    }, 5000);
  };

  const handleConfirmResult = () => {
    if (selectedTeam) {
      onComplete(selectedTeam.id);
    }
  };

  // Auto-close result after 3 seconds
  useEffect(() => {
    if (showResult && selectedTeam) {
      const timer = setTimeout(() => {
        onComplete(selectedTeam.id);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showResult, selectedTeam]);

  const colors = [
    '#ef4444', // red
    '#3b82f6', // blue
    '#22c55e', // green
    '#eab308', // yellow
    '#a855f7', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-pink-600/90 to-red-600/90 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close and Sound buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
            title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Group being drawn from */}
        <div className="text-center mb-8">
          <h2 className="text-3xl mb-4">{translations.drawingFromGroup}</h2>
          <div className="inline-flex items-center gap-3 bg-white/20 rounded-2xl px-6 py-4 backdrop-blur-sm border border-white/30">
            <span className="text-2xl">🎯</span>
            <span className="text-2xl">{group.name}</span>
          </div>
        </div>

        {/* Wheel */}
        <div className="relative w-full aspect-square max-w-md mx-auto mb-6">
          {/* Pointer with glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <motion.div 
              className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-yellow-400 drop-shadow-lg"
              animate={spinning ? {
                scale: [1, 1.1, 1],
                filter: ['drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))', 'drop-shadow(0 0 20px rgba(250, 204, 21, 1))', 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))']
              } : {}}
              transition={{
                duration: 0.5,
                repeat: spinning ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Wheel container */}
          <div className={`relative w-full h-full rounded-full border-8 border-yellow-400 shadow-2xl overflow-hidden ${spinning ? 'ring-4 ring-yellow-400/50 ring-offset-4 ring-offset-transparent' : ''}`}>
            <motion.svg
              viewBox="0 0 500 500"
              className="w-full h-full"
              animate={{ rotate: spinning ? rotation : 0 }}
              transition={{
                duration: spinning ? 5 : 0,
                ease: spinning ? [0.17, 0.67, 0.25, 0.99] : 'linear',
              }}
            >
              {/* Background circle */}
              <circle cx="250" cy="250" r="250" fill="#1e293b" />
              
              {/* Segments - NO GAPS GUARANTEED */}
              {availableTeams.map((team, index) => {
                const path = createArcPath(index, availableTeams.length);
                const color = colors[index % colors.length];
                const textPos = getTextPosition(index, availableTeams.length);
                const flagPos = getFlagPosition(index, availableTeams.length);
                const isUrl = team.flag.startsWith('http://') || 
                             team.flag.startsWith('https://') || 
                             team.flag.startsWith('data:');
                
                return (
                  <g key={`${team.id}-${index}`}>
                    {/* Segment */}
                    <path
                      d={path}
                      fill={color}
                      stroke="none"
                    />
                    {/* Segment border */}
                    <path
                      d={path}
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    
                    {/* Flag/Emoji */}
                    {isUrl ? (
                      <image
                        href={team.flag}
                        x={flagPos.x - 15}
                        y={flagPos.y - 15}
                        width="30"
                        height="30"
                        transform={`rotate(${flagPos.rotation}, ${flagPos.x}, ${flagPos.y})`}
                        style={{ borderRadius: '4px' }}
                      />
                    ) : (
                      <text
                        x={flagPos.x}
                        y={flagPos.y}
                        fill="white"
                        fontSize="24"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${flagPos.rotation}, ${flagPos.x}, ${flagPos.y})`}
                      >
                        {team.flag}
                      </text>
                    )}
                    
                    {/* Team name */}
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                      style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                    >
                      {team.name.length > 12 ? team.name.slice(0, 10) + '..' : team.name}
                    </text>
                  </g>
                );
              })}
              
              {/* Center circle */}
              <circle 
                cx="250" 
                cy="250" 
                r="40" 
                fill="url(#centerGradient)"
                stroke="white"
                strokeWidth="4"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </motion.svg>
            
            {/* Trophy icon on top of center */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              animate={spinning ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{
                duration: 0.6,
                repeat: spinning ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <Trophy size={32} className="text-white drop-shadow-lg" />
            </motion.div>
          </div>
        </div>

        {/* Spin Button or Result */}
        <AnimatePresence mode="wait">
          {!hasSpun ? (
            <motion.div
              key="spin-button"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <motion.button
                onClick={startDraw}
                className="px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all text-2xl relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <span className="relative z-10">🎯 {translations.spin || 'Tourner'}</span>
              </motion.button>
            </motion.div>
          ) : !spinning && selectedTeam && (
            <motion.div
              key="result"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-2xl mb-3">{translations.selectedTeam}</div>
              <div className="inline-flex items-center gap-3 bg-white/20 rounded-2xl px-8 py-4 backdrop-blur-sm border border-white/30">
                {(() => {
                  const isUrl = selectedTeam.flag.startsWith('http://') || 
                                selectedTeam.flag.startsWith('https://') || 
                                selectedTeam.flag.startsWith('data:');
                  
                  return (
                    <>
                      {isUrl ? (
                        <img src={selectedTeam.flag} alt={selectedTeam.name} className="w-10 h-10 object-cover rounded-lg" />
                      ) : (
                        <span className="text-4xl">{selectedTeam.flag}</span>
                      )}
                      <span className="text-3xl">{selectedTeam.name}</span>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'][i % 6],
                }}
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  y: window.innerHeight,
                  opacity: 0,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  x: (Math.random() - 0.5) * 200,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "easeIn"
                }}
              />
            ))}
          </div>
        )}

        {/* Big Result Overlay */}
        <AnimatePresence>
          {showResult && selectedTeam && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-[60] p-8"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="text-center max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <h2 className="text-3xl md:text-4xl mb-4">{translations.selectedTeam}</h2>
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                  className="bg-gradient-to-br from-yellow-400/30 to-orange-500/30 backdrop-blur-xl rounded-3xl px-12 py-8 inline-block border-4 border-yellow-400 shadow-2xl"
                >
                  <div className="flex flex-col items-center gap-4">
                    {(() => {
                      const isUrl = selectedTeam.flag.startsWith('http://') || 
                                    selectedTeam.flag.startsWith('https://') || 
                                    selectedTeam.flag.startsWith('data:');
                      
                      return (
                        <>
                          {isUrl ? (
                            <motion.img 
                              src={selectedTeam.flag} 
                              alt={selectedTeam.name} 
                              className="w-24 h-24 object-cover rounded-2xl shadow-2xl"
                              animate={{
                                scale: [1, 1.05, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          ) : (
                            <motion.span 
                              className="text-6xl drop-shadow-2xl"
                              animate={{
                                scale: [1, 1.05, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {selectedTeam.flag}
                            </motion.span>
                          )}
                        </>
                      );
                    })()}
                    <motion.div 
                      className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 bg-clip-text text-transparent drop-shadow-2xl"
                      animate={{
                        scale: [1, 1.02, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {selectedTeam.name}
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 flex items-center justify-center gap-2"
                >
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}