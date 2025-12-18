
import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  
  const startY = useRef(0);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollable = scrollableRef.current;
    if (!scrollable) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (scrollable.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setCanPull(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0 && scrollable.scrollTop === 0) {
        e.preventDefault();
        const adjustedDistance = Math.min(distance / resistance, threshold * 1.5);
        setPullDistance(adjustedDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!canPull) return;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 300);
        }
      } else {
        setPullDistance(0);
      }
      
      setCanPull(false);
    };

    scrollable.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollable.addEventListener('touchmove', handleTouchMove, { passive: false });
    scrollable.addEventListener('touchend', handleTouchEnd);

    return () => {
      scrollable.removeEventListener('touchstart', handleTouchStart);
      scrollable.removeEventListener('touchmove', handleTouchMove);
      scrollable.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canPull, isRefreshing, pullDistance, threshold, resistance, onRefresh]);

  return {
    scrollableRef,
    pullDistance,
    isRefreshing,
    isReady: pullDistance >= threshold,
  };
}
