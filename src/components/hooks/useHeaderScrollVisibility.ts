'use client';

import { useEffect, useRef, useState } from 'react';

const TOP_THRESHOLD_PX = 12;
/** Cumulative downward travel before hide (≈3mm). */
const HIDE_AFTER_MM = 3;
/** Cumulative upward travel before show again — avoids jitter from tiny reverse deltas. */
const SHOW_AFTER_MM = 2;

function millimetersToCssPixels(mm: number): number {
  if (typeof document === 'undefined') {
    return (96 / 25.4) * mm;
  }
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;left:-9999px;height:${mm}mm;visibility:hidden;pointer-events:none`;
  document.body.appendChild(el);
  const px = el.getBoundingClientRect().height;
  document.body.removeChild(el);
  return Math.max(1, px);
}

function normalizeWheelVerticalPixels(e: WheelEvent, direction: 'down' | 'up'): number {
  if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return 0;
  if (direction === 'down' && e.deltaY <= 0) return 0;
  if (direction === 'up' && e.deltaY >= 0) return 0;

  let y = Math.abs(e.deltaY);
  if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    y *= 16;
  } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    y *= window.innerHeight || 600;
  }
  return y;
}

/**
 * Hides after ~3mm cumulative scroll/wheel down (one transition, no flicker).
 * Shows only after ~2mm cumulative scroll/wheel up while hidden (hysteresis).
 * When suppressHide is true, the header stays visible.
 */
export function useHeaderScrollVisibility(suppressHide: boolean): boolean {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const downAccumPx = useRef(0);
  const upAccumPx = useRef(0);
  const barHiddenRef = useRef(false);
  const hideThresholdPx = useRef(1);
  const showThresholdPx = useRef(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    lastScrollY.current = window.scrollY;
  }, []);

  useEffect(() => {
    if (suppressHide) {
      setVisible(true);
      barHiddenRef.current = false;
      downAccumPx.current = 0;
      upAccumPx.current = 0;
    }
  }, [suppressHide]);

  useEffect(() => {
    if (!suppressHide && typeof window !== 'undefined') {
      lastScrollY.current = window.scrollY;
      downAccumPx.current = 0;
      upAccumPx.current = 0;
      barHiddenRef.current = false;
    }
  }, [suppressHide]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const refreshThresholds = () => {
      hideThresholdPx.current = millimetersToCssPixels(HIDE_AFTER_MM);
      showThresholdPx.current = millimetersToCssPixels(SHOW_AFTER_MM);
    };
    refreshThresholds();
    window.addEventListener('resize', refreshThresholds);

    const tryHideFromAccum = () => {
      if (barHiddenRef.current) return;
      if (downAccumPx.current < hideThresholdPx.current) return;
      setVisible(false);
      barHiddenRef.current = true;
      downAccumPx.current = 0;
      upAccumPx.current = 0;
    };

    const tryShowFromUpAccum = () => {
      if (!barHiddenRef.current) return;
      if (upAccumPx.current < showThresholdPx.current) return;
      setVisible(true);
      barHiddenRef.current = false;
      downAccumPx.current = 0;
      upAccumPx.current = 0;
    };

    const applyTopThreshold = () => {
      const y = window.scrollY;
      if (y <= TOP_THRESHOLD_PX) {
        setVisible(true);
        barHiddenRef.current = false;
        lastScrollY.current = y;
        downAccumPx.current = 0;
        upAccumPx.current = 0;
        return true;
      }
      return false;
    };

    const onScroll = () => {
      if (suppressHide) return;

      const y = window.scrollY;
      if (applyTopThreshold()) return;

      const prev = lastScrollY.current;

      if (y < prev) {
        const deltaUp = prev - y;
        if (barHiddenRef.current) {
          upAccumPx.current += deltaUp;
          tryShowFromUpAccum();
        } else {
          downAccumPx.current = 0;
        }
      } else if (y > prev) {
        if (barHiddenRef.current) {
          upAccumPx.current = 0;
        } else {
          downAccumPx.current += y - prev;
          tryHideFromAccum();
        }
      }
      lastScrollY.current = y;
    };

    const onWheel = (e: WheelEvent) => {
      if (suppressHide) return;
      if (applyTopThreshold()) return;

      const down = normalizeWheelVerticalPixels(e, 'down');
      if (down > 0) {
        if (barHiddenRef.current) {
          upAccumPx.current = 0;
        } else {
          downAccumPx.current += down;
          tryHideFromAccum();
        }
        return;
      }

      const up = normalizeWheelVerticalPixels(e, 'up');
      if (up > 0) {
        if (barHiddenRef.current) {
          upAccumPx.current += up;
          tryShowFromUpAccum();
        } else {
          downAccumPx.current = Math.max(0, downAccumPx.current - up);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', refreshThresholds);
    };
  }, [suppressHide]);

  return visible;
}
