# On-Chain Horizon Hackathon — Submission Pack

**Event:** HashKey Chain On-Chain Horizon Hackathon (June 18 – July 14, 2026)  
**Track:** **AI** (primary) — on-chain financial infrastructure for AI agents  
**Project:** HashGraph  
**Deadline:** July 11, 23:59 GMT+8  

> Not submitting under pure DeFi — HSP is required for that track and is out of scope.  
> HashGraph makes HashKey DeFi *legible to AI agents*; it is AI-track infrastructure.

---

## One-liner

HashGraph compiles HashKey smart contracts into deterministic Protocol Graphs that Claude/Cursor query over MCP — facts from chain, AI only annotates.

---

## Links (paste into the form)

| Item | URL / value |
|------|-------------|
| **GitHub** | https://github.com/Nifemi0/HashGraph |
| **Live site** | https://hashgraph-eight.vercel.app |
| **Explorer UI** | https://hashgraph-eight.vercel.app/explorer.html |
| **Docs** | https://hashgraph-eight.vercel.app/docs.html |
| **npm** | https://www.npmjs.com/package/hashgraph-mcp · `npx -y hashgraph-mcp` |
| **Mainnet contract** | `HashGraphRegistry` |
| **Address** | `0x3776Cc9AEe3AFb005F9465e6B78079FCf4d16DA6` |
| **Explorer** | https://explorer.hsk.xyz/address/0x3776Cc9AEe3AFb005F9465e6B78079FCf4d16DA6 |
| **Deploy tx** | `0x27c0351a20720287365114eff963a16f9b9a1b25d0882fed066996c268613709` |
| **Block** | `24688343` · Chain ID **177** |
| **Demo contract** | CELA `0xF1B50eD67A9e2CC94Ad3c477779E2d4cBfFf9029` |
| **Demo kit** | [DEMO.md](./DEMO.md) |

---

## Track alignment (AI)

- MCP server for AI IDEs (Claude, Cursor)
- Deterministic compiler (roles, events, privileges, deps)
- Optional semantic enrichment with **ADR-015: AI never creates facts**
- On-chain graph attestation registry on HashKey Mainnet
- Safety tools: calldata explain, simulate, search

## Built during hackathon

- First commit: **2026-07-07**
- Mainnet registry deploy: **2026-07-10**
- All work on HashKey Chain

## Official stack used

- HashKey Mainnet (177)
- HashKey Blockscout / explorer
- Public HashKey RPC (`mainnet.hsk.xyz`)
- Ecosystem verified contracts (CELA, WHSK, DOGS) as demos

*(HSP/CCIP not required for AI track.)*

---

## Demo script (2–3 min)

See [DEMO.md](./DEMO.md). Hero flow:

1. Landing → problem  
2. `npx -y hashgraph-mcp` in Claude/Cursor  
3. Protocol graph for CELA  
4. Explain transfer calldata  
5. Mainnet registry address + attestation  

Meetup / Demo Day registration (if selected): https://luma.com/bljpi0vd  

---

## Judge FAQ

| Question | Answer |
|----------|--------|
| Why not just Claude? | Claude reads files; HashGraph compiles protocols with provenance + MCP schema |
| Why deterministic? | Facts from verified ABI/source only; AI annotates |
| Why mainnet? | Hackathon requires mainnet deploy — registry is live |
| Why AI not DeFi? | Product is agent infrastructure; DeFi track requires HSP |

---

## Live on-chain demo proof

| Item | Value |
|------|--------|
| **CELA graph attested** | yes |
| **graphHash** | `0x8a596a656501772fafb3e5c535231a20d56e24d25fb992b0fc5f7301e297e8f6` |
| **Attest tx** | [`0x65e5ae501e4d77b858bbb7521934d907d0162347f70a79ce8de94142bb039177`](https://explorer.hsk.xyz/tx/0x65e5ae501e4d77b858bbb7521934d907d0162347f70a79ce8de94142bb039177) |
| **Attester** | `0xCbe7F5506A373d8aD8142f76Bb9d7fA6d609008C` |
| **Registry verified** | yes on Blockscout |

---

## Pre-submit checklist

- [x] Mainnet contract deployed  
- [x] Contract source verified on explorer  
- [x] At least one demo attestation (CELA)  
- [ ] npm latest includes mainnet registry client (`1.0.5`)  
- [ ] GitHub README shows AI track + mainnet registry  
- [ ] Official hackathon form submitted before July 11 23:59 GMT+8  
- [ ] Team registration confirmed  
- [ ] Demo video recorded (optional but recommended)  
