import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** Rendered before the section enters the viewport. */
  placeholder?: ReactNode;
  /** Root margin so content mounts slightly before it scrolls into view. */
  rootMargin?: string;
  className?: string;
}

/**
 * Defers mounting of its children until it scrolls near the viewport.
 * Used to lazy-load heavier recommendation rails on the PDP.
 */
export const LazySection = ({
  children,
  placeholder = null,
  rootMargin = "200px",
  className,
}: LazySectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : placeholder}
    </div>
  );
};
