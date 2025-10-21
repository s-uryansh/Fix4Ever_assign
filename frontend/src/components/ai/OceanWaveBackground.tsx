import React from 'react';

const OceanWaveBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-200/30 to-transparent"></div>
      <div className="absolute bottom-0 w-[200%] h-20 bg-blue-300/20 animate-wave rounded-full"></div>
      <div className="absolute bottom-4 w-[180%] h-16 bg-blue-400/15 animate-wave-slow rounded-full"></div>
      <div className="absolute bottom-8 w-[220%] h-12 bg-blue-500/10 animate-wave rounded-full"></div>
    </div>
  );
};

export default OceanWaveBackground;