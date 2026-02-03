import { useEffect, useLayoutEffect } from 'react';
import { useLayoutStore } from '@/lib/stores/useLayoutStore';
import { ReactNode } from 'react';

interface HeaderConfig {
  title?: ReactNode;
  showBack?: boolean;
  rightElement?: ReactNode;
  children?: ReactNode;
  hidden?: boolean;
}

export const useHeader = (config: HeaderConfig = {}) => {
  // Access store directly without subscribing to avoid re-render loops
  // Components using useHeader don't need to re-render when header state changes
  const store = useLayoutStore;

  // Use useLayoutEffect to update header synchronously before paint
  // This runs on every render to keep header children in sync with component state
  useLayoutEffect(() => {
    const { setTitle, setShowBack, setRightElement, setHeaderChildren, setHeaderHidden } = store.getState();
    
    if (config.title !== undefined) setTitle(config.title);
    if (config.showBack !== undefined) setShowBack(config.showBack);
    if (config.rightElement !== undefined) setRightElement(config.rightElement);
    if (config.children !== undefined) setHeaderChildren(config.children);
    if (config.hidden !== undefined) setHeaderHidden(config.hidden);
  });

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      store.getState().resetHeader();
    };
  }, []);
};
