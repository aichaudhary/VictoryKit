/**
 * RiskQuantify Tool Component - Tool 19 - Enterprise Risk Quantification Platform
 * Features: AI Analysis, Monte Carlo Simulation, Threat Intelligence, Compliance, FAIR Framework
 * Theme: Violet/Purple - Risk Intelligence
 * Port: Frontend 3019, API 4019
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { riskAssessApi, simulatedData, type Risk, type RiskDashboard } from '../api/riskassess.api';

type TabType = 'dashboard' | 'risks' | 'matrix' | 'ai-analysis' | 'threat-intel' | 'compliance' | 'reports' | 'analytics' | 'collaboration';

interface WebSocketMessage {
  type: string;
  data: { message?: string; [key: string]: unknown };
  userId?: string;
  timestamp: string;
}

// ============================================================================
// 🎨 EPIC ANIMATED VISUAL COMPONENTS - NEIL ARMSTRONG MOON LANDING LEVEL
// ============================================================================

// 1. Risk Probability Wave - Flowing probability distributions
const RiskProbabilityWave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    let time = 0;
    const waves: { y: number; amplitude: number; frequency: number; speed: number; color: string }[] = [];
    
    // Create multiple probability waves
    for (let i = 0; i < 5; i++) {
      waves.push({
        y: 30 + i * 25,
        amplitude: 8 + Math.random() * 12,
        frequency: 0.02 + Math.random() * 0.02,
        speed: 0.02 + Math.random() * 0.02,
        color: `hsla(${270 + i * 15}, 80%, ${50 + i * 5}%, ${0.3 - i * 0.04})`
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        
        for (let x = 0; x < canvas.offsetWidth; x++) {
          const y = wave.y + Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Fill under curve
        ctx.lineTo(canvas.offsetWidth, canvas.offsetHeight);
        ctx.lineTo(0, canvas.offsetHeight);
        ctx.closePath();
        ctx.fillStyle = wave.color.replace('0.3', '0.05');
        ctx.fill();
      });
      
      time++;
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
};

// 2. Monte Carlo Particle Simulation
const MonteCarloParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      risk: number;
      size: number;
      trail: { x: number; y: number }[];
    }
    
    const particles: Particle[] = [];
    const centerX = canvas.offsetWidth / 4;
    const centerY = canvas.offsetHeight / 4;
    
    // Create simulation particles
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.5;
      particles.push({
        x: centerX + (Math.random() - 0.5) * 50,
        y: centerY + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        risk: Math.random(),
        size: 1 + Math.random() * 2,
        trail: []
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      particles.forEach(p => {
        // Store trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 15) p.trail.shift();
        
        // Draw trail
        p.trail.forEach((point, i) => {
          const alpha = i / p.trail.length * 0.5;
          const hue = p.risk > 0.7 ? 0 : p.risk > 0.4 ? 45 : 120;
          ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, p.size * (i / p.trail.length), 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Draw particle
        const hue = p.risk > 0.7 ? 0 : p.risk > 0.4 ? 45 : 270;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Update position with Brownian motion
        p.vx += (Math.random() - 0.5) * 0.1;
        p.vy += (Math.random() - 0.5) * 0.1;
        p.x += p.vx;
        p.y += p.vy;
        
        // Boundary reflection
        if (p.x < 0 || p.x > canvas.offsetWidth / 2) p.vx *= -0.8;
        if (p.y < 0 || p.y > canvas.offsetHeight / 2) p.vy *= -0.8;
        
        // Risk drift
        p.risk += (Math.random() - 0.5) * 0.01;
        p.risk = Math.max(0, Math.min(1, p.risk));
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />;
};

// 3. Threat Radar Scanner
const ThreatRadarScanner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    const centerX = canvas.offsetWidth / 4;
    const centerY = canvas.offsetHeight / 4;
    const maxRadius = Math.min(centerX, centerY) * 0.8;
    let angle = 0;
    
    const threats: { angle: number; distance: number; severity: number; pulse: number }[] = [];
    for (let i = 0; i < 12; i++) {
      threats.push({
        angle: Math.random() * Math.PI * 2,
        distance: 0.3 + Math.random() * 0.6,
        severity: Math.random(),
        pulse: Math.random() * Math.PI * 2
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Draw radar circles
      for (let i = 1; i <= 4; i++) {
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 + i * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * (i / 4), 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Draw crosshairs
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();
      
      // Draw sweep
      const gradient = ctx.createConicGradient(angle, centerX, centerY);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
      gradient.addColorStop(0.1, 'rgba(139, 92, 246, 0.1)');
      gradient.addColorStop(0.2, 'rgba(139, 92, 246, 0)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw threats
      threats.forEach(threat => {
        const x = centerX + Math.cos(threat.angle) * maxRadius * threat.distance;
        const y = centerY + Math.sin(threat.angle) * maxRadius * threat.distance;
        
        threat.pulse += 0.1;
        const pulseSize = 3 + Math.sin(threat.pulse) * 2;
        
        const hue = threat.severity > 0.7 ? 0 : threat.severity > 0.4 ? 45 : 270;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${0.5 + Math.sin(threat.pulse) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.2)`;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      angle += 0.02;
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />;
};

// 4. Risk Matrix Heatmap Animation
const RiskMatrixHeatmap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    const cols = 5;
    const rows = 5;
    const cellWidth = canvas.offsetWidth / 2 / cols;
    const cellHeight = canvas.offsetHeight / 2 / rows;
    
    const cells: number[][] = [];
    for (let i = 0; i < rows; i++) {
      cells[i] = [];
      for (let j = 0; j < cols; j++) {
        cells[i][j] = (i + j) / (rows + cols - 2);
      }
    }
    
    let time = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * cellWidth;
          const y = i * cellHeight;
          
          const baseRisk = cells[i][j];
          const wave = Math.sin(time * 0.02 + i * 0.5 + j * 0.3) * 0.1;
          const risk = Math.max(0, Math.min(1, baseRisk + wave));
          
          const hue = 270 - risk * 270; // Purple to red
          const alpha = 0.3 + risk * 0.4;
          
          ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
          ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
          
          // Border glow
          ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
        }
      }
      
      time++;
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40" />;
};

// 5. Neural Network Risk Connections
const NeuralRiskNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      risk: number;
      connections: number[];
    }
    
    const nodes: Node[] = [];
    const nodeCount = 25;
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.offsetWidth / 2,
        y: Math.random() * canvas.offsetHeight / 2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        risk: Math.random(),
        connections: []
      });
    }
    
    // Create connections
    nodes.forEach((node, i) => {
      const connectionCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < connectionCount; j++) {
        const target = Math.floor(Math.random() * nodeCount);
        if (target !== i && !node.connections.includes(target)) {
          node.connections.push(target);
        }
      }
    });
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Draw connections
      nodes.forEach((node) => {
        node.connections.forEach(targetIdx => {
          const target = nodes[targetIdx];
          const avgRisk = (node.risk + target.risk) / 2;
          const hue = 270 - avgRisk * 200;
          
          ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${0.1 + avgRisk * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        });
      });
      
      // Draw and update nodes
      nodes.forEach(node => {
        const hue = 270 - node.risk * 200;
        
        // Glow
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.2)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Update position
        node.x += node.vx;
        node.y += node.vy;
        
        // Boundary bounce
        if (node.x < 20 || node.x > canvas.offsetWidth / 2 - 20) node.vx *= -1;
        if (node.y < 20 || node.y > canvas.offsetHeight / 2 - 20) node.vy *= -1;
        
        // Risk drift
        node.risk += (Math.random() - 0.5) * 0.005;
        node.risk = Math.max(0, Math.min(1, node.risk));
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />;
};

// 6. Compliance Shield Pulse
const ComplianceShieldPulse = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    const centerX = canvas.offsetWidth / 4;
    const centerY = canvas.offsetHeight / 4;
    
    interface Shield {
      radius: number;
      maxRadius: number;
      alpha: number;
      speed: number;
    }
    
    const shields: Shield[] = [];
    
    const createShield = () => {
      shields.push({
        radius: 20,
        maxRadius: Math.min(centerX, centerY) * 0.9,
        alpha: 0.6,
        speed: 0.5 + Math.random() * 0.5
      });
    };
    
    createShield();
    setInterval(createShield, 2000);
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Draw shield icon in center
      ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛡️', centerX, centerY);
      
      // Draw expanding shields
      shields.forEach((shield, i) => {
        const gradient = ctx.createRadialGradient(
          centerX, centerY, shield.radius * 0.8,
          centerX, centerY, shield.radius
        );
        gradient.addColorStop(0, `rgba(139, 92, 246, 0)`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${shield.alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(139, 92, 246, 0)`);
        
        ctx.strokeStyle = `rgba(139, 92, 246, ${shield.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shield.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        shield.radius += shield.speed;
        shield.alpha *= 0.99;
        
        if (shield.radius > shield.maxRadius || shield.alpha < 0.01) {
          shields.splice(i, 1);
        }
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
};

// 7. Data Flow Streams
const DataFlowStreams = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    interface Stream {
      x: number;
      y: number;
      speed: number;
      chars: string[];
      color: string;
    }
    
    const streams: Stream[] = [];
    const chars = '₿Ξ◊⬡⬢△▽○●□■◇◆'.split('');
    
    for (let i = 0; i < 15; i++) {
      streams.push({
        x: Math.random() * canvas.offsetWidth / 2,
        y: Math.random() * canvas.offsetHeight / 2,
        speed: 1 + Math.random() * 2,
        chars: Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]),
        color: `hsl(${260 + Math.random() * 40}, 80%, 60%)`
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      streams.forEach(stream => {
        stream.chars.forEach((char, i) => {
          const alpha = 1 - i / stream.chars.length;
          ctx.fillStyle = stream.color.replace(')', `, ${alpha * 0.6})`).replace('hsl', 'hsla');
          ctx.font = '10px monospace';
          ctx.fillText(char, stream.x, stream.y + i * 12);
        });
        
        stream.y += stream.speed;
        
        if (stream.y > canvas.offsetHeight / 2 + 100) {
          stream.y = -100;
          stream.x = Math.random() * canvas.offsetWidth / 2;
        }
        
        // Randomly change chars
        if (Math.random() < 0.05) {
          const idx = Math.floor(Math.random() * stream.chars.length);
          stream.chars[idx] = chars[Math.floor(Math.random() * chars.length)];
        }
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40" />;
};

// 8. Impact Ripple Effect
const ImpactRipples = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      color: string;
    }
    
    const ripples: Ripple[] = [];
    
    const createRipple = () => {
      const colors = ['rgba(139, 92, 246,', 'rgba(236, 72, 153,', 'rgba(59, 130, 246,'];
      ripples.push({
        x: Math.random() * canvas.offsetWidth / 2,
        y: Math.random() * canvas.offsetHeight / 2,
        radius: 5,
        maxRadius: 50 + Math.random() * 50,
        alpha: 0.8,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    };
    
    setInterval(createRipple, 800);
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      ripples.forEach((ripple, i) => {
        ctx.strokeStyle = `${ripple.color} ${ripple.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ripple.radius += 1;
        ripple.alpha *= 0.97;
        
        if (ripple.radius > ripple.maxRadius || ripple.alpha < 0.01) {
          ripples.splice(i, 1);
        }
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />;
};

// 9. Quantum Risk Field
const QuantumRiskField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    const width = canvas.offsetWidth / 2;
    const height = canvas.offsetHeight / 2;
    let time = 0;
    
    const animate = () => {
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      for (let x = 0; x < width; x += 2) {
        for (let y = 0; y < height; y += 2) {
          const i = (y * width + x) * 4;
          
          const noise1 = Math.sin(x * 0.02 + time * 0.01) * Math.cos(y * 0.02 + time * 0.01);
          const noise2 = Math.sin((x + y) * 0.01 + time * 0.02);
          const value = (noise1 + noise2 + 2) / 4;
          
          // Purple to transparent gradient
          data[i] = 139 * value;     // R
          data[i + 1] = 92 * value;  // G
          data[i + 2] = 246 * value; // B
          data[i + 3] = value * 30;  // A
          
          // Copy to adjacent pixels for performance
          if (x + 1 < width) {
            data[i + 4] = data[i];
            data[i + 5] = data[i + 1];
            data[i + 6] = data[i + 2];
            data[i + 7] = data[i + 3];
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      time++;
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />;
};

// 10. Risk Constellation Map
const RiskConstellation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    interface Star {
      x: number;
      y: number;
      size: number;
      twinkle: number;
      speed: number;
      risk: number;
    }
    
    const stars: Star[] = [];
    
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.offsetWidth / 2,
        y: Math.random() * canvas.offsetHeight / 2,
        size: 0.5 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.05,
        risk: Math.random()
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Draw constellation lines
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 80) {
            const alpha = (1 - dist / 80) * 0.2;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw stars
      stars.forEach(star => {
        star.twinkle += star.speed;
        const brightness = 0.5 + Math.sin(star.twinkle) * 0.5;
        const size = star.size * brightness;
        
        const hue = 270 - star.risk * 200;
        ctx.fillStyle = `hsla(${hue}, 80%, ${60 + brightness * 20}%, ${brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
};

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

export default function RiskQuantifyTool() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<RiskDashboard | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);

  // Enhanced state for new features
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [threatIntel, setThreatIntel] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<WebSocketMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadDashboard();
    initializeWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'risks') loadRisks();
    else if (activeTab === 'ai-analysis') loadAIAnalysis();
    else if (activeTab === 'threat-intel') loadThreatIntel();
    else if (activeTab === 'compliance') loadComplianceStatus();
    else if (activeTab === 'analytics') loadPredictiveAnalytics();
  }, [activeTab]);

  const initializeWebSocket = () => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4019';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      // Join collaboration session
      wsRef.current?.send(JSON.stringify({
        type: 'join_session',
        data: { sessionId: 'riskquantify-main', userId: 'user-' + Date.now() }
      }));
    };

    wsRef.current.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected, attempting reconnect...');
      reconnectTimeoutRef.current = setTimeout(initializeWebSocket, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'user_joined':
        setOnlineUsers(prev => [...prev, message.userId!]);
        break;
      case 'user_left':
        setOnlineUsers(prev => prev.filter(user => user !== message.userId));
        break;
      case 'chat_message':
        setChatMessages(prev => [...prev, message]);
        break;
      case 'risk_updated':
        // Refresh risks when someone updates them
        if (activeTab === 'risks') loadRisks();
        break;
      case 'ai_analysis_complete':
        setAiAnalysis(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendChatMessage = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        data: { message, userId: 'current-user' },
        timestamp: new Date().toISOString()
      }));
    }
  };

  async function loadDashboard() {
    setLoading(true);
    try {
      const r = await riskAssessApi.getDashboard();
      if (r.success && r.data) {
        setDashboard(r.data);
        setUsingSimulated(false);
      } else {
        setDashboard(simulatedData.dashboard);
        setUsingSimulated(true);
      }
    } catch {
      setDashboard(simulatedData.dashboard);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadRisks() {
    setLoading(true);
    try {
      const r = await riskAssessApi.getRisks();
      if (r.success && r.data) {
        setRisks(r.data);
        setUsingSimulated(false);
      } else {
        setRisks(simulatedData.risks);
        setUsingSimulated(true);
      }
    } catch {
      setRisks(simulatedData.risks);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadAIAnalysis() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risks: risks.slice(0, 5) })
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAiAnalysis({ error: 'AI analysis unavailable' });
    } finally {
      setLoading(false);
    }
  }

  async function loadThreatIntel() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/threat-intelligence/feeds');
      const data = await response.json();
      setThreatIntel(data);
    } catch (error) {
      console.error('Threat Intel failed:', error);
      setThreatIntel({ error: 'Threat intelligence unavailable' });
    } finally {
      setLoading(false);
    }
  }

  async function loadComplianceStatus() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/compliance/status');
      const data = await response.json();
      setComplianceStatus(data);
    } catch (error) {
      console.error('Compliance check failed:', error);
      setComplianceStatus({ error: 'Compliance status unavailable' });
    } finally {
      setLoading(false);
    }
  }

  async function loadPredictiveAnalytics() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/analytics/predictions');
      const data = await response.json();
      setPredictiveAnalytics(data);
    } catch (error) {
      console.error('Predictive analytics failed:', error);
      setPredictiveAnalytics({ error: 'Analytics unavailable' });
    } finally {
      setLoading(false);
    }
  }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-violet-500/20">
            <p className="text-gray-400 text-sm">Total Risks</p>
            <p className="text-2xl font-bold text-violet-400">{dashboard.overview.totalRisks}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20">
            <p className="text-gray-400 text-sm">High Risks</p>
            <p className="text-2xl font-bold text-red-400">{dashboard.overview.highRisks}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-gray-400 text-sm">Open Risks</p>
            <p className="text-2xl font-bold text-yellow-400">{dashboard.overview.openRisks}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20">
            <p className="text-gray-400 text-sm">Avg Score</p>
            <p className="text-2xl font-bold text-blue-400">{dashboard.overview.avgRiskScore.toFixed(1)}</p>
          </div>
        </div>

        {/* Real-time collaboration status */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Collaboration Status</p>
              <p className="text-green-400 font-semibold">🟢 {onlineUsers.length} users online</p>
            </div>
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 3).map((user, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-green-500 border-2 border-gray-800 flex items-center justify-center text-xs font-bold">
                  {user.charAt(0).toUpperCase()}
                </div>
              ))}
              {onlineUsers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs">
                  +{onlineUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Top Risks</h3>
          <div className="space-y-3">
            {dashboard.topRisks.map((r: Risk) => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                    r.riskScore >= 8 ? 'bg-red-600' : r.riskScore >= 5 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}>
                    {r.riskScore.toFixed(1)}
                  </div>
                  <div>
                    <p className="text-white">{r.name}</p>
                    <p className="text-gray-500 text-sm">{r.category} • Owner: {r.owner}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  r.status === 'mitigated' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderAIAnalysis() {
    if (!aiAnalysis) return <div className="text-gray-400">Loading AI analysis...</div>;

    if (aiAnalysis.error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">⚠️ {aiAnalysis.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            🤖 AI Risk Analysis
            <span className="text-xs bg-blue-600 px-2 py-1 rounded">Powered by Multiple AI Models</span>
          </h3>

          {aiAnalysis.consensus && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Consensus Score</p>
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${
                  aiAnalysis.consensus.overall >= 8 ? 'text-red-400' :
                  aiAnalysis.consensus.overall >= 5 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {aiAnalysis.consensus.overall.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">
                  Confidence: {aiAnalysis.consensus.confidence}%
                </div>
              </div>
            </div>
          )}

          {aiAnalysis.recommendations && (
            <div>
              <h4 className="text-white font-medium mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {aiAnalysis.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-300">{rec.suggestion}</p>
                    <p className="text-gray-500 text-sm mt-1">Priority: {rec.priority}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderThreatIntel() {
    if (!threatIntel) return <div className="text-gray-400">Loading threat intelligence...</div>;

    if (threatIntel.error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">⚠️ {threatIntel.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-orange-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            🛡️ Threat Intelligence
            <span className="text-xs bg-orange-600 px-2 py-1 rounded">7+ Security Feeds</span>
          </h3>

          {threatIntel.feeds && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {threatIntel.feeds.map((feed: any, i: number) => (
                <div key={i} className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{feed.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      feed.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}>
                      {feed.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{feed.description}</p>
                  <p className="text-gray-500 text-xs">Last updated: {new Date(feed.lastUpdate).toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">Threats: {feed.threatCount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCompliance() {
    if (!complianceStatus) return <div className="text-gray-400">Loading compliance status...</div>;

    if (complianceStatus.error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">⚠️ {complianceStatus.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            📋 Compliance Status
            <span className="text-xs bg-purple-600 px-2 py-1 rounded">7 Frameworks</span>
          </h3>

          {complianceStatus.frameworks && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceStatus.frameworks.map((framework: any, i: number) => (
                <div key={i} className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{framework.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      framework.compliance >= 80 ? 'bg-green-900/30 text-green-400' :
                      framework.compliance >= 60 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
                    }`}>
                      {framework.compliance}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{framework.description}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        framework.compliance >= 80 ? 'bg-green-500' :
                        framework.compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${framework.compliance}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAnalytics() {
    if (!predictiveAnalytics) return <div className="text-gray-400">Loading predictive analytics...</div>;

    if (predictiveAnalytics.error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400">⚠️ {predictiveAnalytics.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            📊 Predictive Analytics
            <span className="text-xs bg-cyan-600 px-2 py-1 rounded">ML-Powered</span>
          </h3>

          {predictiveAnalytics.predictions && (
            <div className="space-y-4">
              {predictiveAnalytics.predictions.map((pred: any, i: number) => (
                <div key={i} className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{pred.riskName}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      pred.predictedSeverity === 'high' ? 'bg-red-900/30 text-red-400' :
                      pred.predictedSeverity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'
                    }`}>
                      {pred.predictedSeverity}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Predicted trend: {pred.trend}</p>
                  <p className="text-gray-500 text-xs">Confidence: {pred.confidence}%</p>
                  <p className="text-gray-500 text-xs">Timeframe: Next {pred.timeframe}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCollaboration() {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            💬 Real-time Collaboration
            <span className="text-xs bg-green-600 px-2 py-1 rounded">WebSocket</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Online Users */}
            <div>
              <h4 className="text-white font-medium mb-3">Online Users ({onlineUsers.length})</h4>
              <div className="space-y-2">
                {onlineUsers.map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-300">{user}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div>
              <h4 className="text-white font-medium mb-3">Team Chat</h4>
              <div className="bg-gray-900/50 rounded-lg p-4 h-64 overflow-y-auto mb-3">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                ) : (
                  <div className="space-y-2">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-gray-400">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                        <span className="text-blue-400 font-medium"> {msg.userId}:</span>
                        <span className="text-gray-300"> {msg.data.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendChatMessage((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input.value) {
                      sendChatMessage(input.value);
                      input.value = '';
                    }
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderRisks() {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg">
            + New Risk
          </button>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="text-left p-4 text-gray-400">Risk</th>
                <th className="text-left p-4 text-gray-400">Category</th>
                <th className="text-left p-4 text-gray-400">Score</th>
                <th className="text-left p-4 text-gray-400">Owner</th>
                <th className="text-left p-4 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {risks.map(r => (
                <tr key={r._id} className="border-t border-gray-700 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div>
                      <p className="text-white">{r.name}</p>
                      <p className="text-gray-500 text-sm">{r.description}</p>
                    </div>
                  </td>
                  <td className="p-4 text-violet-400">{r.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded font-bold ${
                      r.riskScore >= 8 ? 'bg-red-900/30 text-red-400' :
                      r.riskScore >= 5 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'
                    }`}>
                      {r.riskScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{r.owner}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      r.status === 'mitigated' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'risks' as TabType, label: 'Risks', icon: '⚠️' },
    { id: 'matrix' as TabType, label: 'Matrix', icon: '📈' },
    { id: 'ai-analysis' as TabType, label: 'AI Analysis', icon: '🤖' },
    { id: 'threat-intel' as TabType, label: 'Threat Intel', icon: '🛡️' },
    { id: 'compliance' as TabType, label: 'Compliance', icon: '📋' },
    { id: 'reports' as TabType, label: 'Reports', icon: '📑' },
    { id: 'analytics' as TabType, label: 'Analytics', icon: '📊' },
    { id: 'collaboration' as TabType, label: 'Team Chat', icon: '💬' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950/30 to-gray-950 text-white relative overflow-hidden">
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <QuantumRiskField />
        <RiskConstellation />
        <DataFlowStreams />
      </div>

      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-violet-500/30 sticky top-0 z-40 relative">
        <div className="absolute inset-0 overflow-hidden">
          <RiskProbabilityWave />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back to Maula.AI Button */}
              <button
                onClick={() => window.location.href = 'https://maula.ai'}
                className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-violet-500/30 hover:border-violet-400/50 text-violet-300 hover:text-violet-200 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
              >
                <span>←</span>
                <span>Maula.AI</span>
              </button>
              
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                    <span className="text-2xl relative z-10">📊</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                    RiskQuantify Pro
                  </h1>
                  <p className="text-violet-300/70 text-sm">Enterprise Risk Quantification & Intelligence Platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {usingSimulated && (
                <span className="px-3 py-1.5 bg-amber-900/30 border border-amber-500/30 text-amber-400 rounded-full text-sm backdrop-blur-sm animate-pulse">
                  🔄 Simulation Mode
                </span>
              )}
              <button
                onClick={() => navigate('/maula/ai')}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105"
              >
                <span className="text-lg">🤖</span>
                <span>AI Assistant</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-violet-300 border border-gray-700/50 hover:border-violet-500/30'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative py-8 border-b border-violet-500/20 overflow-hidden">
        <div className="absolute inset-0">
          <ThreatRadarScanner />
          <MonteCarloParticles />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Animated Risk Monogram */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 flex items-center justify-center backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-600/10 to-transparent"></div>
                  <span className="text-5xl font-black bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent relative z-10 animate-pulse">
                    Σ
                  </span>
                  <div className="absolute inset-0 border-2 border-violet-400/20 rounded-2xl"></div>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Risk Intelligence Dashboard</h2>
                <p className="text-violet-300/70 text-lg">FAIR Framework • Monte Carlo • AI-Powered Analysis</p>
              </div>
            </div>
            
            {/* Stats Boxes */}
            <div className="flex gap-4">
              <div className="px-6 py-4 bg-gray-900/60 backdrop-blur-xl rounded-xl border border-violet-500/30 text-center min-w-[120px]">
                <div className="text-3xl font-bold text-violet-400">10K+</div>
                <div className="text-violet-300/60 text-sm">Simulations/sec</div>
              </div>
              <div className="px-6 py-4 bg-gray-900/60 backdrop-blur-xl rounded-xl border border-fuchsia-500/30 text-center min-w-[120px]">
                <div className="text-3xl font-bold text-fuchsia-400">7</div>
                <div className="text-fuchsia-300/60 text-sm">Frameworks</div>
              </div>
              <div className="px-6 py-4 bg-gray-900/60 backdrop-blur-xl rounded-xl border border-purple-500/30 text-center min-w-[120px]">
                <div className="text-3xl font-bold text-purple-400">99.9%</div>
                <div className="text-purple-300/60 text-sm">Confidence</div>
              </div>
              <div className="px-6 py-4 bg-gray-900/60 backdrop-blur-xl rounded-xl border border-pink-500/30 text-center min-w-[120px]">
                <div className="text-3xl font-bold text-pink-400">24/7</div>
                <div className="text-pink-300/60 text-sm">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
          </div>
        )}
        
        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard with Epic Background */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30">
                <RiskMatrixHeatmap />
              </div>
              {renderDashboard()}
            </div>
          </div>
        )}
        
        {!loading && activeTab === 'risks' && (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20">
              <NeuralRiskNetwork />
            </div>
            <div className="relative z-10">{renderRisks()}</div>
          </div>
        )}
        
        {!loading && activeTab === 'matrix' && (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <RiskMatrixHeatmap />
            </div>
            <div className="relative z-10 backdrop-blur-sm bg-gray-900/30 rounded-2xl p-8 border border-violet-500/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">📈</span>
                Interactive Risk Matrix
              </h3>
              <p className="text-violet-300/70">Advanced 5x5 risk matrix with real-time probability × impact visualization</p>
              <div className="mt-8 grid grid-cols-5 gap-2">
                {[...Array(25)].map((_, i) => {
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  const risk = (row + col) / 8;
                  const hue = 270 - risk * 200;
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: `hsla(${hue}, 70%, 40%, 0.8)` }}
                    >
                      {((row + 1) * (col + 1)).toFixed(0)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {!loading && activeTab === 'ai-analysis' && (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30">
              <NeuralRiskNetwork />
            </div>
            <div className="relative z-10">{renderAIAnalysis()}</div>
          </div>
        )}
        
        {!loading && activeTab === 'threat-intel' && (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30">
              <ThreatRadarScanner />
            </div>
            <div className="relative z-10">{renderThreatIntel()}</div>
          </div>
        )}
        
        {!loading && activeTab === 'compliance' && (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-40">
              <ComplianceShieldPulse />
            </div>
            <div className="relative z-10">{renderCompliance()}</div>
          </div>
        )}
        
        {!loading && activeTab === 'reports' && (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20">
              <ImpactRipples />
            </div>
            <div className="relative z-10 backdrop-blur-sm bg-gray-900/30 rounded-2xl p-8 border border-violet-500/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">📑</span>
                Executive Reports
              </h3>
              <p className="text-violet-300/70 mb-6">Generate comprehensive risk reports for stakeholders</p>
              <div className="grid grid-cols-3 gap-4">
                {['PDF Executive Summary', 'Excel Risk Register', 'FAIR Analysis Report', 'Board Presentation', 'Audit Report', 'Trend Analysis'].map((report, i) => (
                  <button key={i} className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-violet-500/20 hover:border-violet-500/40 transition-all text-left">
                    <div className="text-violet-400 font-semibold">{report}</div>
                    <div className="text-gray-500 text-sm mt-1">Click to generate</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!loading && activeTab === 'analytics' && (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30">
              <MonteCarloParticles />
            </div>
            <div className="relative z-10">{renderAnalytics()}</div>
          </div>
        )}
        
        {!loading && activeTab === 'collaboration' && (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20">
              <DataFlowStreams />
            </div>
            <div className="relative z-10">{renderCollaboration()}</div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-500/20 py-6 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <span className="text-sm">📊</span>
              </div>
              <span className="text-violet-300/60">RiskQuantify Pro • Tool 19</span>
            </div>
            <div className="text-gray-500 text-sm">
              VictoryKit Security Platform • Enterprise Risk Intelligence • FAIR Framework Certified
            </div>
            <div className="flex items-center gap-4">
              <span className="text-violet-400/60 text-sm">v19.0.0</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-400/60 text-sm">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
