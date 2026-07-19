'use client';

import { useEffect } from 'react';
import { directorActions } from './useDemoDirector';
import { DEMO_MODE } from './config';

/**
 * The single, canonical keyboard handler for the demo. Mounted once.
 *
 * Owns SPACE (advance), Y (approve), K (hold), R (reset) and G (toggle swarm
 * graph). Registered in the CAPTURE phase with stopImmediatePropagation on the
 * claimed keys so it deterministically wins over Osiris's own bubble-phase
 * handler in page.tsx — without editing page.tsx.
 *
 * SPACE/Y/K are demo-only and always claimed. R and G collide with Osiris
 * (fly-to-world / projection toggle); those are only intercepted while
 * DEMO_MODE is on, so Osiris keeps them when nobody is presenting.
 */
export default function DemoKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag)) return;
      // Don't fight browser shortcuts (e.g. Ctrl/Cmd+R reload).
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      const claim = () => {
        e.preventDefault();
        e.stopImmediatePropagation();
      };

      if (e.code === 'Space') {
        claim();
        directorActions.advance();
      } else if (key === 'y') {
        claim();
        directorActions.approve();
      } else if (key === 'k') {
        claim();
        directorActions.hold();
      } else if (key === 'r' && DEMO_MODE) {
        claim();
        directorActions.reset();
      } else if (key === 'g' && DEMO_MODE) {
        claim();
        directorActions.toggleGraph();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  return null;
}
