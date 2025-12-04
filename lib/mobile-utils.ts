
/**
 * Mobile-specific utility functions for touch optimization
 */

// Haptic feedback simulation (Web Vibration API)
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(patterns[type]);
  }
};

// Check if device is mobile
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Check if device supports touch
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get safe area insets for iOS notch support
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0 };
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
  };
};

// Prevent pull-to-refresh on specific elements
export const preventPullToRefresh = (element: HTMLElement | null) => {
  if (!element) return;
  
  let startY = 0;
  
  element.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: true });
  
  element.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    const isAtTop = element.scrollTop === 0;
    
    if (isAtTop && y > startY) {
      e.preventDefault();
    }
  }, { passive: false });
};

// Smooth scroll with mobile optimization
export const smoothScrollTo = (element: HTMLElement, top: number) => {
  if (isMobile()) {
    // Use native smooth scroll for mobile
    element.scrollTo({
      top,
      behavior: 'smooth',
    });
  } else {
    element.scrollTop = top;
  }
};

// Handle iOS keyboard resize
export const handleIOSKeyboard = (callback: (isOpen: boolean) => void) => {
  if (typeof window === 'undefined') return;
  
  const initialHeight = window.innerHeight;
  
  window.addEventListener('resize', () => {
    const currentHeight = window.innerHeight;
    const keyboardOpen = currentHeight < initialHeight * 0.8;
    callback(keyboardOpen);
  });
};
