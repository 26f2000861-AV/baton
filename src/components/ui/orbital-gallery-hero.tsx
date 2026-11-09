"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import BatonMark from "../BatonMark";

const records = [
  { label: "Routing conflict", title: "SQS FIFO vs RabbitMQ", key: "claim_09", status: true },
  { label: "Verified claim", title: "Postgres SKIP LOCKED", key: "pr_189" },
  { label: "Successor sign-off", title: "Four sections to review", key: "0 / 4 accepted" },
  { label: "Unfinished work", title: "PR #214 · seed collision", key: "claim_05" },
  { label: "Ownership transfer", title: "Stripe Webhook Gateway", key: "Due Nov 10, 2026" },
  { label: "Inferred rationale", title: "72-hour token TTL", key: "commit_8f4a1" },
  { label: "Visible to successor", title: "Nine source-backed claims", key: "FinTrack / Payment Core" },
  { label: "Open source question", title: "Webhook retry path", key: "PR #204 · Slack" },
];

export function HeroSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState({ x: 460, y: 250 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setRadius({
        x: Math.max(118, Math.min(width * 0.39, 500)),
        y: Math.max(150, Math.min(height * 0.34, 300)),
      });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="orbital-hero" aria-labelledby="landing-title">
      <header className="orbital-header">
        <div className="landing-brandline">
          <BatonMark />
          <span><strong>Baton</strong><small>Engineering handover</small></span>
        </div>
        <span className="landing-scope"><i aria-hidden="true" />FinTrack / Payment Core</span>
      </header>

      <div ref={stageRef} className="orbital-stage" aria-hidden="true">
        <motion.div
          className="orbital-ring"
          initial={false}
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 58, repeat: Infinity, ease: "linear" }}
        >
          {records.map((record, index) => {
            const angle = (index * 360) / records.length;
            const radians = (angle * Math.PI) / 180;
            const x = Math.cos(radians) * radius.x;
            const y = Math.sin(radians) * radius.y;

            return (
              <div
                className="orbit-card-wrap"
                key={`${record.key}-${index}`}
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <motion.div
                  className="orbit-card"
                  initial={false}
                  animate={reduceMotion ? undefined : { rotate: -360 }}
                  transition={{ duration: 58, repeat: Infinity, ease: "linear" }}
                >
                  <small className={record.status ? "orbit-status" : undefined}>{record.label}</small>
                  <strong>{record.title}</strong>
                  <code>{record.key}</code>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="orbital-content">
        <p className="landing-kicker">A source-backed engineering handover</p>
        <h1 id="landing-title">Payment Core handover</h1>
        <p className="landing-description">
          One routing conflict is still open. Review the records, follow each claim to its source, and give the next owner a clear way forward.
        </p>
        <Link className="primary-action landing-action" href="/workspace">
          Continue to workspace <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <div className="landing-stats" aria-label="Current sample handover summary">
          <span>9 visible claims</span><span>1 open conflict</span><span>0 of 4 accepted</span>
        </div>
        <p className="landing-note">Local sample records · No live systems connected</p>
      </div>
    </section>
  );
}

export default HeroSection;
