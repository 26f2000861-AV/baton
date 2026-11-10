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
  { text: 'Evidence-backed claims', background: '#1c1c1c', color: '#eeeeee' },
  { text: 'Decisions and open work', background: '#242424', color: '#ffffff' },
  { text: 'Ownership transfer', background: '#20241e', color: '#d5dfca' },
  { text: 'Human-reviewed risks', background: '#222222', color: '#eeeeee' },
];

export const HeroScrollVideoReveal: React.FC<HeroScrollVideoRevealProps> = ({
  topText = (
    <>
      Keep critical work moving,
      <br />
      <span className="font-serif italic font-normal text-[#c9c9c9]">even when ownership changes</span>
    </>
  ),
  headingText = (
    <>
      Keep the context. <br />
      Make the next step clear.
    </>
  ),
  tags = DEFAULT_TAGS,
  subText = 'Bring decisions, unfinished work, ownership, and risk into one handover. Show what the evidence supports, what conflicts, and what the next owner still needs to check.',
  className = '',
  bgColor = '#0b0b0b',
  children,
}) => {
  const benefitRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const motion = gsap.matchMedia();

    motion.add('(prefers-reduced-motion: no-preference)', () => {
      // Word split kinetic reveal animation. Content stays visible unless this
      // motion preference matches and the animation is ready to run.
      let split: any = null;
      let words: Element[] = [];
      const paragraph = paraRef.current;
      const originalMarkup = paragraph?.innerHTML ?? '';

      try {
        const { SplitText } = require('gsap/SplitText');
        if (SplitText && paragraph) {
          split = new SplitText(paragraph, {
            type: 'words',
            wordsClass: 'reveal-word inline-block origin-left mr-[0.25em]',
          });
          words = split.words || [];
        }
      } catch {
        // Preserve rich React markup if the optional word-splitting plugin is unavailable.
        if (paragraph?.textContent) words = [paragraph];
      }

      if (words.length > 0) {
        gsap.set(words, { opacity: 0, rotate: 6, yPercent: 24 });
      }
      tagRefs.current.forEach((tagEl) => {
        if (tagEl) gsap.set(tagEl, { opacity: 0, clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' });
      });

      // One authored entrance plays once as the handover principles enter view.
      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: benefitRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
          once: true,
        },
      });

      if (words.length > 0) {
        revealTl.to(words, {
          duration: 0.42,
          stagger: 0.025,
          opacity: 1,
          rotate: 0,
          yPercent: 0,
          ease: 'power1.out',
        });
      }

      const visibleTags = tagRefs.current.filter((tagEl): tagEl is HTMLDivElement => tagEl !== null);
      if (visibleTags.length > 0) {
        revealTl.to(
          visibleTags,
          {
            duration: 0.28,
            stagger: 0.04,
            opacity: 1,
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            ease: 'power2.out',
          },
          words.length > 0 ? '>-0.08' : 0
        );
      }

      return () => {
        revealTl.scrollTrigger?.kill();
        revealTl.kill();
        if (split?.revert) split.revert();
        else if (paragraph && paragraph.innerHTML !== originalMarkup) paragraph.innerHTML = originalMarkup;
      };
    });

    return () => motion.revert();
  }, []);

  return (
    <div
      className={`w-full text-[#eeeeee] font-sans overflow-x-hidden ${className}`}
      style={{ backgroundColor: bgColor, color: '#eeeeee' }}
    >
      {/* ── Section 1: Intro Bold Tagline ─────────────────────────────────── */}
      <section
        className="w-full min-h-[44vh] sm:min-h-[48vh] flex flex-col justify-center items-center text-center px-4 sm:px-8 pt-20 sm:pt-28 pb-10 sm:pb-14 text-[clamp(1.6rem,4.8vw,3.8rem)] font-bold tracking-tight leading-tight text-white relative z-10"
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
                className="px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-[clamp(0.9rem,1.8vw,1.35rem)] font-semibold tracking-tight shadow-2xl border border-[#333333]"
                style={{
                  backgroundColor: tag.background,
                  color: tag.color || '#ffffff',
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
