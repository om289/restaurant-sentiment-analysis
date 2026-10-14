import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Toast notification state (managed by react-hot-toast, but we can track preferences)
  toastPosition: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  
  // UI preferences
  animationsEnabled: boolean;
  compactMode: boolean;
  sidebarCollapsed: boolean;
  
  // Actions
  setToastPosition: (position: UIState['toastPosition']) => void;
  toggleAnimations: () => void;
  toggleCompactMode: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      toastPosition: 'top-right',
      animationsEnabled: true,
      compactMode: false,
      sidebarCollapsed: false,

      setToastPosition: (position) => set({ toastPosition: position }),
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'bda-ui-preferences',
    }
  )
);
