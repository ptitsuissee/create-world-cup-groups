import React, { ReactNode, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

interface TouchDndProviderProps {
  children: ReactNode;
}

// Detect if the device supports touch
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

export function TouchDndProvider({ children }: TouchDndProviderProps) {
  // Determine which backend to use based on device capabilities
  const backend = useMemo(() => {
    const isTouch = isTouchDevice();
    
    if (isTouch) {
      // Return a factory function that creates TouchBackend with options
      return (manager: any) => {
        return new TouchBackend(manager, {
          enableMouseEvents: true, // Also support mouse events on touch devices
          delayTouchStart: 200, // Delay before drag starts (ms) - helps distinguish tap from drag
          ignoreContextMenu: true,
          enableHoverOutsideTarget: true,
          touchSlop: 5, // Distance in pixels before drag starts
        });
      };
    } else {
      // Use HTML5Backend for desktop
      return HTML5Backend;
    }
  }, []);

  return (
    <DndProvider backend={backend}>
      {children}
    </DndProvider>
  );
}
