"use client";

// Full-screen motion-design showcase inside an ink-on-cream frame.
// Responsive source swap: 16:9 on landscape/desktop, 9:16 on portrait/mobile
// (chosen by the <source media> aspect-ratio query, resolved once by the browser).
// Muted autoplay only while the frame is on screen (IntersectionObserver), with a
// sound toggle. Under prefers-reduced-motion it never autoplays — it shows the
// poster with native controls so the viewer starts it themselves.

import { useEffect, useRef, useState } from "react";
import { BASE } from "../app/base.ts";

export default function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [muted, setMuted] = useState(true);

  // Detect prefers-reduced-motion (null until known, so we never autoplay before
  // the preference is read).
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) {
      setReduced(false);
      return;
    }
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Autoplay muted on entry, pause on exit. Skipped entirely under reduced motion.
  useEffect(() => {
    if (reduced !== false) return;
    const video = videoRef.current;
    if (!video) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {}); // autoplay can be blocked; ignore
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, [reduced]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) video.play().catch(() => {}); // unmuting is a user gesture → play is allowed
  };

  return (
    <section className="section video-section" id="video" data-snap>
      <div className="wrap video-wrap">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <span className="eyebrow">Motion</span>
          <h2>A comunicação é alcançar pessoas</h2>
        </div>
        <figure className="video-frame">
          <video
            ref={videoRef}
            className="video-el"
            playsInline
            muted
            loop
            preload="none"
            poster={`${BASE}/video-poster.jpg`}
            controls={reduced === true}
            aria-label="Vídeo de apresentação em motion design"
          >
            <source media="(min-aspect-ratio: 1/1)" src={`${BASE}/video-16x9.mp4`} type="video/mp4" />
            <source src={`${BASE}/video-9x16.mp4`} type="video/mp4" />
          </video>
          {reduced === false && (
            <button type="button" className="video-sound" onClick={toggleSound} aria-pressed={!muted}>
              {muted ? "Ativar som" : "Desativar som"}
            </button>
          )}
        </figure>
      </div>
    </section>
  );
}
