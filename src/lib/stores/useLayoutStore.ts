import { create } from 'zustand';
import { ReactNode } from 'react';

interface LayoutState {
  title: ReactNode | null;
  showBack: boolean;
  rightElement: ReactNode | null;
  headerChildren: ReactNode | null;
  // Allows pages to explicitly hide the header (e.g. full screen loading)
  isHeaderHidden: boolean;

  // Actions
  setTitle: (title: ReactNode) => void;
  setRightElement: (element: ReactNode) => void;
  setShowBack: (show: boolean) => void;
  setHeaderChildren: (children: ReactNode) => void;
  setHeaderHidden: (hidden: boolean) => void;
  resetHeader: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  title: null,
  showBack: true,
  rightElement: null,
  headerChildren: null,
  isHeaderHidden: false,

  setTitle: (title) => set({ title }),
  setRightElement: (rightElement) => set({ rightElement }),
  setShowBack: (showBack) => set({ showBack }),
  setHeaderChildren: (headerChildren) => set({ headerChildren }),
  setHeaderHidden: (isHeaderHidden) => set({ isHeaderHidden }),

  resetHeader: () =>
    set({
      title: null,
      showBack: true,
      rightElement: null,
      headerChildren: null,
      isHeaderHidden: false,
    }),
}));
