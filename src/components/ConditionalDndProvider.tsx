import React, { ReactNode, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ConditionalDndProviderProps {
  children: ReactNode;
}

export function ConditionalDndProvider({ children }: ConditionalDndProviderProps) {
  const [needsProvider, setNeedsProvider] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if a DnD context already exists by checking for Figma Make's provider
    // We'll try to detect this by checking if the window has been set up by Figma
    const hasFigmaDndContext = typeof window !== 'undefined' && 
      (window as any).__FIGMA_DND_CONTEXT__;
    
    setNeedsProvider(!hasFigmaDndContext);
  }, []);

  // While checking, render nothing to avoid the error
  if (needsProvider === null) {
    return <>{children}</>;
  }

  // If we need a provider, wrap children
  if (needsProvider) {
    return (
      <DndProvider backend={HTML5Backend}>
        {children}
      </DndProvider>
    );
  }

  // Otherwise, just render children
  return <>{children}</>;
}
