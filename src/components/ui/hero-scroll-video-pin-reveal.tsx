'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TagItem {
  id?: string;
  text: string;
  background: string;
  color?: string;
}

export interface HeroScrollVideoRevealProps {
  topText?: React.ReactNode;
  headingText?: React.ReactNode;
  tags?: TagItem[];
  subText?: string;
  videoSrc?: string;
  bottomText?: React.ReactNode;
  badgeImgSrc?: string;
  className?: string;
  bgColor?: string;
}

const DEFAULT_TAGS: TagItem[] = [
  { text: 'ADR-004 Conflict Engine', background: '#1c1c1c', color: '#eeeeee' },
  { text: '4-Source Deep Inspector', background: '#242424', color: '#ffffff' },
  { text: 'Cryptographic Clearance', background: '#14281c', color: '#4ade80' },
  { text: 'Deterministic Proof Ledger', background: '#222222', color: '#eeeeee' },
];

export const HeroScrollVideoReveal: React.FC<HeroScrollVideoRevealProps> = ({
  topText = (
    <>
      Built to transfer mission-critical code,
      <br />
      <span className="font-serif italic font-normal text-[#c9c9c9]">not tribal rumors</span>
    </>
  ),
  headingText = (
    <>
      Inspect Every Claim. <br />
      Resolve Every Contradiction.
    </>
  ),
  tags = DEFAULT_TAGS,
  subText = 'From AWS SQS FIFO retries to legacy RabbitMQ clusters — Baton provides immutable source verification before successor sign-off.',
  videoSrc = 'https://res.cloudinary.com/ulgfi6yl/video/upload/v1788321431/856381-hd_1920_1080_30fps.mp4',
  bottomText = (
    <>
      Where every handover decision feels
      <br />
      <span className="font-serif italic font-normal text-[#c9c9c9]">deterministic & provable</span>
    </>
  ),
  badgeImgSrc = 'https://cdn.21st.dev/assets/mirror/23/23a474e4cceeaf6b98729302d689998195e5534241cbc33ee2c64dfc351c16d6.png',
  className = '',
  bgColor = '#0b0b0b',
}) => {
  const benefitRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoBoxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Ensure video plays smoothly
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }

    // Optional Lenis smooth scroll
    let lenis: any = null;
    let lenisTicker: ((time: number) => void) | null = null;

    import('@studio-freight/lenis')
      .then(({ default: Lenis }: any) => {
        lenis = new Lenis({ smooth: true });
        lenis.on('scroll', ScrollTrigger.update);
        lenisTicker = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(lenisTicker);
        gsap.ticker.lagSmoothing(0);
      })
      .catch(() => {});

    // Word split kinetic reveal animation
    let split: any = null;
    let words: Element[] = [];

    try {
      // Dynamically attempt SplitText if present
      const { SplitText } = require('gsap/SplitText');
      if (SplitText) {
        split = new SplitText(paraRef.current, {
          type: 'words',
          wordsClass: 'reveal-word inline-block origin-left mr-[0.25em] will-change-transform',
        });
        words = split.words || [];
      }
    } catch {
      // Fallback: manually wrap words if not already wrapped
      if (paraRef.current) {
        words = Array.from(paraRef.current.querySelectorAll('.reveal-word'));
        if (words.length === 0 && paraRef.current.textContent) {
          const text = paraRef.current.innerText || paraRef.current.textContent || '';
          paraRef.current.innerHTML = text
            .split(/\s+/)
            .map((w) => `<span class="reveal-word inline-block origin-left mr-[0.25em] will-change-transform">${w}</span>`)
            .join(' ');
          words = Array.from(paraRef.current.querySelectorAll('.reveal-word'));
        }
      }
    }

    if (words && words.length > 0) {
      gsap.set(words, { opacity: 0, rotate: 8, yPercent: 30 });
    }

    // Reveal timeline for headline & tag badges
    const revealTl = gsap.timeline({
      scrollTrigger: {
        trigger: benefitRef.current,
        start: 'top 70%',
        end: 'top -10%',
        scrub: 1.5,
      },
    });

    if (words && words.length > 0) {
      revealTl.to(words, {
        stagger: 0.2,
        opacity: 1,
        rotate: 0,
        yPercent: 0,
        ease: 'power1.inOut',
      });
    }

    tagRefs.current.forEach((tagEl) => {
      if (tagEl) {
        revealTl.to(
          tagEl,
          {
            duration: 1,
            opacity: 1,
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            ease: 'circ.out',
          },
          '>-0.4'
        );
      }
    });

    // ── Responsive MatchMedia for Small, Mid, and Large screens ─────────────
    const mm = gsap.matchMedia();

    // 1. Small Screens (Mobile < 640px)
    mm.add('(max-width: 639.9px)', () => {
      gsap.set(videoBoxRef.current, { clipPath: 'circle(18% at 50% 50%)' });

      const vpTl = gsap.timeline({
        scrollTrigger: {
          trigger: videoWrapperRef.current,
          start: 'top top',
          end: '+=1500',
          scrub: 1.2,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onRefresh: (self: any) => {
            if (self.spacer) self.spacer.style.backgroundColor = bgColor;
            if (self.pin) self.pin.style.backgroundColor = bgColor;
          },
          onToggle: (self: any) => {
            if (self.spacer) self.spacer.style.backgroundColor = bgColor;
            if (self.pin) self.pin.style.backgroundColor = bgColor;
          },
        },
      });

      vpTl.fromTo(
        videoBoxRef.current,
        { clipPath: 'circle(18% at 50% 50%)' },
        { clipPath: 'circle(150% at 50% 50%)', ease: 'none' }
      );
    });

    // 2. Mid Screens (Tablets / Phablets 640px - 1023.9px)
    mm.add('(min-width: 640px) and (max-width: 1023.9px)', () => {
      gsap.set(videoBoxRef.current, { clipPath: 'circle(12% at 50% 50%)' });

      const vpTl = gsap.timeline({
        scrollTrigger: {
          trigger: videoWrapperRef.current,
          start: 'top top',
          end: '+=2000',
          scrub: 1.3,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onRefresh: (self: any) => {
            if (self.spacer) self.spacer.style.backgroundColor = bgColor;
            if (self.pin) self.pin.style.backgroundColor = bgColor;
          },
          onToggle: (self: any) => {
            if (self.spacer) self.spacer.style.backgroundColor = bgColor;
            if (self.pin) self.pin.style.backgroundColor = bgColor;
          },
        },
      });

      vpTl.fromTo(
        videoBoxRef.current,
        { clipPath: 'circle(12% at 50% 50%)' },
        { clipPath: 'circle(150% at 50% 50%)', ease: 'none' }
      );
    });

    // 3. Large Screens (Desktop >= 1024px)
    mm.add('(min-width: 1024px)', () => {
      gsap.set(videoBoxRef.current, { clipPath: 'circle(8% at 50% 50%)' });

      const vpTl = gsap.timeline({
        scrollTrigger: {
          trigger: videoWrapperRef.current,
          start: 'top top',
          end: '+=2500',
          scrub: 1.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onRefresh: (self: any) => {
            if (self.spacer) self.spacer.style.backgroundColor = bgColor;
            if (self.pin) self.pin.style.backgroundColor = bgColor;
          },
          onToggle: (self: any) => {
            if (self.spacer) self.spacer.style.backgroundColor = bgColor;
            if (self.pin) self.pin.style.backgroundColor = bgColor;
          },
        },
      });

      vpTl.fromTo(
        videoBoxRef.current,
        { clipPath: 'circle(8% at 50% 50%)' },
        { clipPath: 'circle(150% at 50% 50%)', ease: 'none' }
      );
    });

    return () => {
      if (split && split.revert) split.revert();
      revealTl.kill();
      mm.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (lenis && lenisTicker) {
        gsap.ticker.remove(lenisTicker);
        lenis.destroy();
      }
    };
  }, [bgColor]);

  return (
    <div
      className={`w-full min-h-screen text-[#eeeeee] font-sans overflow-x-hidden ${className}`}
      style={{ backgroundColor: bgColor, color: '#eeeeee' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .pin-spacer {
              background-color: ${bgColor} !important;
            }
          `,
        }}
      />

      {/* ── Section 1: Intro Text ────────────────────────────────────────── */}
      <section
        className="w-full min-h-screen flex justify-center items-center text-center px-4 sm:px-8 py-8 text-[clamp(2rem,5vw,5rem)] font-bold tracking-tight leading-tight text-white relative z-10"
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-4xl">{topText}</div>
      </section>

      {/* ── Section 2: Benefit & Headline Section ─────────────────────────── */}
      <section
        ref={benefitRef}
        className="relative w-full min-h-[140vh] md:min-h-[160vh] pb-16 md:pb-20"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 flex flex-col items-center text-center relative z-10"
          style={{ backgroundColor: bgColor }}
        >
          {/* Animated Kinetic Headline */}
          <div className="w-full mb-8 sm:mb-12 md:mb-14">
            <p
              ref={paraRef}
              className="text-[clamp(2.2rem,5.5vw,5.2rem)] font-extrabold tracking-tight leading-tight text-white overflow-visible"
            >
              {headingText}
            </p>
          </div>

          {/* Staggered Clip-Path Tag Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4 max-w-4xl mx-auto my-4 sm:my-6 mb-8 sm:mb-14">
            {tags.map((tag, idx) => (
              <div
                key={tag.id || `tag-${idx}`}
                ref={(el) => {
                  tagRefs.current[idx] = el;
                }}
                className="px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-[clamp(0.9rem,1.8vw,1.4rem)] font-semibold tracking-tight opacity-0 shadow-2xl will-change-[clip-path,opacity] border border-[#333333]"
                style={{
                  backgroundColor: tag.background,
                  color: tag.color || '#ffffff',
                  clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                }}
              >
                {tag.text}
              </div>
            ))}
          </div>

          {subText && (
            <p className="text-[clamp(0.95rem,1.4vw,1.25rem)] text-[#8d8d8d] font-normal max-w-2xl mt-2 sm:mt-4 px-4 leading-relaxed">
              {subText}
            </p>
          )}
        </div>

        {/* ── Video Pin Section ───────────────────────────────────────────── */}
        <div className="relative w-full" style={{ backgroundColor: bgColor }}>
          <div
            ref={videoWrapperRef}
            className="w-full h-screen flex justify-center items-center relative overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            {/* Absolute solid dark underlay behind the video expansion circle */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: bgColor,
                zIndex: 1,
              }}
            />

            <div
              ref={videoBoxRef}
              className="relative w-full h-full overflow-hidden flex justify-center items-center will-change-[clip-path]"
              style={{ backgroundColor: bgColor, zIndex: 2 }}
            >
              {/* Rotating Circular Text Badge */}
              {badgeImgSrc && (
                <img
                  src={badgeImgSrc}
                  alt="rotating badge"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 z-20 pointer-events-none animate-[spin_18s_linear_infinite] opacity-90 select-none"
                />
              )}

              {/* High-Tech Handover Visual Video */}
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: bgColor }}
              >
                <source src={videoSrc} type="video/mp4" />
              </video>

              {/* Centered Glassmorphic Indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex justify-center items-center shadow-2xl">
                  <Play size={20} className="text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Bottom Outro Text ─────────────────────────────────── */}
      <section
        className="w-full min-h-screen flex justify-center items-center text-center px-4 sm:px-8 py-8 text-[clamp(2rem,5vw,5rem)] font-bold tracking-tight leading-tight text-white relative z-10"
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-4xl">{bottomText}</div>
      </section>
    </div>
  );
};

export default HeroScrollVideoReveal;
