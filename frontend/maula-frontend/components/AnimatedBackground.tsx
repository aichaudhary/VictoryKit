import React, { useEffect, useState, useMemo } from 'react';

// Floating Icon Animation
export const FloatingIcons: React.FC<{ icons: any[]; color: string }> = ({ icons, color }) => {
  const iconPositions = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      icon: icons[i % icons.length],
      x: 10 + (i * 12) % 80,
      y: 10 + (i * 17) % 80,
      delay: i * 0.5,
      duration: 15 + (i % 5) * 3,
    }))
  , [icons]);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {iconPositions.map((pos) => {
        const IconComponent = pos.icon;
        return (
          <div
            key={pos.id}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              animation: `float ${pos.duration}s ease-in-out infinite`,
              animationDelay: `${pos.delay}s`,
            }}
          >
            <IconComponent className={`w-8 h-8 ${color}`} style={{ opacity: 0.6 }} />
          </div>
        );
      })}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -30px) rotate(5deg); }
          50% { transform: translate(-15px, 20px) rotate(-5deg); }
          75% { transform: translate(30px, 10px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
};

// Particle Network
export const ParticleNetwork: React.FC<{ color: string }> = ({ color }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(initial);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {particles.map((p1, i) => 
          particles.slice(i + 1).map((p2, j) => {
            const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            if (distance < 25) {
              return (
                <line
                  key={`${i}-${j}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={color}
                  strokeWidth="0.1"
                  opacity={1 - distance / 25}
                >
                  <animate
                    attributeName="opacity"
                    values={`${0.2 - distance / 25};${0.5 - distance / 25};${0.2 - distance / 25}`}
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </line>
              );
            }
            return null;
          })
        )}
        {particles.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r="0.4"
            fill={color}
            filter="url(#glow)"
          >
            <animate
              attributeName="r"
              values="0.3;0.6;0.3"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};

// Radar Sweep
export const RadarSweep: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#radarGrad)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="0.2" opacity="0.3" />
        <circle cx="50" cy="50" r="20" fill="none" stroke={color} strokeWidth="0.2" opacity="0.3" />
        <circle cx="50" cy="50" r="10" fill="none" stroke={color} strokeWidth="0.2" opacity="0.3" />
      </svg>
    </div>
  );
};

// Data Stream
export const DataStream: React.FC<{ color: string }> = ({ color }) => {
  const [streams, setStreams] = useState<{ id: number; delay: number }[]>([]);

  useEffect(() => {
    setStreams(Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: i * 0.8,
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {streams.map((stream) => (
          <rect
            key={stream.id}
            x={(stream.id * 8.5) % 100}
            y="-10"
            width="0.5"
            height="20"
            fill={color}
            opacity="0.6"
          >
            <animate
              attributeName="y"
              from="-10"
              to="110"
              dur={`${6 + (stream.id % 3)}s`}
              repeatCount="indefinite"
              begin={`${stream.delay}s`}
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              dur={`${6 + (stream.id % 3)}s`}
              repeatCount="indefinite"
              begin={`${stream.delay}s`}
            />
          </rect>
        ))}
      </svg>
    </div>
  );
};

// Hexagon Grid
export const HexGrid: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 8 }, (_, row) => 
          Array.from({ length: 6 }, (_, col) => {
            const x = col * 15 + (row % 2) * 7.5;
            const y = row * 13;
            return (
              <polygon
                key={`${row}-${col}`}
                points="5,0 10,2.9 10,8.7 5,11.6 0,8.7 0,2.9"
                transform={`translate(${x}, ${y})`}
                fill="none"
                stroke={color}
                strokeWidth="0.2"
                opacity="0.4"
              >
                <animate
                  attributeName="opacity"
                  values="0.2;0.6;0.2"
                  dur={`${4 + (row + col) % 3}s`}
                  repeatCount="indefinite"
                  begin={`${(row + col) * 0.3}s`}
                />
              </polygon>
            );
          })
        )}
      </svg>
    </div>
  );
};

// Pulse Rings
export const PulseRings: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r="5"
            fill="none"
            stroke={color}
            strokeWidth="0.3"
          >
            <animate
              attributeName="r"
              from="5"
              to="50"
              dur="4s"
              repeatCount="indefinite"
              begin={`${i * 1.3}s`}
            />
            <animate
              attributeName="opacity"
              from="0.8"
              to="0"
              dur="4s"
              repeatCount="indefinite"
              begin={`${i * 1.3}s`}
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};
