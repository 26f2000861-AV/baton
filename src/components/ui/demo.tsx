'use client';

import React from 'react';
import HeroScrollVideoReveal from '@/components/ui/hero-scroll-video-pin-reveal';

export default function HeroScrollVideoRevealDemo() {
  return (
    <div
      className="min-h-screen w-full bg-[#0b0b0b] text-white overflow-x-hidden"
      style={{ backgroundColor: '#0b0b0b', color: '#ffffff', minHeight: '100vh', width: '100%' }}
    >
      <HeroScrollVideoReveal />
    </div>
  );
}
