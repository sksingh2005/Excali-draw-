import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pencil, 
  Ruler, 
  Palette, 
  Brush, 
  Eraser, 
  Triangle,
  Circle,
  Square,
  Zap,
  Sparkles,
  PaintBucket,
  Edit3,
  Star,
  ArrowRight,
  Github,
  Sun,
  Home,
  Heart,
  Smile,
  Camera,
  Music,
  Flower,
  Coffee,
  Book,
  Lightbulb,
  Compass,
  Feather
} from 'lucide-react';

const HandDrawnElement = ({ 
  children, 
  className = "",
  style = {}
}: { 
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div 
    className={`absolute ${className}`}
    style={{
      ...style,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      zIndex: 1,
    }}
  >
    {children}
  </div>
);

const DoodleIcon = ({ 
  Icon, 
  className, 
  delay = 0,
  rotation = 0,
  color = "#6366f1"
}: { 
  Icon: React.ComponentType<any>; 
  className: string;
  delay?: number;
  rotation?: number;
  color?: string;
}) => (
  <div 
    className={`absolute opacity-40 hover:opacity-70 transition-all duration-500 ${className}`}
    style={{ 
      animation: `float 8s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      transform: `rotate(${rotation}deg)`,
      color: color,
      zIndex: 1,
    }}
  >
    <Icon size={24} strokeWidth={1.2} />
  </div>
);

const HandDrawnBox = ({ 
  children, 
  className = "",
  color = "#6366f1"
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) => (
  <div className={`relative ${className}`} style={{ zIndex: 1 }}>
    <svg 
      className="absolute inset-0 w-full h-full" 
      viewBox="0 0 200 60" 
      fill="none"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
    >
      <path
        d="M5 10 Q10 5 20 8 L180 12 Q190 15 185 25 L182 45 Q178 55 165 52 L15 48 Q5 45 8 35 Z"
        stroke={color}
        strokeWidth="2"
        fill="rgba(255,255,255,0.9)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <div className="relative z-10 px-6 py-3">
      {children}
    </div>
  </div>
);

const AnimatedBrushStroke = ({ 
  className, 
  delay = 0,
  color = "#6366f1"
}: { 
  className: string;
  delay?: number;
  color?: string;
}) => (
  <div 
    className={`absolute ${className}`}
    style={{ 
      animation: `brushStroke 6s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      zIndex: 1,
      opacity: 0.6
    }}
  >
    <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
      <path
        d="M10 20 Q25 15 40 25 Q55 35 70 20"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="brush-path"
      />
      <circle cx="75" cy="18" r="2" fill={color} className="brush-tip" />
    </svg>
  </div>
);

const AnimatedPencilSketch = ({ 
  className, 
  delay = 0,
  sketchType = "zigzag"
}: { 
  className: string;
  delay?: number;
  sketchType?: "zigzag" | "spiral" | "scribble" | "star";
}) => {
  const sketches = {
    zigzag: "M10 20 L20 10 L30 20 L40 10 L50 20 L60 10",
    spiral: "M30 30 Q20 20 30 10 Q40 20 30 30 Q20 40 30 30",
    scribble: "M10 15 Q15 10 20 15 Q25 20 30 15 Q35 10 40 15 Q45 20 50 15",
    star: "M25 5 L30 15 L40 15 L32 22 L35 32 L25 25 L15 32 L18 22 L10 15 L20 15 Z"
  };

  return (
    <div 
      className={`absolute ${className}`}
      style={{ 
        animation: `pencilDraw 8s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        zIndex: 1,
        opacity: 0.5
      }}
    >
      <svg width="60" height="50" viewBox="0 0 60 50" fill="none">
        <path
          d={sketches[sketchType]}
          stroke="#374151"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pencil-path"
        />
        <circle cx="55" cy="8" r="1.5" fill="#374151" className="pencil-tip" />
      </svg>
    </div>
  );
};

const PaintSplash = ({ 
  className, 
  delay = 0,
  color = "#f59e0b"
}: { 
  className: string;
  delay?: number;
  color?: string;
}) => (
  <div 
    className={`absolute ${className}`}
    style={{ 
      animation: `paintSplash 10s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      zIndex: 1,
      opacity: 0.4
    }}
  >
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="6" fill={color} opacity="0.6" className="paint-drop" />
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.4" />
      <circle cx="18" cy="14" r="1.5" fill={color} opacity="0.5" />
      <circle cx="16" cy="18" r="2" fill={color} opacity="0.3" />
    </svg>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Decorative Layer */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {/* --- Top Center Cluster --- */}
        <DoodleIcon Icon={Pencil}    className="top-20 left-1/3"        delay={0}   rotation={-10} color="#ef4444" />
        <DoodleIcon Icon={Brush}     className="top-24 left-1/2 transform -translate-x-1/2" delay={0.5} rotation={15}  color="#8b5cf6" />
        <DoodleIcon Icon={Palette}   className="top-20 right-1/3"       delay={1}   rotation={-5}  color="#f59e0b" />
        <DoodleIcon Icon={Ruler}     className="top-32 left-[40%]"      delay={1.5} rotation={30}  color="#10b981" />
        <DoodleIcon Icon={Eraser}    className="top-32 right-[40%]"     delay={2}   rotation={-20} color="#ec4899" />

        {/* --- Mid Left/Right, closer to center --- */}
        <DoodleIcon Icon={Triangle}   className="top-1/3 left-1/4"      delay={0.3} rotation={20}  color="#06b6d4" />
        <DoodleIcon Icon={Square}     className="top-1/2 left-1/5"      delay={0.8} rotation={35}  color="#f97316" />
        <DoodleIcon Icon={Circle}     className="top-2/3 left-1/4"      delay={1.3} rotation={0}   color="#84cc16" />
        <DoodleIcon Icon={Compass}    className="top-3/4 left-1/3"      delay={1.8} rotation={25}  color="#0891b2" />

        <DoodleIcon Icon={Sparkles}   className="top-1/3 right-1/4"     delay={0.6} rotation={10}  color="#d946ef" />
        <DoodleIcon Icon={Zap}        className="top-1/2 right-1/5"     delay={1.1} rotation={-15} color="#eab308" />
        <DoodleIcon Icon={Lightbulb}  className="top-2/3 right-1/4"     delay={1.6} rotation={-10} color="#eab308" />
        <DoodleIcon Icon={Feather}    className="top-3/4 right-1/3"     delay={2.1} rotation={-10} color="#be185d" />

        {/* --- Center Band --- */}
        <DoodleIcon Icon={Sun}        className="top-1/4 left-1/2 transform -translate-x-1/2" delay={0.4} rotation={20}  color="#fbbf24" />
        <DoodleIcon Icon={Heart}      className="top-1/2 left-1/2 transform -translate-x-1/2" delay={0.9} rotation={15}  color="#f87171" />
        <DoodleIcon Icon={Smile}      className="top-[60%] left-[48%]"  delay={1.4} rotation={-10} color="#fde047" />
        <DoodleIcon Icon={Music}      className="top-[70%] right-[48%]" delay={1.9} rotation={-15} color="#34d399" />

        {/* --- Bottom Center Cluster --- */}
        <DoodleIcon Icon={Camera}      className="bottom-32 left-1/3"   delay={2.4} rotation={10}  color="#a78bfa" />
        <DoodleIcon Icon={Book}        className="bottom-24 left-1/2 transform -translate-x-1/2"  delay={2.9} rotation={-5} color="#7c3aed" />
        <DoodleIcon Icon={Coffee}      className="bottom-32 right-1/3"  delay={3.4} rotation={10} color="#a16207" />
        <DoodleIcon Icon={Home}        className="bottom-24 right-1/2 transform translate-x-1/2" delay={3.9} rotation={-10} color="#3b82f6" />
        <DoodleIcon Icon={Flower}      className="bottom-36 right-[45%]"  delay={4.4} rotation={15}  color="#fb7185" />

        {/* --- Mid-level tools, closer to center --- */}
        <DoodleIcon Icon={PaintBucket} className="bottom-1/2 left-1/4"   delay={2.6} rotation={20}  color="#059669" />
        <DoodleIcon Icon={Edit3}       className="bottom-1/2 right-1/4"  delay={3.1} rotation={-15} color="#dc2626" />

        {/* --- Animated Brush Strokes (clustered) --- */}
        <AnimatedBrushStroke     className="top-1/3 left-[38%]"       delay={0}   color="#ef4444" />
        <AnimatedBrushStroke     className="top-1/2 right-[38%]"      delay={1.5} color="#10b981" />
        <AnimatedBrushStroke     className="bottom-1/3 left-[38%]"    delay={3}   color="#8b5cf6" />
        <AnimatedBrushStroke     className="bottom-1/2 right-[38%]"   delay={4.5} color="#f59e0b" />

        {/* --- Animated Pencil Sketches (clustered) --- */}
        <AnimatedPencilSketch    className="top-1/3 left-[45%]"        delay={1}   sketchType="zigzag" />
        <AnimatedPencilSketch    className="top-1/3 right-[45%]"       delay={2.5} sketchType="spiral" />
        <AnimatedPencilSketch    className="bottom-1/3 left-[45%]"     delay={4}   sketchType="scribble" />
        <AnimatedPencilSketch    className="bottom-1/3 right-[45%]"    delay={0.5} sketchType="star" />

        {/* --- Paint Splashes (clustered) --- */}
        <PaintSplash        className="top-1/2 left-[42%]"             delay={0.7} color="#ec4899" />
        <PaintSplash        className="top-1/2 right-[42%]"            delay={2.2} color="#06b6d4" />
        <PaintSplash        className="bottom-1/2 left-[42%]"          delay={3.7} color="#84cc16" />
        <PaintSplash        className="bottom-1/2 right-[42%]"         delay={1.2} color="#f97316" />

        {/* --- Hand-drawn Elements (clustered) --- */}
        <HandDrawnElement className="top-[60%] left-[44%]" style={{ transform: 'rotate(-10deg)', opacity: 0.6 }}>
          <svg width="100" height="50" viewBox="0 0 100 50" fill="none">
            <path
              d="M10 25 Q25 15 40 20 Q55 25 70 15 Q80 10 90 20"
              stroke="#6366f1"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="4,3"
            />
            <path
              d="M85 15 L90 20 L85 25"
              stroke="#6366f1"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </HandDrawnElement>
        <HandDrawnElement className="top-[65%] right-[44%]" style={{ transform: 'rotate(15deg)', opacity: 0.6 }}>
          <svg width="70" height="30" viewBox="0 0 70 30" fill="none">
            <path
              d="M10 15 Q20 8 30 15 Q45 22 60 15"
              stroke="#f59e0b"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="3,3"
            />
          </svg>
        </HandDrawnElement>
        <HandDrawnElement className="bottom-[60%] left-[46%]" style={{ transform: 'rotate(-15deg)', opacity: 0.5 }}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="#10b981"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="2,2"
            />
          </svg>
        </HandDrawnElement>
        <HandDrawnElement className="bottom-[65%] right-[46%]" style={{ transform: 'rotate(20deg)', opacity: 0.6 }}>
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
            <path
              d="M15 15 Q30 8 45 22 Q60 36 65 50"
              stroke="#10b981"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="2,2"
            />
          </svg>
        </HandDrawnElement>

        {/* ---------- Speech Bubbles – Enhanced Positioning ---------- */}
        <HandDrawnElement className="top-[55%] left-[28%]" style={{ opacity: 0.9 }}>
          <div className="bg-pink-50 px-3 py-2 rounded-xl border-2 border-pink-200 border-dashed shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium text-pink-600">brainstorm!</span>
          </div>
        </HandDrawnElement>

        <HandDrawnElement className="top-[55%] right-[28%]" style={{ opacity: 0.9 }}>
          <div className="bg-blue-50 px-3 py-2 rounded-xl border-2 border-blue-200 border-dashed shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium text-blue-600">collaborate</span>
          </div>
        </HandDrawnElement>

        <HandDrawnElement className="bottom-[55%] left-[28%]" style={{ opacity: 0.9 }}>
          <div className="bg-green-50 px-3 py-2 rounded-xl border-2 border-green-200 border-dashed shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium text-green-600">ideate</span>
          </div>
        </HandDrawnElement>

        <HandDrawnElement className="bottom-[55%] right-[28%]" style={{ opacity: 0.9 }}>
          <div className="bg-yellow-50 px-3 py-2 rounded-xl border-2 border-yellow-200 border-dashed shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium text-yellow-600">visualize</span>
          </div>
        </HandDrawnElement>

        {/* ---------- Center Speech Bubbles ---------- */}
        <HandDrawnElement className="top-[65%] left-[35%]" style={{ opacity: 0.9 }}>
          <div className="bg-orange-50 px-3 py-1 rounded-xl border-2 border-orange-200 border-dashed shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium text-orange-600">create</span>
          </div>
        </HandDrawnElement>

        <HandDrawnElement className="top-[65%] right-[35%]" style={{ opacity: 0.9 }}>
          <div className="bg-purple-50 px-3 py-1 rounded-xl border-2 border-purple-200 border-dashed shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium text-purple-600">inspire</span>
          </div>
        </HandDrawnElement>

        <HandDrawnElement className="bottom-[65%] left-[38%]" style={{ opacity: 0.9 }}>
          <div className="bg-teal-50 px-3 py-1 rounded-xl border-2 border-teal-200 border-dashed shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium text-teal-600">sketch</span>
          </div>
        </HandDrawnElement>
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6 bg-gray-50/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Pencil size={18} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-800">SCRIBBLY</span>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-gray-600">
            <a href="#" className="hover:text-gray-800 transition-colors">Pricing</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Teams</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Roadmap</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Resources</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Github size={16} />
              <span>103.9k</span>
            </div>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              Sign in
            </button>
            <button 
              onClick={() => navigate('/draw')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Free whiteboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-4 mt-20">
        {/* Main Heading */}
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-4 leading-tight">
            Online whiteboard
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              made simple
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed mb-8">
            Ideate, Collaborate, Share. Simply with Scribbly.
          </p>
        </div>

        {/* CTA Button */}
        <div className="group relative mb-16">
          <button
            onClick={() => navigate('/draw')}
            className="relative px-12 py-4 bg-white text-gray-800 text-xl font-semibold rounded-2xl border-3 border-gray-800 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl z-10"
            style={{
              borderStyle: 'dashed',
              borderWidth: '3px'
            }}
          >
            <div className="flex items-center gap-3">
              <Brush className="group-hover:animate-pulse" size={24} />
              Start Drawing
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </div>
          </button>
        </div>

        {/* Hand-drawn pointer to button */}
        <HandDrawnElement className="-mt-8 ml-32" style={{ zIndex: 5 }}>
          <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
            <path
              d="M10 35 Q20 25 30 30 Q40 35 50 25 Q60 15 70 20"
              stroke="#6366f1"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M65 15 L70 20 L65 25"
              stroke="#6366f1"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </HandDrawnElement>
      </div>

      {/* Bottom illustration area */}
      <div className="relative z-10 flex justify-center pb-16">
        <div className="relative">
          {/* Hand-drawn whiteboard frame */}
          <svg width="400" height="200" viewBox="0 0 400 200" fill="none" className="drop-shadow-lg">
            <rect
              x="20"
              y="20"
              width="360"
              height="160"
              rx="8"
              fill="white"
              stroke="#d1d5db"
              strokeWidth="3"
              strokeDasharray="8,4"
            />
          </svg>
          
          {/* Content inside the frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-dashed border-purple-300">
                <Pencil size={32} className="text-purple-600" />
              </div>
              <p className="text-gray-500 text-sm">
                To move canvas, hold mouse wheel or spacebar+drag
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
          25% { transform: translateY(-6px) rotate(calc(var(--rotation, 0deg) + 1deg)); }
          50% { transform: translateY(-12px) rotate(var(--rotation, 0deg)); }
          75% { transform: translateY(-6px) rotate(calc(var(--rotation, 0deg) - 1deg)); }
        }
        
        @keyframes brushStroke {
          0%, 100% { opacity: 0; transform: translateX(-8px); }
          20% { opacity: 0.8; transform: translateX(0px); }
          80% { opacity: 0.8; transform: translateX(0px); }
          100% { opacity: 0; transform: translateX(8px); }
        }
        
        @keyframes pencilDraw {
          0%, 100% { opacity: 0; }
          10% { opacity: 0.2; }
          50% { opacity: 0.8; }
          90% { opacity: 0.2; }
        }
        
        @keyframes paintSplash {
          0%, 100% { opacity: 0; transform: scale(0.3); }
          25% { opacity: 0.6; transform: scale(1); }
          75% { opacity: 0.4; transform: scale(0.8); }
        }
        
        .brush-path {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: drawPath 6s ease-in-out infinite;
        }
        
        .pencil-path {
          stroke-dasharray: 35;
          stroke-dashoffset: 35;
          animation: drawPath 8s ease-in-out infinite;
        }
        
        @keyframes drawPath {
          0%, 100% { stroke-dashoffset: 50; }
          50% { stroke-dashoffset: 0; }
        }
        
        .brush-tip {
          animation: brushTip 6s ease-in-out infinite;
        }
        
        .pencil-tip {
          animation: pencilTip 8s ease-in-out infinite;
        }
        
        @keyframes brushTip {
          0%, 100% { opacity: 0; transform: translateX(-8px); }
          50% { opacity: 1; transform: translateX(0px); }
        }
        
        @keyframes pencilTip {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        .paint-drop {
          animation: dropGrow 10s ease-in-out infinite;
        }
        
        @keyframes dropGrow {
          0%, 100% { transform: scale(0); opacity: 0; }
          25% { transform: scale(1); opacity: 0.6; }
          75% { transform: scale(0.8); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
