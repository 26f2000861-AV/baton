# DNS Setup for gitlostbaton.xyz — SPF & DMARC (SEOptimer audit: Security/DNS)

Audit finding: no SPF record and no DMARC record → the domain can be spoofed
by anyone sending mail that claims to come from `@gitlostbaton.xyz`.

Baton currently **sends no email from this domain** (no MX records, no
transactional mail, no newsletter). The correct hardening for a
non-sending domain is a *null SPF* plus a *reject-all* DMARC policy.

## Records to add (at the DNS panel that hosts the zone — currently
`*.nic.xyz` nameservers, i.e. the registrar's DNS panel; if you later move
DNS to Vercel, add the same records there instead)

| Type | Host / Name          | Value                                                              | TTL   |
| ---- | -------------------- | ------------------------------------------------------------------ | ----- |
| TXT  | `@` (or blank)       | `v=spf1 -all`                                                      | 3600  |
| TXT  | `_dmarc`             | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s`                   | 3600  |

Notes on the values:

- `v=spf1 -all` — "this domain sends no mail from anywhere." Any server
  claiming otherwise fails SPF. This is the RFC-recommended setup for a
  non-sending domain and scores the audit item immediately.
- `p=reject` — receivers must discard spoofed mail. `sp=reject` extends the
  policy to subdomains. `adkim=s` / `aspf=s` enforce strict alignment.
- No `rua=` mailbox is included on purpose: there is no mailbox on this
  domain to receive aggregate reports. If you later create one (e.g.
  `postmaster@`), append `; rua=mailto:postmaster@gitlostbaton.xyz`.

## If you start sending mail later

Replace the SPF with an include for your provider, and soften DMARC while
you tune it, e.g. for Vercel/Resend-style transactional mail:

```text
TXT @      → v=spf1 include:_spf.YOUR-PROVIDER.com ~all
TXT _dmarc → v=DMARC1; p=quarantine; rua=mailto:postmaster@gitlostbaton.xyz
```

(SEOptimer's generic suggestion of `~all` + `p=quarantine` is the right
shape *only once real mail flows*; with no mail flowing, `-all` + `p=reject`
is strictly safer.)

## Verify after adding

```bash
dig TXT gitlostbaton.xyz +short        # → "v=spf1 -all"
dig TXT _dmarc.gitlostbaton.xyz +short # → "v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s"
```

Then re-run the SEOptimer audit — the "Add DMARC Mail Record" and
"Add SPF Mail Record" findings should clear.

## Related reminder from the Round 3 compliance check (still open, team-side)

The payment provider key that was accidentally published in
`docs/ROUND_2_FORM_RESPONSE_DRAFT.md` (now scrubbed from the repo) must be
**rotated in the provider's dashboard** — removing the string from git
history does not invalidate the leaked credential. Rotation can only be
done by the team; it cannot be done from this environment.
