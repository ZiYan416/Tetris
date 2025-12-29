import React from 'react';
import { RotateCw, ArrowDown, Play, Pause } from 'lucide-react';

interface ControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDropStart: () => void;
  onSoftDropEnd: () => void;
  onPause: () => void;
  isPlaying: boolean;
  isPaused: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDropStart,
  onSoftDropEnd,
  onPause,
  isPlaying,
  isPaused
}) => {
  if (!isPlaying) return null;

  // Physical button styles with 3D depth (border-b-4)
  const dpadBase = "active:translate-y-1 active:border-b-0 transition-all bg-slate-700 border-b-4 border-slate-900 rounded-sm";
  const actionBtnBase = "active:translate-y-1 active:border-b-0 transition-all w-16 h-16 rounded-full border-b-4 flex items-center justify-center shadow-lg active:shadow-none";

  return (
    <div className="w-full px-6 pb-8 pt-4 flex flex-col gap-6">
      
      {/* Top Row: D-Pad and Action Buttons */}
      <div className="flex justify-between items-end">
        
        {/* D-Pad (Cross Shape) */}
        <div className="relative w-32 h-32">
            {/* Center filler */}
            <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-slate-700 z-10"></div>
            
            {/* Up (Empty/Decorative) */}
            <div className="absolute top-0 left-1/3 w-1/3 h-1/3 bg-slate-700 rounded-t border-t border-l border-r border-slate-600"></div>

            {/* Left */}
            <button 
                className={`${dpadBase} absolute top-1/3 left-0 w-1/3 h-1/3 rounded-l`}
                onTouchStart={(e) => { e.preventDefault(); onMoveLeft(); }}
                onMouseDown={(e) => { e.preventDefault(); onMoveLeft(); }}
                aria-label="Left"
            />
            
            {/* Right */}
            <button 
                className={`${dpadBase} absolute top-1/3 right-0 w-1/3 h-1/3 rounded-r`}
                onTouchStart={(e) => { e.preventDefault(); onMoveRight(); }}
                onMouseDown={(e) => { e.preventDefault(); onMoveRight(); }}
                aria-label="Right"
            />
            
            {/* Down */}
            <button 
                className={`${dpadBase} absolute bottom-0 left-1/3 w-1/3 h-1/3 rounded-b`}
                onTouchStart={(e) => { e.preventDefault(); onSoftDropStart(); }}
                onTouchEnd={(e) => { e.preventDefault(); onSoftDropEnd(); }}
                onMouseDown={(e) => { e.preventDefault(); onSoftDropStart(); }}
                onMouseUp={(e) => { e.preventDefault(); onSoftDropEnd(); }}
                onMouseLeave={(e) => { e.preventDefault(); onSoftDropEnd(); }}
                aria-label="Drop"
            >
                <ArrowDown size={20} className="mx-auto text-slate-400" />
            </button>
        </div>

        {/* Action Buttons (A / B) */}
        <div className="flex gap-4 items-end transform -rotate-12 mb-2">
            <div className="flex flex-col items-center gap-1">
                 <button 
                    className={`${actionBtnBase} bg-rose-400 border-rose-600 text-white`}
                    onTouchStart={(e) => { e.preventDefault(); onRotate(); }}
                    onMouseDown={(e) => { e.preventDefault(); onRotate(); }}
                >
                    <RotateCw size={28} strokeWidth={2.5} />
                </button>
                <span className="text-slate-400 font-bold text-xs tracking-wider">ROTATE</span>
            </div>
        </div>
      </div>

      {/* Start / Select Pills */}
      <div className="flex justify-center gap-8 mt-2">
         <button 
            onClick={onPause}
            className="flex flex-col items-center gap-1 group"
         >
            <div className="w-12 h-3 bg-slate-700 rounded-full border-b-2 border-slate-900 group-active:translate-y-[1px] group-active:border-b-0 transition-all"></div>
            <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                {isPaused ? <Play size={10} className="inline"/> : <Pause size={10} className="inline"/>} Start
            </span>
         </button>
      </div>
    </div>
  );
};

export default Controls;