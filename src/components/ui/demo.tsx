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
        newsletter={{ label: "weekly handover audit digest", placeholder: "engineer@company.com" }}
        status={{ label: "Payment Core: Verified State Ready", href: "/workspace#signoff" }}
        mark="BATON / 2026"
        timeZone="Asia/Kolkata"
        timeLabel="IST"
        columns={[
          {
            title: "workspace",
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
        sideLinks={[
          { icon: "shield", label: "sha-256 seal", href: "/workspace#signoff" },
          { icon: "doc", label: "adr-004 spec", href: "/workspace#conflict" },
        ]}
        chat={{ label: "inspect", href: "/workspace#conflict" }}
        copyright="© 2026 Baton — Accountable Engineering Handover Ledger"
        credit="verified by cryptographic clearance"
        handle={{ label: "github.com/26f2000861-AV/baton", href: "https://github.com/26f2000861-AV/baton" }}
      />
    </div>
  );
}
