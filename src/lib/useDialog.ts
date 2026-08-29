import { useEffect, RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Shared overlay behavior for dialogs/drawers: locks body scroll, moves initial
 * focus into the container, traps Tab cycling, and closes on Escape.
 * Pair with a container that has role="dialog" aria-modal="true" tabIndex={-1}.
 */
export function useDialogBehavior({
  containerRef,
  active,
  onEscape,
  lockScroll = true,
  trapFocus = true,
}: {
  containerRef: RefObject<HTMLElement | null>;
  active: boolean;
  onEscape?: () => void;
  lockScroll?: boolean;
  trapFocus?: boolean;
}) {
  useEffect(() => {
    if (!active) return;

    if (lockScroll) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [active, lockScroll]);

  useEffect(() => {
    if (!active) return;
    containerRef.current?.focus();
  }, [active, containerRef]);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.stopPropagation();
        onEscape();
        return;
      }
      if (event.key === 'Tab' && trapFocus) {
        const container = containerRef.current;
        if (!container) return;
        const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
          .filter(el => el.offsetParent !== null || el === document.activeElement);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement;
        if (event.shiftKey && (current === first || current === container)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (current === last || current === container || !(current instanceof HTMLElement) || !container.contains(current))) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [active, onEscape, trapFocus, containerRef]);
}
