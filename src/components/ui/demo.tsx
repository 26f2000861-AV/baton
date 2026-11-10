'use client';

import React from 'react';
import PushpinTearFooter from '@/components/ui/pushpin-tear-footer';
import BatonMark from '@/components/BatonMark';

export default function PushpinTearFooterDemo() {
  return (
    <div className="w-full bg-[#0b0b0b] text-[#eeeeee]">
      <PushpinTearFooter
        brand="baton."
        name="handover ledger"
        logoHref="/"
        logo={<BatonMark compact />}
        sheet="#181818"
        paper="#0b0b0b"
        sheetInk="#eeeeee"
        paperInk="#efefef"
        seed={7}
        email="adityaverma200911@gmail.com"
        socials={[{ icon: "github", label: "GitHub Profile", href: "https://github.com/26f2000861-AV" }]}
        timeZone="Asia/Kolkata"
        timeLabel="IST"
        columns={[
          {
            title: "handover",
            links: [
              { label: "Claims Ledger", href: "/workspace#claims" },
              { label: "Routing Conflict", href: "/workspace#conflict" },
              { label: "Evidence Drawer", href: "/workspace#source" },
            ],
            cta: { label: "workspace.", href: "/workspace" },
          },
          {
            title: "verification",
            links: [
              { label: "ADR-004 Decision", href: "/workspace#decisions" },
              { label: "Ownership Transfer", href: "/workspace#ownership" },
              { label: "Leaver Interview", href: "/workspace#interview" },
            ],
            cta: { label: "sign-off.", href: "/workspace#signoff" },
          },
        ]}
        newsletter={null}
        status={null}
        chat={null}
        sideLinks={[]}
        mark=""
        handle={null}
        copyright="© 2026 Baton — Accountable Engineering Handover Ledger"
        credit="verified by cryptographic clearance"
      />
    </div>
  );
}
