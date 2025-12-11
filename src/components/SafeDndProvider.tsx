import React, { ReactNode } from 'react';
import { DndProvider, useDndContext } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface SafeDndProviderProps {
  children: ReactNode;
}

// Component that checks if DnD context exists
function DndChecker({ children }: { children: ReactNode }) {
  try {
    // This will throw an error if there's no DnD context
    useDndContext();
    // Context exists, just render children
    return <>{children}</>;
  } catch {
    // No context exists, wrap with provider
    return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
  }
}

export function SafeDndProvider({ children }: SafeDndProviderProps) {
  return <DndChecker>{children}</DndChecker>;
}
