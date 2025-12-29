import React, { useRef } from 'react';
import { RotateCw, ArrowDown, Play, Pause } from 'lucide-react';

interface ControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void; // Single step drop
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
  onMoveDown,
  onRotate,
  onSoftDropStart,
  onSoftDropEnd,
  onPause,
  isPlaying,
  isPaused
}) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  if (!isPlaying) return null;

  const dpadBase = "active:translate-y-1 active:border-b-0 transition-all bg-slate-700 border-b-4 border-slate-900 rounded-sm touch-none";
  const actionBtnBase = "active:translate-y-1 active:border-b-0 transition-all w-14 h-14 rounded-full border-b-4 flex items-center justify-center shadow-lg active:shadow-none touch-none";

  // --- Down Button Logic ---
  const handleDownPress = (e: React.PointerEvent) => {
      e.preventDefault();
      isLongPress.current = false;
      
      // Start a timer. If held for more than 200ms, consider it a long press (fast drop).
      longPressTimer.current = setTimeout(() => {
          isLongPress.current = true;
          onSoftDropStart();
      }, 200);
  };

  const handleDownRelease = (e: React.PointerEvent) => {
      e.preventDefault();
      
      // Clear the timer immediately
      if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
      }

      onSoftDropEnd();

      // If it wasn't a long press, trigger a single step down
      if (!isLongPress.current) {
          onMoveDown();
      }
      
      isLongPress.current = false;
  };

  return (
    <div className="w-full px-4 pb-4 pt-2 flex flex-col gap-4">
      
      {/* Top Row: D-Pad and Action Buttons */}
      <div className="flex justify-between items-end">
        
        {/* D-Pad (Cross Shape) - Compact Size w-28 (7rem) instead of w-32 */}
        <div className="relative w-28 h-28">
            {/* Center filler */}
            <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-slate-700 z-10"></div>
            
            {/* Up (Empty/Decorative) */}
            <div className="absolute top-0 left-1/3 w-1/3 h-1/3 bg-slate-700 rounded-t border-t border-l border-r border-slate-600"></div>

            {/* Left */}
            <button 
                className={`${dpadBase} absolute top-1/3 left-0 w-1/3 h-1/3 rounded-l`}
                onPointerDown={(e) => { e.preventDefault(); onMoveLeft(); }}
                aria-label="Left"
            />
            
            {/* Right */}
            <button 
                className={`${dpadBase} absolute top-1/3 right-0 w-1/3 h-1/3 rounded-r`}
                onPointerDown={(e) => { e.preventDefault(); onMoveRight(); }}
                aria-label="Right"
            />
            
            {/* Down */}
            <button 
                className={`${dpadBase} absolute bottom-0 left-1/3 w-1/3 h-1/3 rounded-b`}
                onPointerDown={handleDownPress}
                onPointerUp={handleDownRelease}
                onPointerLeave={handleDownRelease}
                aria-label="Drop"
            >
                <ArrowDown size={18} className="mx-auto text-slate-400" />
            </button>
        </div>

        {/* Action Buttons (A / B) */}
        <div className="flex gap-3 items-end transform -rotate-12 mb-1">
            <div className="flex flex-col items-center gap-1">
                 <button 
                    className={`${actionBtnBase} bg-rose-400 border-rose-600 text-white`}
                    onPointerDown={(e) => { e.preventDefault(); onRotate(); }}
                >
                    <RotateCw size={24} strokeWidth={2.5} />
                </button>
                <span className="text-slate-400 font-bold text-[10px] tracking-wider">ROTATE</span>
            </div>
        </div>
      </div>

      {/* Start / Select Pills */}
      <div className="flex justify-center gap-6 mt-1">
         <button 
            onClick={onPause}
            className="flex flex-col items-center gap-1 group"
         >
            <div className="w-10 h-2.5 bg-slate-700 rounded-full border-b-2 border-slate-900 group-active:translate-y-[1px] group-active:border-b-0 transition-all"></div>
            <span className="text-slate-400 font-bold text-[9px] tracking-widest uppercase">
                {isPaused ? <Play size={8} className="inline"/> : <Pause size={8} className="inline"/>} Start
            </span>
         </button>
      </div>
    </div>
  );
};

export default Controls;