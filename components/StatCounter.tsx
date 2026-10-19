"use client";

import { useEffect, useRef, useState } from "react";

export default function StatCounter({
  n,
  prefix = "",
  suffix = "",
  label,
}: {
  n: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const decimals = Number.isInteger(n) ? 0 : 1;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(n);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const dur = 1300;
        let start = 0;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min(1, (ts - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(eased * n);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [n]);

  return (
    <div className="stat" ref={ref}>
      <span className="stat-n">
        {prefix}
        {value.toFixed(decimals)}
        <span className="u">{suffix}</span>
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
