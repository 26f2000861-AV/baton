'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  className?: string;
  bgColor?: string;
  children?: React.ReactNode;
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
  className = '',
  bgColor = '#0b0b0b',
  children,
}) => {
  const benefitRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Word split kinetic reveal animation
    let split: any = null;
    let words: Element[] = [];

    try {
      const { SplitText } = require('gsap/SplitText');
      if (SplitText) {
        split = new SplitText(paraRef.current, {
          type: 'words',
          wordsClass: 'reveal-word inline-block origin-left mr-[0.25em] will-change-transform',
        });
        words = split.words || [];
      }
    } catch {
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
      gsap.set(words, { opacity: 0, rotate: 6, yPercent: 24 });
    }

    // Reveal timeline for headline & tag badges
    const revealTl = gsap.timeline({
      scrollTrigger: {
        trigger: benefitRef.current,
        start: 'top 75%',
        end: 'top 20%',
        scrub: 1.2,
      },
    });

    if (words && words.length > 0) {
      revealTl.to(words, {
        stagger: 0.15,
        opacity: 1,
        rotate: 0,
        yPercent: 0,
        ease: 'power1.out',
      });
    }

    tagRefs.current.forEach((tagEl) => {
      if (tagEl) {
        revealTl.to(
          tagEl,
          {
            duration: 0.8,
            opacity: 1,
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            ease: 'circ.out',
          },
          '>-0.3'
        );
      }
    });

    return () => {
      if (split && split.revert) split.revert();
      revealTl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      className={`w-full text-[#eeeeee] font-sans overflow-x-hidden ${className}`}
      style={{ backgroundColor: bgColor, color: '#eeeeee' }}
    >
      {/* ── Section 1: Intro Bold Tagline ─────────────────────────────────── */}
      <section
        className="w-full min-h-[48vh] flex flex-col justify-center items-center text-center px-4 sm:px-8 pt-28 pb-14 text-[clamp(1.9rem,4.2vw,3.8rem)] font-bold tracking-tight leading-tight text-white relative z-10"
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-4xl">{topText}</div>
        <div className="mt-8 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8d8d8d]">
          <span>Scroll to inspect handover architecture</span>
          <span>&darr;</span>
        </div>
      </section>

      {/* ── Center Content: Artifact & Workspace Section (Between Scroll Animations) ── */}
      {children}

      {/* ── Section 2: Benefit & Headline Section (Without Video) ─────────── */}
      <section
        ref={benefitRef}
        className="relative w-full py-16 md:py-24 border-t border-[#1e1e1e]"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center relative z-10"
          style={{ backgroundColor: bgColor }}
        >
          {/* Animated Kinetic Headline */}
          <div className="w-full mb-8 sm:mb-12">
            <p
              ref={paraRef}
              suppressHydrationWarning
              className="text-[clamp(2.2rem,5.5vw,5rem)] font-extrabold tracking-tight leading-tight text-white overflow-visible"
            >
              {headingText}
            </p>
          </div>

          {/* Staggered Clip-Path Tag Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4 max-w-4xl mx-auto my-4 sm:my-6 mb-8 sm:mb-10">
            {tags.map((tag, idx) => (
              <div
                key={tag.id || `tag-${idx}`}
                ref={(el) => {
                  tagRefs.current[idx] = el;
                }}
                className="px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-[clamp(0.9rem,1.8vw,1.35rem)] font-semibold tracking-tight opacity-0 shadow-2xl will-change-[clip-path,opacity] border border-[#333333]"
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
            <p className="text-[clamp(0.95rem,1.4vw,1.25rem)] text-[#8d8d8d] font-normal max-w-2xl mt-2 px-4 leading-relaxed">
              {subText}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HeroScrollVideoReveal;
