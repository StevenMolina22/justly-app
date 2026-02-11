
# Introduction to Slice

Slice is a dispute resolution layer built for digital businesses.

As platforms grow, payments accelerate, and users become global, one challenge inevitably appears: **disputes**.

Marketplace orders go wrong.\
Freelance work is contested.\
Services don’t meet expectations.\
Digital agreements break.

Handling these conflicts internally is **expensive, slow, and risky**.

Support teams don’t scale.\
Manual reviews introduce bias.\
And platforms are forced to act as judge in disputes they didn’t create.

***

### Why Slice Exists

Slice exists to remove that burden.

Instead of building custom dispute processes from scratch, platforms can integrate Slice as a **neutral resolution layer**, handling conflicts externally, fairly, and consistently.

***

### Value for Businesses

Slice helps businesses:

* Resolve disputes without internal arbitration
* Reduce operational and legal overhead
* Improve trust between users
* Scale globally without turning disputes into a bottleneck

***

### Value for Users

For users, Slice creates a system where:

* Disputes are reviewed by independent participants
* Evidence matters more than influence
* Outcomes follow transparent rules rather than opaque policies

***

### Built for Both Sides

Slice is designed to serve both sides naturally.

Platforms integrate it to protect their ecosystem.\
Users engage with it knowing that fairness and accountability are part of the process.

Behind the scenes, Slice relies on **economic incentives and carefully designed coordination mechanisms**. Participants are rewarded for honest decisions, discouraged from bad behavior, and selected independently — ensuring the system remains reliable over time without requiring trust in a single authority.

***

#### Scope at a Conceptual Level

Slice is designed to resolve adversarial disputes arising from digital agreements and payments, where:

* There are clear parties in conflict.
* Value is at stake.
* Outcomes must be enforced automatically.

Resolution, Not Mediation Slice focuses on definitive resolution, not mediation. It is not a general-purpose legal system, a customer support replacement, or a broad governance framework. Its goal is to provide a neutral, enforceable decision layer for digital economies — independent from platforms, jurisdictions, or internal policies.

Transactional Focus & Scale Unlike universal arbitration models, Slice is optimized for high-velocity digital transactions. It focuses on micro to mid-sized disputes where technical efficiency is paramount. It is not intended for:

* High-stakes litigation: Cases of massive financial scale that require traditional legal discovery.
* Complex Human Rights or Ethics: Subjective social or political debates that fall outside the scope of transactional evidence.

The Foundational Model Different dispute types, escalation paths, and specialization layers can be built on top of this core, but all follow the same foundational model: Human Judgment + Economic Incentives + Cryptographic Enforcement.

***

### What This Documentation Covers

This documentation will help you understand:

* When and why Slice makes sense for your product
* How it fits into different business models
* How it can be integrated into existing platforms
* How disputes are handled in a clear, predictable way

***

### Who Slice Is For

If you are building a marketplace, a fintech product, a service platform, or any digital system where agreements and payments matter, Slice is designed to make dispute resolution **simple, fair, and scalable** — without adding friction to your core business.


# Dispute Resolution Matters

Trust is not built on the absence of conflict.\
It is built on knowing what happens **when conflict appears**.

In any system where value moves between people—money, work, services, or digital assets—disagreements are inevitable. What defines the quality of that system is not whether disputes exist, but **how they are resolved**.

When there is no clear, fair, and reliable way to handle disputes, trust slowly erodes.

***

### Conflict Is a Feature, Not a Bug

Marketplaces, freelance platforms, payment systems, and on-chain protocols all rely on cooperation between parties that do not know each other.

Sooner or later, questions arise:

* Was the service delivered as agreed?
* Did the work meet expectations?
* Were the rules followed?
* Who should receive the funds?

Ignoring these questions does not make them disappear.\
It only pushes the problem to the edges of the system, where decisions become arbitrary and opaque.

***

### Centralized Resolution Doesn’t Scale Trust

Most digital platforms handle disputes internally:\
support teams, moderators, private policies, manual reviews.

This creates a structural conflict:

* the platform acts as both **judge and interested party**,
* decisions are hard to audit,
* users have little visibility or recourse.

As platforms grow, this model becomes:

* slower,
* more expensive,
* inconsistent,
* and increasingly distrusted.

Users respond by pricing in risk, reducing participation, or leaving altogether.

***

### Without Resolution, Escrow Loses Meaning

Escrow systems are designed to protect both sides of a transaction.\
But without a credible way to decide *who is right* in a dispute, escrow becomes a deadlock.

Funds remain locked.\
Decisions are delayed or politicized.\
The original promise of trustless coordination breaks down.

Dispute resolution is not an add-on to escrow.\
It is what makes escrow work.

***

### The Hidden Cost of Broken Trust

When trust breaks:

* platforms absorb growing support costs,
* honest users subsidize bad actors,
* markets become less efficient,
* innovation slows down.

At scale, the absence of fair dispute resolution forces systems to choose between speed and fairness—often sacrificing both.

***

### Slice’s Perspective

Slice is built on a simple idea:\
**trust emerges when outcomes are predictable, fair, and verifiable.**

By providing a neutral, transparent, and fast dispute resolution layer, Slice allows digital systems to:

* handle conflict without central authority,
* scale transactions without increasing friction,
* and restore confidence where it matters most—at the moment of disagreement.

Trust doesn’t break because people disagree.\
It breaks when there is no reliable way to resolve that disagreement.


# AI optimized docs

Slice documentation isn’t just written for humans. It’s **structured for agents, copilots, and AI models** to understand, remix, and build on top of.

***

Every page in our documentation is written for both:

* **Humans** who want clarity, precision, and examples.
* **Machines** that need structure, consistency, and semantics.

***

**Why It Matters**

The next generation of builders won’t just code — they’ll **prompt**. Trustless Work is optimized for that. Our docs follow an **AI-ready format**, meaning you can:

* Export any page in **Markdown or PDF** for training datasets.
* Feed it directly into your **custom copilot or LLM memory**.
* Let your AI agents read the docs, **reason through flows**, and even **execute API calls** using your keys and roles.

> 🧠 Our goal: make the documentation itself a building block for automation.

**Export & Train**

You can export any section of this documentation into:

\
![](https://3087223977-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNlxajGMNBNXRjUMqkLMF%2Fuploads%2FzSkEc7fRv7ejBv9o78VE%2Fimage.png?alt=media\&token=88525f65-f0c4-4e8c-834c-b8b998fce8c0)

* \
  **PDF** – for reference and onboarding manuals
* **Markdown (.md)** – for AI ingestion or context injection
* **Prompt blocks** – pre-formatted snippets that can be pasted into GPT, Cursor, or v0.dev

> 💡 Use the SDK subpage under VibeCoding to see live examples of AI prompts generating, debugging, and deploying escrow flows automatically.

***

**Ask the Docs**

The docs themselves are **AI-trained and search-optimized**. That means the search bar understands **natural language and intent** — not just keywords.

Try prompts like:

```
create a dispute flow for a peer-to-peer USDC payment
explain how jurors are selected in a Slice dispute
open a dispute for a wallet payment and submit evidence
```

> The system will reformat your question into a structured query, returning optimized snippets, SDK calls, or workflow examples.


# Live Demo: Juror Experience

This page walks through a real dispute resolved on Slice, using the mobile app and real wallets. The goal is simple: show how dispute resolution works in practice, from a juror’s point of view.

### This is a real dispute resolved on Slice, step by step, from a juror’s perspective

{% embed url="<https://www.youtube.com/watch?v=2IuphbBqYQ4>" %}

{% hint style="info" %}
The demo was recorded on mainnet.\
To keep it safe and accessible, the amounts used are small, but the mechanics are exactly the same as in real-world disputes.
{% endhint %}

#### **The dispute**

The dispute shown in the video is **Dispute #9**, titled:

**“Freelance Work Not Paid”**

Two parties are involved:

* **Julio Banegas** (claimant), who states that freelance work was completed but not paid.
* **Micaela Descotte** (defendant), who disputes the claim.

Both sides submitted evidence directly through Slice.\
As a juror, you see the same information any independent reviewer would see: descriptions, attachments, and context.

***

#### **Jurors joining the dispute**

In this demo, the same person participates as a juror using **three different wallets**, each one connected through a separate MetaMask account.

This is done only for demonstration purposes, to clearly show how majority and minority outcomes work.

For each wallet:

1. The juror opts in to the dispute.
2. A small amount of USDC is staked to participate.
3. The dispute appears in the juror’s **current portfolio**, indicating active participation.

At this stage, the juror has skin in the game.

***

#### **Voting phase**

Each wallet votes independently, based only on the evidence presented.

* Wallet #1 votes in favor of **Julio Banegas**
* Wallet #2 votes in favor of **Micaela Descotte**
* Wallet #3 also votes in favor of **Micaela Descotte**

There is no coordination between wallets.\
Each vote is a standalone decision.

After voting, the dispute moves to the juror’s **Inbox**, labeled **“Reveal now”**, indicating that the commit phase has ended and the votes can be revealed.

***

#### **Reveal and outcome**

Once all votes are revealed:

* The system determines the majority decision.
* Jurors who voted with the majority are marked as **winning jurors**.
* Jurors who voted against the majority are marked as **losing jurors**.

In this case:

* The two wallets that voted for **Micaela Descotte** are in the majority.
* The wallet that voted for **Julio Banegas** is in the minority.

***

#### **Rewards and penalties**

After the dispute is resolved:

* Winning jurors receive a **“Rewards pending”** notification.
* They can claim their rewards directly from the app.
* The juror in the minority does not receive a reward.

This mechanism is intentional.

Slice does not reward being loud or early —\
it rewards being **right, relative to the collective judgment**.

***

#### **Why this matters**

This demo highlights the core principles behind Slice:

* Jurors are real participants, not automated rules.
* Decisions are driven by evidence, not authority.
* Economic incentives align behavior without requiring trust.
* Outcomes are enforced automatically.

For platforms, this means disputes can be resolved without internal arbitration.\
For users, it means fairness is not just promised — it is enforced by design.


# What is Slice?

Slice is a **decentralized, on-demand dispute resolution system**, designed for digital platforms that process user-to-user payments and need a fast, impartial, and transparent way to resolve conflicts.

Unlike traditional systems—slow, manual, and centralized—Slice enables disputes to be resolved in **hours**, and often in minutes when jurors are highly available, through distributed jurors, clear economic incentives, and automatic execution of outcomes.

Slice functions as a **universal trust module** that can be integrated into fintechs, marketplaces, wallets, exchanges, service platforms, and Web3 applications, without forcing these platforms to act as judge and jury.

***

### A new way to resolve digital disputes

In Slice, every dispute follows a simple and predictable flow:

1. **One party initiates a dispute** and locks the disputed funds.
2. **A group of impartial jurors is selected** randomly.
3. **Jurors review the evidence and vote** within a short time window.
4. **The verdict is executed automatically**, releasing the funds according to the final decision.

The entire process is designed to minimize friction, remove intermediaries, and provide a clear experience for both end users and platforms.

***

### Real-time resolution, not endless processes

Slice introduces a **real-time resolution model**:

* Disputes are designed to resolve in hours, and can resolve in minutes when jurors respond quickly.
* Time windows are intentionally conservative safety buffers to protect liveness under lower activity.
* Resolution timing becomes more predictable as juror liquidity deepens in each court/category.
* Appeals are central to the protocol design and are one of the most urgent roadmap priorities.

This approach makes Slice viable even for **microtransactions**, where legal systems or traditional customer support processes are economically unfeasible.

***

### Distributed jurors and aligned incentives

Decisions in Slice do not depend on a company, moderator, or centralized authority.

Jurors:

* Are selected randomly from an open pool.
* Participate by staking stablecoins (USDC).
* Earn rewards for voting coherently with consensus.
* Build reputation over time.

This design incentivizes honest behavior and reduces malicious actions, without requiring prior trust between the parties.

***

### Designed for real users

Slice is not built only for blockchain experts.

The system prioritizes:

* **Simple, understandable UX**
* Fast onboarding with minimal crypto friction
* Clear interfaces for submitting evidence and understanding verdicts
* **Light gamification elements** that make the juror experience intuitive

The goal is for any user of a digital platform to use Slice without needing to understand smart contracts.

***

### A protocol, not a closed platform

Slice does not compete with existing platforms—it **empowers them**.

It acts as a neutral dispute resolution layer that can:

* Be integrated via SDKs or APIs
* Resolve conflicts tied to on-chain payments
* Execute decisions programmatically
* Maintain public traceability and transparency

In this way, Slice positions itself as core infrastructure for the digital economy, where trust is enforced by clear, verifiable rules rather than intermediaries.

***

### In summary

Slice is a lightweight digital justice system that resolves disputes in a way that is:

* ⚡ Fast (typically hours, sometimes minutes)
* ⚖️ Impartial (distributed jurors)
* 🔍 Transparent (verifiable rules and execution)
* 🌍 Global (built for digital payments and stablecoins)

It represents a new approach to resolving conflicts on the internet—aligned with the speed and scale of the modern digital economy.

> **While Slice is primarily designed for real-time dispute resolution, its incentive and coordination model can be extended to other forms of subjective evaluation—such as contribution assessment and reward allocation in open-source and digital ecosystems.**


# Why Slice?

**Digital economies move fast, but dispute resolution hasn’t kept up.**

Most platforms today rely on centralized, opaque, and expensive processes to resolve conflicts. This creates friction, erodes trust, and doesn’t scale — especially for low and mid-value disputes where traditional legal systems are impractical.

**Slice exists to fix that.**

### A neutral layer for digital disputes

Slice is designed as a **neutral, programmable dispute resolution layer** that can be embedded into any digital platform where value is exchanged.

Instead of acting as judge and jury, platforms can delegate dispute resolution to an independent system that is:

* transparent,
* auditable,
* fast,
* and economically aligned through incentives.

### Built for stablecoins and real-world payments

Slice is optimized for **stablecoin-based economies**, where users expect:

* predictable outcomes,
* fast resolutions,
* and minimal volatility.

By using assets like USDC, Slice enables dispute resolution that feels familiar to users while remaining fully on-chain and automated.

### Human judgment, cryptographic guarantees

Not all disputes can be solved by code alone.

Slice introduces **human judgment where it matters**, but enforces outcomes with smart contracts. Jurors are economically incentivized to act honestly, and rulings are executed automatically—without intermediaries.

This creates a system that combines:

* game theory,
* cryptographic enforcement,
* and social consensus.

### Infrastructure, not a vertical product

Slice is not built for a single use case.

It is **infrastructure**:

* reusable across industries,
* adaptable to different rulesets,
* and composable with existing systems.

Marketplaces, fintechs, Web3 protocols, insurance platforms, and OSS ecosystems can all plug into the same dispute resolution core.

### Designed to scale beyond disputes

While disputes are the starting point, Slice’s core primitives—staking, voting, quality evaluation, and incentive alignment—can power other coordination problems, from governance to contribution assessment.

Slice is about trust at scale.


# Security & Game Theory

Slice is secure not because it trusts people, but because it **aligns incentives**.

Instead of relying on centralized authorities, internal support teams, or subjective moderation, Slice uses **game theory** to make honest behavior the most economically rational strategy for all participants.

This is the same principle that powers:

* financial markets,
* prediction markets like Polymarket,
* decentralized arbitration systems like Kleros.

In all these systems, **truth emerges not from goodwill, but from incentives**.

***

### Trust doesn’t scale. Incentives do.

Traditional dispute resolution systems rely on trust:

* trust in companies,
* trust in moderators,
* trust in internal processes.

This model breaks down at scale.

As platforms grow:

* disputes increase,
* operational costs explode,
* decisions become inconsistent,
* users lose trust.

Slice replaces trust in institutions with **trust in economic incentives**.

***

### How Slice uses game theory

Slice is designed so that **dishonest behavior is economically irrational**.

Jurors are not expected to be altruistic.\
They are expected to be rational.

The system rewards jurors who vote coherently with reality and penalizes those who don’t.

#### The core mechanism

1. A dispute is opened.
2. Jurors are randomly selected from a large pool.
3. Each juror stakes value (e.g. USDC) to participate.
4. Jurors independently evaluate the evidence.
5. Jurors submit a vote.
6. The majority decision becomes the verdict.
7. Jurors who voted with the majority are rewarded.
8. Jurors who voted against the majority lose part of their stake.

The result is simple:

> **The most profitable strategy is to vote honestly.**

***

### Why jurors don’t vote randomly or maliciously

From an economic perspective:

* Voting randomly → expected loss.
* Voting maliciously → expected loss.
* Trying to manipulate outcomes → expensive and risky.
* Voting honestly → maximizes expected return.

Collusion is difficult because:

* juror selection is random,
* pools are large,
* coordination costs are high,
* the cost of manipulation often exceeds the dispute value.

At scale, **honesty becomes the dominant strategy**.

***

### Slice works like a market for truth

Slice follows the same logic used by prediction markets such as **Polymarket**.

Polymarket does not verify outcomes manually.\
It relies on participants risking capital on what they believe is correct.

Those who align with reality earn.\
Those who don’t, lose.

Over time, the system converges toward accurate outcomes because **being wrong is costly**.

Slice applies this logic to dispute resolution.

Instead of betting on future events, jurors stake value on:

* what is fair,
* what is correct,
* what best matches the evidence.

This turns dispute resolution into a **market-driven process for discovering truth**.

***

### Why this is safe for companies

From a company’s perspective, Slice provides strong security guarantees:

#### Incentive-aligned decisions

No internal bias. No “judge and party” problem.\
Jurors are economically motivated to decide fairly.

#### Predictable outcomes

Jurors behave rationally under clear incentives, producing consistent results over time.

#### Economic attack resistance

Manipulating outcomes is costly and irrational unless the attacker is willing to lose more than they gain.

#### Auditability and transparency

All decisions, votes, and outcomes are verifiable and traceable.

#### Operational scalability

Dispute resolution scales without growing internal support or arbitration teams.

***

### What Slice does *not* promise

Slice does not claim to:

* eliminate disputes,
* guarantee perfect decisions,
* remove all bad actors.

Instead, Slice guarantees that:

* dishonest behavior is penalized,
* honest behavior is rewarded,
* and the system converges toward fair outcomes over time.

This is the same guarantee provided by markets, insurance systems, and decentralized arbitration.

***

### The key idea

> **Slice is secure for the same reason markets are reliable: incentives beat trust.**

By aligning economic incentives with honest decision-making, Slice enables fast, scalable, and fair dispute resolution — without relying on centralized authority.

***

### Why this matters

As digital platforms scale globally, disputes become inevitable.

Slice doesn’t try to prevent conflict.\
It ensures that conflict **doesn’t break the system**.

By embedding game-theoretic security at the core, Slice becomes a reliable foundation for payments, platforms, governance, and coordination in the digital economy.


# Security Model

Slice is designed as a **cryptoeconomic dispute resolution protocol**, where security emerges from incentive alignment, economic cost, and transparent execution — not from authority or legal enforcement.

This section describes the **security assumptions, guarantees, and limits** of the protocol.

***

### Security Philosophy

Slice does not attempt to determine absolute truth or legal correctness.

Instead, it is designed to ensure that:

* dishonest behavior is economically costly,
* coordinated manipulation is difficult and expensive,
* and honest participation is the most rational strategy over time.

Security in Slice is achieved through **game theory, staking mechanics, and protocol-enforced execution**, not through trust in any centralized actor.

***

### Threats Slice Is Designed to Mitigate

Slice is explicitly designed to mitigate the following classes of attacks:

#### Sybil Attacks

Mitigated through:

* economic staking requirements,
* proof-of-humanity and identity primitives (where enabled),
* and cost proportional to participation.

Creating many identities does not grant proportional influence, only proportional risk.

***

#### Vote Manipulation and Collusion

Mitigated through:

* random juror selection,
* commit–reveal voting,
* incoherent vote slashing,
* and tier-based security escalation.

Collusion requires sustained coordination across multiple rounds and jurors, increasing economic exposure.

***

#### Bribery and Coercion

Mitigated through:

* juror anonymity,
* delayed vote revelation,
* and lack of pre-commitment visibility.

Bribery becomes unreliable because outcomes cannot be verified before execution.

***

#### Low-Quality or Random Voting

Mitigated through:

* loss of stake for incoherent votes,
* rewards only for alignment with final outcomes,
* and long-term negative expectancy for careless behavior.

Jurors who do not evaluate evidence are economically penalized over time.

***

### Incentive Alignment as the Primary Defense

Slice’s primary security mechanism is **incentive alignment**, not identity or reputation alone.

Key properties:

* Jurors are economically exposed to the quality of their decisions.
* Economic exposure scales risk and reward.
* Rewards are only distributed to jurors who align with the final outcome.

This structure discourages whales, favors independent judgment, and aligns rational behavior with protocol integrity.

***

### Tier-Based Security Escalation

Slice supports multiple security levels to match guarantees with dispute risk.

Higher security levels provide:

* broader juror participation,
* higher total economic exposure,
* and increased resistance to manipulation.

This allows users and integrators to choose a security level proportional to the value and complexity of the dispute.

***

### Appeals as a Security Amplifier

Appeals are a **core security layer** in the Slice design, increasing the cost of incorrect or adversarial outcomes.

In the live contracts today, disputes finalize in a single round once executed.
Appeals are one of the most urgent roadmap priorities and are designed to be introduced as structured escalation rounds.

Planned appeal rounds:

* increases juror count and economic exposure,
* re-evaluates the dispute under stricter conditions,
* and incentivizes early honest voting.

Appeals are designed to converge outcomes toward coherent judgments without granting unilateral power to any party.

***

### Limits of the System

Slice makes the following guarantees:

* outcomes are enforced exactly as defined,
* rules are transparent and immutable,
* execution is on-chain and verifiable.

Slice does **not** guarantee:

* legal correctness,
* absolute truth,
* or immunity from all forms of coordination under extreme conditions.

Human judgment is inherently probabilistic. Slice guarantees that **dishonesty is costly**, not impossible.

***

### Progressive Security

Security in Slice increases through:

* higher security levels,
* appeals,
* identity primitives,
* and protocol adoption scale.

The protocol is designed to remain secure under realistic conditions and to strengthen as participation grows.


# Use Cases

Slice is designed as a **reusable dispute resolution infrastructure**, adaptable to multiple industries where digital payments exist and low-to-medium value conflicts are frequent.

Instead of building custom dispute logic for every product or protocol, Slice provides a **neutral, fast, and programmable layer** that can be embedded wherever trust breaks down.

Below is a high-level overview of the main use cases.\
Each one is explored in depth in its own section.

***

### 1. Marketplaces (E-commerce, P2P, Services)

Marketplaces constantly deal with disputes between buyers and sellers over delivery, quality, or terms.\
Slice enables platforms to resolve these conflicts quickly and transparently without acting as judge and party.

**Core value:** faster resolutions, lower support costs, increased trust between participants.

***

### 2. Freelancer and Contractor Platforms

Disputes over scope, quality, and payments are common in freelance work, especially for small or medium amounts.\
Slice allows these conflicts to be resolved fairly in hours, and often in minutes under strong juror liquidity, without legal friction or centralized arbitration.

**Core value:** reduced friction, faster payouts, higher user retention.

***

### 3. Fintechs, Wallets, and Payment Platforms

Payment platforms face frequent disputes related to chargebacks, incorrect transfers, or peer-to-peer disagreements.\
Slice acts as a neutral dispute layer on top of payment flows, with verifiable and auditable outcomes.

**Core value:** fewer chargebacks, reduced fraud, stronger perception of fairness.

***

### 4. Web3 Platforms and On-chain Protocols

Even in decentralized systems, human disagreements still exist.\
Slice provides a human arbitration fallback that can trigger on-chain logic when smart contracts alone are not enough.

**Core value:** increased social security for protocols and better UX for non-technical users.

***

### 5. Micro-insurance and Micro-claims

Traditional insurance systems cannot profitably handle small claims.\
Slice makes real-time, low-cost evaluation possible through distributed juries and automated execution.

**Core value:** viable micro-insurance models with transparent outcomes.

***

### 6. Content Moderation and Platform Disputes

Centralized moderation often leads to distrust and backlash.\
Slice enables distributed, rule-based evaluation of moderation decisions with social legitimacy.

**Core value:** verifiable moderation and reduced perception of censorship.

***

### 7. Code Quality Evaluation and OSS Reward Distribution

Measuring the real value of code contributions is hard, and traditional metrics fail.\
Slice enables collective evaluation of code quality and impact, aligning rewards, merges, and funding with real contribution value.

**Core value:** merit-based rewards, better incentive alignment, healthier OSS ecosystems.

***

### 8. Governance and Collective Decision-Making

Governance systems often fail when rules are ambiguous, execution is contested, or outcomes are socially disputed.

Slice acts as a **post-vote and edge-case resolution layer** for DAOs, protocols, and digital communities, providing structured human judgment with enforceable outcomes.

**Core value:** legitimate, scalable governance without central authorities.

***

### Summary

Slice can be integrated into any system where:

* digital payments exist,
* low or mid-value disputes are common,
* speed, fairness, and trust are critical.

Slice is not a vertical product.\
It is **dispute resolution infrastructure for the digital economy**, extensible beyond disputes into broader coordination and quality assessment problems.


# Marketplaces (E-commerce, P2P, Services)

{% hint style="success" %}
Status: Live (Public Adversarial Dispute)
{% endhint %}

The real problem (not a theoretical one)

In any marketplace where buyers and sellers **don’t know each other**, disputes are **not an edge case** — they are a normal part of the system.

Common, real-world examples:

* A buyer says *“the product never arrived”*
* The seller replies *“it was delivered, here’s the tracking”*
* A customer pays for a service (design, repair, delivery) and claims it **doesn’t meet the agreement**
* The provider claims they **did deliver as agreed** and the buyer is requesting an unfair refund
* A product arrives but:
  * it doesn’t match the description,
  * it’s damaged,
  * or it arrives later than promised

These situations happen **every day**, even on large marketplaces.

***

#### How disputes are handled today (and why this doesn’t scale)

Most marketplaces resolve disputes in roughly the same way:

1. Funds are held by the platform.
2. The user opens a support ticket.
3. A support agent:
   * reads messages,
   * reviews screenshots,
   * interprets internal rules.
4. The platform makes a decision and releases the funds.

This approach creates several structural problems:

* ❌ **The platform acts as judge and party**\
  It decides over funds it doesn’t own, while its own reputation is at stake.
* ❌ **High operational costs**\
  Every dispute requires human time and review.
* ❌ **Opaque decisions**\
  Users don’t clearly understand why a decision was made.
* ❌ **Poor scalability**\
  More users → more disputes → more support → higher costs.

As a result, many marketplaces:

* limit refunds,
* systematically favor one side,
* or simply ban users.

This **breaks trust**.

***

#### The key insight: escrow without arbitration doesn’t work

Many marketplaces rely on an **escrow model**:

* the buyer pays,
* funds are locked,
* funds are released if everything goes well.

But when a conflict arises, a critical question appears:

> Who decides who is right?

Without a clear answer:

* funds remain stuck,
* decisions become arbitrary,
* escrow loses its purpose.

👉 **Arbitration is what makes escrow work.**

This is exactly the insight Kleros addressed — and what Slice applies in a more modern, fast, and UX-friendly way.

***

#### How Slice solves this for marketplaces

Slice integrates as an **external dispute resolution layer**.

A simple flow:

1. The buyer pays → funds are locked in escrow.
2. The transaction proceeds normally.
3. If a conflict arises:
   * either party can open a dispute via Slice.
4. Evidence is submitted:
   * product description,
   * messages,
   * receipts,
   * deliverables.
5. A group of **independent jurors** evaluates the case.
6. Jurors vote based on clear rules.
7. The final ruling:
   * releases funds to the buyer **or**
   * releases funds to the seller.

All of this happens:

* without the platform making the decision,
* without internal human support,
* with transparent, verifiable rules.

***

#### A concrete (very realistic) example

**Design services marketplace**

* Price: 150 USDC
* The client claims: *“the design doesn’t meet the agreed scope”*
* The designer claims: *“I delivered exactly what was requested”*

With Slice:

* Both parties submit:
  * the original brief,
  * the delivered design,
  * the conversation history.
* Jurors evaluate:
  * Was the brief respected?
  * Is the delivered quality reasonable?
* A vote is taken.
* Funds are released automatically according to the ruling.

The platform **does not intervene**.

***

#### Clear benefits for the marketplace

**For the platform**

* Lower support costs.
* Reduced legal exposure.
* Auditable, consistent decisions.
* Scalability without added friction.

**For buyers**

* Confidence to pay upfront.
* Real protection in disputes.

**For sellers**

* Protection against abusive claims.
* Clear rules from the start.

***

#### Why this matters (strategic importance)

Without fair dispute resolution:

* users lose trust,
* prices increase to cover risk,
* or users leave the platform.

With Slice:

* conflict stops being an existential threat,
* and becomes a normal, solvable part of the system.

***

*Most marketplace disputes are typically resolved using **Tier 1 or Tier 2**, depending on transaction value and platform risk tolerance.*

→See how disputes are categorized in [dispute-tiers](https://docs.slicehub.xyz/how-it-works/what-is-a-tier/dispute-tiers "mention")


# Freelancer and Contractor Platforms

{% hint style="success" %}
Status: Live (Public Adversarial Dispute)
{% endhint %}

#### The real problem (not a theoretical one)

On freelancer and contractor platforms, disputes are **not rare edge cases** — they are a built-in consequence of how digital work operates.

Real, everyday situations include:

* A client claims *“the work doesn’t match the original scope”*
* A contractor responds *“the scope changed during the project”*
* A client withholds payment arguing **poor quality**
* A freelancer claims the work was delivered and approved
* Deliverables are submitted, but expectations were never clearly documented

These conflicts happen **constantly**, especially in remote, asynchronous work environments.

***

#### How disputes are handled today (and why this doesn’t scale)

Most freelancer platforms resolve disputes through centralized mediation:

1. The platform holds the payment.
2. A dispute is opened through support.
3. A platform agent:
   * reviews messages and files,
   * interprets terms of service,
   * makes a subjective decision.
4. Funds are released based on that decision.

This model creates structural issues:

* ❌ **The platform acts as judge and party**\
  It decides over user funds while protecting its own interests.
* ❌ **High operational overhead**\
  Each dispute requires manual review by trained staff.
* ❌ **Subjective and inconsistent rulings**\
  Similar cases can result in different outcomes.
* ❌ **Slow resolution times**\
  Disputes can take days or weeks to resolve.

As a result:

* freelancers feel unprotected,
* clients feel decisions are arbitrary,
* trust in the platform erodes.

***

#### The key insight: escrow alone doesn’t resolve human disagreement

Freelancer platforms often rely on **payment escrow**:

* clients pay upfront,
* funds are locked,
* funds are released upon completion.

But when there’s a disagreement, escrow alone isn’t enough.

The critical question becomes:

> Was the work actually delivered as agreed?

Without a clear, fair way to answer this:

* payments get stuck,
* decisions feel arbitrary,
* disputes escalate emotionally.

👉 **Human judgment is unavoidable in creative and knowledge work.**\
Slice provides a structured way to apply it.

***

#### How Slice resolves disputes for freelancer platforms

Slice integrates as a **neutral, external arbitration layer**.

A typical flow:

1. The client funds the escrow.
2. Work is delivered.
3. A dispute is opened if there’s disagreement.
4. Both parties submit evidence:
   * original brief or contract,
   * deliverables,
   * communication history.
5. **Independent jurors** review the case.
6. Jurors vote based on predefined rules.
7. Funds are released automatically according to the ruling.

The platform:

* does not decide the outcome,
* does not mediate manually,
* does not bear subjective responsibility.

***

#### A concrete (very realistic) example

**Freelance development contract**

* Payment: 800 USDC
* Client claims: *“the feature doesn’t meet requirements”*
* Developer claims: *“the requirements changed after delivery”*

With Slice:

* Both submit:
  * the original specification,
  * the delivered code,
  * Git commits and messages.
* Jurors evaluate:
  * Was the scope clearly defined?
  * Does the delivery meet the original agreement?
* A vote is taken.
* Funds are distributed automatically based on the verdict.

No platform intervention is required.

***

#### Clear benefits for freelancer platforms

**For the platform**

* Reduced support and mediation costs.
* Fewer escalations and legal risks.
* Transparent, auditable decisions.
* Better scalability as the platform grows.

**For clients**

* Confidence to fund work upfront.
* Fair evaluation of deliverables.

**For freelancers**

* Protection against unfair non-payment.
* Clear, predictable dispute outcomes.

***

#### Why this matters

Without fair dispute resolution:

* high-quality freelancers leave,
* clients hesitate to prepay,
* the platform’s reputation suffers.

With Slice:

* disputes stop being platform-breaking events,
* and become a manageable, trust-preserving process.

***

*Disputes between freelancers and clients are commonly handled through **Tier 2 or Tier 3**, balancing cost efficiency with stronger economic guarantees.*

→See how disputes are categorized in [dispute-tiers](https://docs.slicehub.xyz/how-it-works/what-is-a-tier/dispute-tiers "mention")


# Fintechs, Wallets, and Payment Platforms

{% hint style="success" %}
Status: Live (Public Adversarial Dispute)
{% endhint %}

#### The real problem (not a theoretical one)

Fintech and payment platforms handle **millions of transactions between users who don’t know each other**.\
Disputes are not edge cases — they are an inevitable byproduct of digital payments.

Common real-world scenarios include:

* A user claims *“I sent the payment, but the service was never delivered”*
* A merchant claims *“the payment was received and the service was provided”*
* A peer-to-peer transfer is marked as incorrect or unintended
* A user disputes a charge after receiving a product or service
* Cross-border payments generate misunderstandings due to timing, FX, or settlement differences

These issues occur **daily**, especially at scale.

***

#### How disputes are handled today (and why this doesn’t scale)

Most fintechs and wallets rely on **centralized dispute handling**:

1. The platform freezes the transaction.
2. A dispute or chargeback process is initiated.
3. Internal teams:
   * review transaction logs,
   * analyze user communications,
   * apply internal policies.
4. The platform decides whether to reverse or settle the payment.

This approach introduces structural problems:

* ❌ **The platform is judge and party**\
  It controls the funds and the outcome.
* ❌ **High operational and compliance costs**\
  Each dispute requires manual review and regulatory oversight.
* ❌ **Slow resolution times**\
  Chargebacks and disputes can take days or weeks.
* ❌ **Limited transparency**\
  Users don’t understand how or why decisions are made.

As transaction volume grows, these processes become **increasingly expensive and fragile**.

***

#### The key insight: payments without neutral resolution erode trust

Payments are only truly final when users trust the system.

Without a fair dispute mechanism:

* users hesitate to send money,
* merchants face uncertainty,
* platforms absorb reputational and financial risk.

Traditional chargeback systems:

* are slow,
* favor certain parties,
* and don’t work well for instant or cross-border payments.

👉 **Fast payments require equally fast and fair dispute resolution.**

***

#### How Slice fits into fintech and payment flows

Slice integrates as a **neutral dispute resolution layer on top of payment rails**.

A typical flow:

1. A payment is executed and optionally held in escrow.
2. A dispute is opened if one party challenges the transaction.
3. Both sides submit evidence:
   * transaction details,
   * service confirmation,
   * messages or receipts.
4. **Independent jurors** evaluate the case.
5. A ruling is reached based on predefined criteria.
6. Funds are released, refunded, or reassigned automatically.

Slice operates:

* independently from the platform,
* transparently and on-chain,
* without replacing existing payment infrastructure.

***

#### A concrete (very realistic) example

**Peer-to-peer payment dispute**

* Amount: 200 USDC
* Sender claims: *“I paid for a service that was never delivered”*
* Receiver claims: *“The service was provided as agreed”*

With Slice:

* Both parties submit:
  * payment proof,
  * conversation history,
  * any service confirmation.
* Jurors assess:
  * Was the payment conditional?
  * Was the service delivered?
* A vote is taken.
* Funds are reassigned automatically according to the ruling.

The wallet or fintech platform **does not intervene directly**.

***

#### Clear benefits for fintechs and wallets

**For the platform**

* Lower dispute handling and chargeback costs.
* Reduced regulatory and reputational risk.
* Transparent, auditable dispute outcomes.
* Better scalability as transaction volume grows.

**For users**

* Increased confidence when sending payments.
* Fair handling of payment conflicts.

**For merchants and recipients**

* Protection against abusive chargebacks.
* Predictable, rule-based outcomes.

***

#### Why this matters

Without effective dispute resolution:

* instant payments feel risky,
* user trust declines,
* platforms become bottlenecks.

With Slice:

* disputes become structured and manageable,
* trust scales with transaction volume,
* payment systems remain fast without sacrificing fairness.

***

*Payment-related disputes are usually resolved using **Tier 1 or Tier 2**, prioritizing speed and predictable resolution times.*

→See how disputes are categorized in [dispute-tiers](https://docs.slicehub.xyz/how-it-works/what-is-a-tier/dispute-tiers "mention")


# Web3 Platforms and On-chain Protocols

{% hint style="success" %}
Status: Live (Public Adversarial Dispute)
{% endhint %}

#### The real problem in Web3 (beyond ideology)

Web3 systems are designed to be **trustless**, but real-world interactions are not.

On-chain protocols increasingly handle:

* peer-to-peer payments,
* tokenized assets,
* services exchanged for crypto,
* DAO governance actions,
* cross-protocol interactions.

Wherever **value exchange meets human behavior**, disputes inevitably arise.

***

#### Common dispute scenarios in Web3

These are not hypothetical edge cases — they happen daily:

* A DAO member claims funds were misused.
* A service provider receives payment but is accused of not delivering.
* An NFT is sold with disputed attributes or usage rights.
* An escrow contract releases funds incorrectly.
* A protocol upgrade or governance action is challenged.
* A cross-chain or DeFi interaction behaves unexpectedly.

Smart contracts execute perfectly — **but they cannot interpret context**.

***

#### The current workaround: “off-chain judgment”

Most Web3 protocols resolve disputes through:

* Discord discussions
* DAO forum debates
* Multisig discretion
* Core team intervention
* Emergency admin keys
* Social consensus

This creates contradictions:

* ❌ Protocols claim decentralization but rely on trusted actors.
* ❌ Decisions are opaque and socially enforced.
* ❌ Outcomes depend on influence, not rules.
* ❌ Legal and reputational risks accumulate off-chain.

In practice, many “trustless” systems **re-introduce trust through the back door**.

***

#### The key insight: trustless execution needs neutral judgment

Smart contracts are excellent at:

* enforcing rules,
* moving assets,
* executing deterministic logic.

They are **bad at resolving ambiguity**.

Dispute resolution is the missing primitive:

* not for every transaction,
* but for the moments when rules alone are insufficient.

👉 **Without a native dispute layer, decentralization breaks under pressure.**

***

#### How Slice integrates with Web3 protocols

Slice functions as a **protocol-agnostic dispute resolution layer**.

It can be plugged into:

* DAOs,
* DeFi protocols,
* NFT marketplaces,
* on-chain escrow systems,
* cross-protocol workflows.

A typical on-chain flow:

1. A smart contract flags a transaction or state as disputed.
2. The dispute is registered on Slice.
3. Parties submit evidence (on-chain + off-chain references).
4. Independent jurors are selected.
5. Jurors evaluate according to protocol-defined rules.
6. A ruling is returned on-chain.
7. The original contract executes the ruling automatically.

No admins. No emergency keys. No social enforcement.

***

#### Example: DAO treasury dispute

* A DAO allocates 50,000 USDC to a contributor.
* Community members dispute that milestones were not met.
* Funds are escrowed in a smart contract.
* Slice is triggered as the dispute resolver.

Jurors evaluate:

* agreed milestones,
* on-chain activity,
* submitted deliverables.

The ruling:

* releases funds,
* partially refunds,
* or returns them to the DAO treasury.

The DAO does not vote emotionally.\
The contract enforces the outcome.

***

#### Why this matters for Web3 protocols

**For protocol designers**

* Removes reliance on centralized governance interventions.
* Reduces attack surface (admin keys, multisigs).
* Enables cleaner, rule-based protocol design.

**For DAOs**

* Fair handling of internal conflicts.
* Less governance fatigue.
* Clear, enforceable outcomes.

**For users**

* Higher confidence interacting with on-chain systems.
* Protection in ambiguous situations.

***

#### Dispute resolution as a Web3 primitive

Just as:

* oracles connect blockchains to reality,
* bridges connect chains to chains,

👉 **dispute resolution connects code to human context.**

Protocols without it:

* work until something goes wrong.

Protocols with it:

* can safely scale real economic activity.

***

#### The takeaway

Web3 doesn’t fail because smart contracts are weak.\
It fails when **human disputes have nowhere to go**.

Slice provides:

* neutral judgment,
* on-chain enforceability,
* protocol-level trust.

***

*Protocol-level disputes often leverage **Tier 2 or Tier 3**, depending on the value locked and the social impact of the decision.*

→See how disputes are categorized in [dispute-tiers](https://docs.slicehub.xyz/how-it-works/what-is-a-tier/dispute-tiers "mention")


# Micro-insurance and Micro-claims

{% hint style="info" %}
Status: Planned (*Enabled through adversarial disputes with predefined rulesets*)
{% endhint %}

#### The core problem with micro-insurance

Micro-insurance is designed to cover:

* small financial losses,
* short-term risks,
* high-frequency events,
* users with limited access to traditional insurance.

But there’s a paradox:

> The smaller the claim, the harder it is to resolve fairly.

Why?

* Traditional claim reviews are expensive.
* Human adjusters don’t scale for $20–$300 claims.
* Automation alone can’t handle edge cases.
* Users feel ignored or unfairly rejected.

As a result, many micro-insurance systems either:

* auto-approve everything (risking abuse), or
* auto-reject everything unclear (destroying trust).

***

#### Real-world micro-claim scenarios

These cases happen every day:

* Flight delay insurance with disputed delay times.
* Delivery insurance for lost or damaged packages.
* Weather-based insurance with unclear local impact.
* Device insurance with ambiguous damage causes.
* Gig-economy insurance for short jobs or shifts.
* Parametric insurance where conditions partially trigger.

Each claim is small —\
but **the trust impact is huge**.

***

#### Why traditional insurance logic breaks down

For micro-claims:

* Manual review costs more than the payout.
* Centralized decisions feel opaque.
* Appeals are slow or non-existent.
* Users assume bias toward the insurer.

This creates a toxic loop:

* Low trust → high churn
* High churn → stricter automation
* Stricter automation → more rejected claims

***

#### The missing layer: scalable, neutral judgment

Micro-insurance doesn’t need **perfect accuracy**.\
It needs **fair, explainable decisions at low cost**.

Slice introduces a middle layer between:

* fully automated payouts, and
* expensive human adjusters.

A layer where:

* disputes are rare but resolvable,
* decisions are transparent,
* costs stay proportional to claim size.

***

#### How Slice fits into micro-insurance systems

Slice acts as an **on-demand dispute resolver**.

Typical flow:

1. A claim is submitted.
2. The system auto-processes it.
3. If the claim is disputed, it is escalated to Slice.
4. Evidence is submitted (photos, receipts, timestamps, sensor data).
5. Independent jurors review the case.
6. A ruling is issued.
7. The payout contract executes the decision automatically.

No claims agents.\
No back-and-forth emails.\
No black-box decisions.

***

#### Example: delivery micro-insurance

* A user insures a package for $50.
* The package arrives damaged.
* The insurer’s system flags the claim as “unclear”.

Instead of rejecting it:

* The dispute is sent to Slice.
* The user submits photos and delivery timestamps.
* Jurors evaluate whether the damage matches transit issues.
* The ruling:
  * approves full payout,
  * approves partial payout,
  * or rejects the claim with justification.

The result is enforced automatically.

***

#### Example: parametric weather insurance

* A farmer has micro-insurance for rainfall.
* Sensors report borderline data.
* The claim is disputed due to conflicting sources.

Slice allows:

* evidence from multiple oracles,
* local context evaluation,
* human interpretation where automation fails.

This avoids:

* blind oracle dependence,
* rigid yes/no logic.

***

#### Why this matters for insurers and protocols

**For insurers**

* Lower operational costs.
* Reduced fraud without blanket rejections.
* Higher user trust and retention.

**For users**

* A real chance to contest unfair outcomes.
* Transparent decisions.
* Faster resolutions.

**For on-chain insurance protocols**

* Removes reliance on admin intervention.
* Enforces rulings trustlessly.
* Keeps systems decentralized under stress.

***

#### Micro-claims need proportional justice

Big insurance can afford:

* lawyers,
* adjusters,
* long processes.

Micro-insurance can’t.

Slice enables:

* **low-cost justice for low-value claims**,
* without sacrificing fairness or decentralization.

***

#### The takeaway

Micro-insurance fails when disputes are ignored.\
It scales when disputes are **cheap, fair, and enforceable**.

Slice makes micro-claims:

* economically viable,
* socially fair,
* technically enforceable.

***

*Micro-claims are typically resolved using **Tier 1**, enabling fast and cost-effective evaluations that would be impractical in traditional insurance systems.*

→See how disputes are categorized in [dispute-tiers](https://docs.slicehub.xyz/how-it-works/what-is-a-tier/dispute-tiers "mention")


# Content Moderation and Platform Disputes

{% hint style="info" %}
Status: Planned (*Enabled through adversarial disputes with predefined rulesets*)
{% endhint %}

#### The real problem with content moderation

Any platform that allows users to publish content eventually faces disputes around moderation.

This includes:

* social networks,
* creator platforms,
* marketplaces with reviews,
* community forums,
* DAO governance platforms,
* collaborative knowledge bases.

And the problem is not *whether* disputes happen —\
it’s **who decides** and **how**.

***

#### Real-world moderation disputes

These situations are extremely common:

* A creator claims their content was unfairly removed.
* A user is banned for “policy violations” they don’t fully understand.
* A review is flagged as abusive, but the author says it’s legitimate.
* A post is reported as misinformation, but evidence is disputed.
* A DAO proposal is removed or censored due to governance conflicts.

Each case has:

* subjective interpretation,
* contextual nuance,
* reputational and economic impact.

***

#### Why centralized moderation breaks trust

Most platforms rely on:

* internal moderators,
* opaque guidelines,
* automated filters,
* or ad-hoc admin decisions.

This creates structural issues:

* ❌ **Platforms act as judge and executioner**
* ❌ **Decisions are opaque**
* ❌ **Appeals are limited or non-existent**
* ❌ **Bias accusations are inevitable**
* ❌ **Moderation does not scale fairly**

Even when moderation is well-intentioned, users often feel:

* censored,
* unheard,
* arbitrarily punished.

Over time, this erodes platform trust.

***

#### Automation alone is not enough

Automated moderation:

* is fast,
* is cheap,
* is necessary at scale.

But it fails in:

* edge cases,
* context-heavy disputes,
* nuanced human judgment.

Pure automation leads to:

* false positives,
* unjust bans,
* content chilling effects.

Pure human moderation:

* does not scale,
* is expensive,
* introduces bias.

Platforms need a **third layer**.

***

#### The missing layer: neutral, scalable adjudication

This is where Slice fits naturally.

Slice provides:

* independent dispute resolution,
* transparent decision-making,
* human judgment without centralized power,
* enforceable outcomes.

Not every moderation decision goes to Slice —\
only **contested or high-impact cases**.

***

#### How Slice integrates with moderation systems

Typical flow:

1. Content is flagged or moderated.
2. A user disputes the decision.
3. The case is escalated to Slice.
4. Evidence is submitted:
   * platform rules,
   * content context,
   * prior behavior,
   * moderation rationale.
5. Independent jurors evaluate the case.
6. A ruling is issued.
7. The platform enforces the outcome automatically.

The platform no longer acts as the final authority.

***

#### Example: creator platform dispute

* A video is removed for “policy violation”.
* The creator claims fair use and educational intent.
* The platform’s automated system rejects the appeal.

With Slice:

* the creator submits context and references,
* jurors evaluate intent, rules, and proportionality,
* the ruling determines:
  * content restoration,
  * partial restrictions,
  * or justified removal.

The decision is transparent and auditable.

***

#### Example: DAO or community moderation

* A proposal is removed for being “spam” or “off-topic”.
* The proposer disputes political or personal bias.

Slice enables:

* neutral evaluation by jurors,
* rule-based judgments,
* legitimacy without centralized censorship.

This is especially critical for:

* DAOs,
* open communities,
* governance-heavy platforms.

***

#### Benefits for platforms

**For the platform**

* Reduced moderation liability.
* Clear separation between rules and enforcement.
* Scalable handling of edge cases.
* Fewer accusations of censorship or favoritism.

**For users**

* Real appeal mechanisms.
* Transparent outcomes.
* Confidence that disputes are judged fairly.

***

#### Content moderation needs legitimacy, not just rules

Rules alone don’t create trust.\
**Legitimate enforcement does.**

Slice transforms moderation from:

* opaque authority → transparent process,
* centralized power → distributed judgment.

***

#### The takeaway

Content moderation fails when:

* users feel silenced,
* decisions feel arbitrary,
* appeals go nowhere.

Slice ensures that:

* moderation remains scalable,
* disputes remain resolvable,
* platforms remain trusted.

***

*Moderation-related disputes are commonly suited for **Tier 1 or Tier 2**, where rapid resolution and consistent enforcement are critical.*

→See how disputes are categorized in [dispute-tiers](https://docs.slicehub.xyz/how-it-works/what-is-a-tier/dispute-tiers "mention")


# Code Quality Evaluation and OSS Reward Distribution

{% hint style="info" %}
Status: Planned (*Rating-based disputes under design*)
{% endhint %}

#### The real problem in open-source ecosystems

Open-source projects depend on external contributors.\
But **evaluating contributions fairly** is one of the hardest unsolved problems in OSS.

Most platforms struggle to answer simple but critical questions:

* Was this pull request actually good?
* Did it improve the project long-term?
* How much should this contribution be rewarded?
* Should this code be merged, revised, or rejected?

At scale, these decisions become inconsistent, subjective, and conflict-prone.

***

#### Why current evaluation methods fail

**1. Quantitative metrics don’t measure quality**

Common signals like:

* lines of code,
* number of commits,
* issue count,
* activity frequency,

**do not reflect real value**.

A small, well-designed fix can be worth more than hundreds of lines of code.

***

**2. Maintainer-only evaluation does not scale**

Relying solely on maintainers:

* creates bottlenecks,
* introduces bias,
* burns out core teams,
* discourages contributors.

In many projects, maintainers become:

* judges,
* gatekeepers,
* and conflict managers.

This is unsustainable.

***

**3. Pure AI-based evaluation breaks in real-world codebases**

Some platforms experimented with AI-based PR evaluation.

A real example:

* Platforms like **OnlyDust** tested automated or AI-assisted evaluation of contributions.
* While useful for surface-level analysis, these systems failed when:
  * evaluating smart contracts,
  * judging protocol-level logic,
  * understanding security implications,
  * reviewing unfamiliar languages or paradigms.

AI models:

* misjudge intent,
* misunderstand context,
* fail at domain-specific reasoning,
* and confidently score incorrect or risky code.

This creates **false signals** and undermines trust.

***

#### Why human judgment is unavoidable

Code quality is not just correctness.

It includes:

* architectural fit,
* security assumptions,
* readability,
* long-term maintainability,
* alignment with project goals.

These dimensions require **human judgment**.

But centralized human judgment does not scale either.

***

#### The missing layer: decentralized, incentivized code evaluation

Slice introduces a new primitive:\
**distributed human evaluation with economic incentives**.

Instead of:

* one maintainer deciding,
* or a black-box AI scoring,

Slice uses:

* multiple independent reviewers,
* clear evaluation criteria,
* economic stakes to discourage bad judgments.

***

#### How Slice works for code evaluation

Typical flow:

1. A contributor submits a pull request.
2. The PR enters an evaluation phase.
3. Jurors stake stablecoins (e.g. USDC) to participate.
4. Jurors review:
   * code quality,
   * correctness,
   * security implications,
   * adherence to project standards.
5. Each juror assigns a quality score or verdict.
6. Scores are aggregated.
7. Outcomes are executed automatically:
   * merge,
   * request changes,
   * reject,
   * distribute rewards.

Poor or dishonest evaluations are economically penalized.

***

#### Example: smart contract contribution

**Scenario**

* A contributor submits a smart contract PR.
* The code compiles and passes tests.
* An AI reviewer gives it a high score.
* Maintainers feel unsure about edge cases and security assumptions.

With Slice:

* Jurors with relevant expertise review the contract.
* They evaluate:
  * attack surfaces,
  * economic exploits,
  * logic soundness.
* The PR receives a weighted quality score.
* Rewards and merge decisions reflect real risk and value.

This avoids:

* blind trust in automation,
* single-point human failure.

***

#### Example: OSS reward distribution

**Problem**

An OSS platform has a fixed monthly reward pool.\
Multiple contributors submit PRs of varying quality.

Without Slice:

* rewards are distributed arbitrarily,
* maintainers decide behind closed doors,
* contributors feel underpaid or ignored.

With Slice:

* each merged PR is scored by jurors,
* rewards scale with contribution quality,
* incentives align with long-term project health.

***

#### Why stablecoin staking matters

Using stablecoins (like USDC):

* removes token volatility,
* avoids speculation,
* keeps incentives neutral.

Jurors are rewarded for:

* accuracy,
* alignment with consensus,
* honest evaluation.

Not for hype or volume.

***

#### Benefits for OSS platforms

**For maintainers**

* Reduced evaluation burden.
* Less conflict with contributors.
* More consistent decisions.
* Better security outcomes.

**For contributors**

* Fair recognition of work.
* Transparent evaluation.
* Clear incentive alignment.

**For ecosystems**

* Higher code quality.
* Reduced gaming of metrics.
* Stronger long-term sustainability.

***

#### Beyond pull requests

The same mechanism applies to:

* issue prioritization,
* bug severity scoring,
* grant allocation,
* retroactive funding,
* roadmap impact evaluation.

Any process that requires **judging quality, not quantity**.

***

#### The takeaway

Open-source fails when:

* effort is rewarded instead of impact,
* evaluation is opaque,
* incentives are misaligned.

Slice transforms code evaluation into:

* a transparent process,
* backed by economic accountability,
* scalable across ecosystems.

***

*Code quality evaluation is expected to leverage **rating-based disputes** and may utilize **Tier 2 or higher** to ensure sufficient diversity of judgment.*

→See how disputes are categorized in [dispute-tiers](https://docs.slicehub.xyz/how-it-works/what-is-a-tier/dispute-tiers "mention")


# Governance and Collective Decision-Making

{% hint style="info" %}
Status: Planned (*Decision disputes with enforceable outcomes*)
{% endhint %}

Slice is not only useful when disputes arise over payments or services.\
It also applies when **collective decisions break down**.

Governance systems — whether in DAOs, protocols, platforms, or digital communities — are built on rules, votes, and incentives. But real-world governance is messy: not every situation can be resolved by a simple on-chain vote or predefined logic.

Slice acts as a **human arbitration and coordination layer** for governance systems when rules alone are not enough.

***

### The real problem with governance systems

Most governance frameworks assume that:

* rules are clear,
* proposals are well-defined,
* voters behave rationally,
* outcomes are final.

In practice, this often fails.

Common real-world governance issues include:

* Disputes over whether a proposal was implemented correctly
* Conflicts about ambiguous rules or edge cases
* Claims that a vote was manipulated, rushed, or unfair
* Disagreements after a decision has already passed
* Minority groups contesting outcomes they believe violate shared principles
* Grant allocations perceived as biased or low-quality
* Parameter changes that negatively affect part of the community

When these conflicts arise, governance systems usually have **no built-in way to resolve them**.

***

### How governance disputes are handled today (and why it fails)

Most projects fall back to one of these options:

1. **Core team decides manually**
   * Centralized, opaque, and legitimacy is questioned.
2. **Social consensus on Discord / forums**
   * Loud minorities dominate, outcomes are unclear, decisions drag on.
3. **Re-run votes**
   * Expensive, slow, and often doesn’t resolve the underlying disagreement.
4. **Ignore the dispute**
   * Leads to frustration, forks, or community erosion.

None of these approaches scale.\
None are neutral.\
None provide enforceable outcomes.

***

### Why voting alone is not enough

Voting answers the question:

> “What do the majority want?”

But it does **not** answer:

* “Was the proposal executed correctly?”
* “Does this decision violate previously agreed rules?”
* “Is this grant actually delivering value?”
* “Is this behavior aligned with the protocol’s intent?”

Governance systems need a **dispute resolution layer**, just like escrows need arbitration.

***

### How Slice fits into governance systems

Slice integrates as a **post-vote and edge-case resolution layer**.

It does not replace:

* DAO voting,
* governance frameworks,
* protocol rules.

It activates **when those systems fail to produce a clear or accepted outcome**.

#### High-level flow

1. A governance decision is made (vote, proposal, rule).
2. A dispute arises about:
   * interpretation,
   * execution,
   * fairness,
   * or impact.
3. A dispute is opened in Slice.
4. Evidence is submitted:
   * proposal text,
   * voting results,
   * implementation details,
   * prior rules or precedents.
5. Independent jurors evaluate the case.
6. A verdict is reached.
7. The outcome:
   * resolves the dispute socially,
   * and can optionally trigger on-chain actions.

***

### Concrete governance use cases

#### 1. DAO proposal execution disputes

**Example**

A DAO approves a proposal to fund a project.\
After execution, part of the community claims the implementation deviates from what was voted.

Slice allows jurors to evaluate:

* the original proposal,
* what was delivered,
* whether the execution matches intent.

The verdict determines whether funds are released, clawed back, or execution is considered valid.

***

#### 2. Grant allocation and evaluation

Many DAOs struggle with:

* subjective grant approvals,
* favoritism,
* low-quality outcomes.

With Slice:

* grant recipients can be evaluated post-delivery,
* jurors assess whether milestones were met,
* future funding or reputation adjusts based on verdicts.

This introduces **accountability without central committees**.

***

#### 3. Parameter changes and protocol disputes

Changes to fees, limits, or economic parameters often create winners and losers.

When disputes arise:

* Slice can be used to evaluate whether changes violate prior commitments,
* or whether emergency rollbacks are justified.

This reduces emotional governance fights and adds structured resolution.

***

#### 4. Community rule enforcement

Governance is not only about money.

Disputes may involve:

* code of conduct violations,
* moderation decisions,
* abuse of governance processes.

Slice provides:

* rule-based, auditable evaluation,
* legitimacy beyond “admin decisions”.

***

### Why Slice works for governance

* **Neutrality**\
  Jurors are external and economically incentivized to be fair.
* **Legitimacy**\
  Decisions are transparent and based on shared rules.
* **Enforceability**\
  Outcomes can trigger on-chain logic or funding decisions.
* **Scalability**\
  No need for governance councils or endless debates.
* **Human judgment where it matters**\
  Without breaking decentralization.

***

### The bigger picture

Governance systems fail not because rules are bad,\
but because **rules cannot anticipate every situation**.

Slice provides the missing layer:

> A structured way for humans to resolve disagreements\
> without central authority\
> and with real consequences.

This makes governance systems **resilient**, not just decentralized.

***

*Governance disputes may rely on **Tier 3 or Tier 4** to provide stronger legitimacy and resistance to manipulation.*

→See how disputes are categorized in [dispute-tiers](https://docs.slicehub.xyz/how-it-works/what-is-a-tier/dispute-tiers "mention")


# Protocol Guarantees

Slice is designed to provide enforceable, predictable outcomes in environments where trust breaks down.

Regardless of the dispute type or implementation phase, Slice guarantees:

**1. Neutrality**

* Slice does not interpret evidence.
* Slice does not influence jurors.
* Outcomes are determined exclusively by independent human judgment.

**2. Incentive Alignment**

* Jurors are economically incentivized to act coherently.
* Malicious or incoherent behavior is penalized by design.
* No participant has privileged influence over outcomes.

**3. Deterministic Execution**

* Once a dispute is resolved, outcomes are enforced automatically.
* Funds and actions are executed on-chain.
* No off-chain authority can override results.

**4. Liveness**

* Disputes are designed to reach resolution.
* The protocol prioritizes completion over indefinite stalling.
* No funds can remain locked indefinitely by design.

**5. Transparency and Auditability**

* All dispute rules are defined upfront.
* Outcomes are verifiable.
* Execution is deterministic and inspectable.


# Legal & Compliance Considerations

Slice is a neutral dispute resolution infrastructure designed to facilitate human judgment and on-chain execution.\
It is not a court, not a legal arbitrator, and does not provide legal advice.

***

### 1. Role of the Protocol

Slice:

* provides tools for human dispute resolution,
* enforces outcomes programmatically,
* and operates as neutral infrastructure.

Slice does not:

* interpret laws,
* determine legal liability,
* or replace legal systems.

***

### 2. Arbitration vs. Legal Proceedings

Disputes resolved through Slice:

* are not court rulings,
* do not constitute legal judgments,
* and do not replace formal arbitration unless explicitly agreed by the parties.

Slice enables **contractual dispute resolution**, not statutory enforcement.

***

### 3. Jurisdiction and Governing Rules

Slice operates as a decentralized protocol.

Disputes are governed by **protocol-defined rules and smart contract logic**, which act as the primary source of authority for resolution and execution.

Unless an integrating platform explicitly specifies additional legal terms at the application layer, the protocol itself does not define or enforce jurisdictional law.

***

### 4. Jurors and Responsibility

Jurors:

* act as independent participants,
* express personal judgment based on provided evidence,
* and are not agents, employees, or representatives of Slice.

Slice does not endorse, validate, or assume responsibility for individual juror decisions.

***

### 5. Compliance and Integrations

Compliance requirements:

* depend on the integrating platform,
* the applicable jurisdiction,
* and the nature of the underlying transaction.

Slice is designed to integrate with:

* identity and verification solutions,
* KYC/AML providers,
* and compliance frameworks,

when required by integrators or ecosystem rules.

***

### 6. Regulatory Scope

Slice does not:

* custody user funds beyond protocol execution,
* provide financial or legal advice,
* or operate as a regulated financial intermediary.

Responsibility for regulatory compliance remains with:

* platforms integrating Slice,
* or users deploying it in regulated environments.

***

### 7. User Responsibility and “As-Is” Disclaimer

Slice is provided on an **“as-is”** basis.

Outcomes result from:

* independent human judgment,
* and protocol-defined rules executed automatically.

Users and integrators are responsible for:

* assessing whether Slice is appropriate for their use case,
* understanding the economic and operational risks involved,
* and determining how dispute outcomes should be interpreted within their own legal or business context.

***

### 8. Transparency and Auditability

All dispute rules and outcomes are:

* defined upfront,
* enforced by smart contracts,
* and publicly verifiable on-chain.

This transparency supports:

* auditability,
* accountability,
* and regulatory review where applicable.


# Current Implementation

The following section describes the scope of the current MVP implementation. Other sections of the documentation describe the full Slice protocol design beyond the current implementation.

#### Scope

The current implementation focuses on validating the core mechanics of Slice:

* Human juries
* Economic incentives based on game theory
* Automated on-chain execution
* Fast and reliable dispute resolution for low-to-medium value conflicts

All features outside this scope are intentionally excluded from the MVP and will be introduced in future phases.

***

#### Supported Dispute Type

**Public Adversarial Dispute**

The MVP supports **public adversarial disputes** between two parties:

* **Claimer**: the party initiating the dispute
* **Defender**: the counterparty

Both parties:

* submit evidence,
* stake funds,
* and accept the outcome enforced by the protocol.

The dispute is resolved by a group of anonymous human jurors.

***

#### Dispute Lifecycle

Each dispute follows a deterministic, on-chain lifecycle:

1. **Dispute Creation**\
   A dispute is created by the claimer, specifying the counterparty and dispute parameters.
2. **Funding & Evidence Submission**\
   Both parties deposit the required stake and submit evidence (off-chain, referenced on-chain).
3. **Juror Assignment**\
   Jurors are selected and assigned to the dispute.
4. **Commit Phase**\
   Jurors commit their votes using a commit–reveal scheme.
5. **Reveal Phase**\
   Jurors reveal their votes.
6. **Resolution & Execution**\
   The protocol determines the winning side and automatically executes:
   * fund redistribution,
   * juror rewards,
   * and penalties.

Current implementation: once executed, the outcome is final.
Roadmap priority: add appeal rounds as a first-class escalation mechanism.

***

#### Jurors

* Jurors are human participants selected through protocol-defined assignment.
* Identity and anti-Sybil layers are part of the broader roadmap.
* Jurors are pseudonymous to disputing parties.
* Jurors must stake funds to participate.

***

#### Matchmaking

Slice uses coordination mechanisms to improve liveness and operational reliability. This coordination is designed to:

* reduce stalled or abandoned disputes,
* improve timing predictability for platforms and users,
* and adapt to available juror liquidity.

Juror selection remains randomized and independent, and outcome execution remains on-chain.

Operational timing is most predictable when juror liquidity is healthy in the relevant court/category.
Longer windows remain in place as safety buffers for periods of lower participation.

***

#### Voting & Security

* Voting is executed **fully on-chain**.
* A **commit–reveal scheme** is used to prevent vote manipulation.
* Roadmap: integrate Shutter's API to support encrypted commit–reveal with automatic reveal.
* All state transitions and outcomes are verifiable on-chain.

***

#### Tiers

Roadmap: Slice introduces standardized dispute tiers.

Current implementation: disputes are configured through courts/categories and dispute parameters.

Each tier defines:

* number of jurors,
* juror stake requirements,
* party stake requirements,
* fixed fees and protocol fees.

Tiers allow the protocol to support different levels of dispute complexity and economic risk while maintaining predictable resolution behavior.

***

#### Economics

* Both disputing parties stake funds to participate.
* Jurors stake funds to vote.
* Jurors who vote coherently are rewarded.
* Jurors who vote against the final outcome lose their stake.
* The protocol charges a fixed fee per dispute and a percentage of the losing juror pool.

All economic flows are enforced automatically by smart contracts.

***

#### Limitations of the Current Implementation

The following features are **not included** in the current implementation:

* Appeals or dispute escalation
* Private disputes
* Rating or decision-based disputes
* Automatic reveal via Shutter API integration

These features are part of the Slice protocol design and will be introduced in future phases.

***

#### Design Philosophy

The current implementation prioritizes:

* correctness over completeness,
* reliability
* and enforceable outcomes over subjective mediation.

This approach allows Slice to validate its core assumptions while preserving a clear path toward progressive decentralization and additional dispute types.


# What is a Tier

A **tier** defines the **security level, cost, and robustness** of a dispute in Slice.

In the current implementation, the same goals are achieved through configurable courts/categories.
Standardized tier profiles are part of the protocol roadmap.

Tiers allow the protocol to adapt to different types of conflicts by balancing:

* resolution speed,
* required level of trust,
* and the economic risk assumed by both parties and jurors.

Each dispute is executed within a specific tier, and all rules of the resolution process are determined by that tier.

***

### What Changes Between Tiers

#### 1. Number of Jurors

Each tier defines how many human jurors participate in resolving a dispute.

* Lower tiers use fewer jurors, enabling faster and lower-cost resolutions.
* Higher tiers use more jurors, increasing diversity of judgment and reducing the likelihood of biased outcomes.

A higher number of jurors increases the robustness of the result against individual errors or adversarial behavior.

***

#### 2. Stakes

Tiers establish the **required stake amounts** for both:

* the parties involved in the dispute (claimer and defender),
* and the jurors participating in the vote.

Higher stakes:

* increase the cost of malicious behavior,
* raise the economic commitment of participants,
* and better align incentives when the value or complexity of the dispute is higher.

Stake determines economic exposure and incentives for participation.

***

#### 3. Security Level

The security level of a dispute increases as the tier becomes higher.

This is driven by the combination of:

* a larger number of jurors,
* higher economic stakes,
* and a greater total cost required to manipulate the outcome.

Together, these factors make higher tiers more suitable for:

* higher-value disputes,
* more complex cases,
* or situations where an additional level of confidence is required.

***

### Tier System Design

Tiers do not exist to segment users, but to **offer security options proportional to the risk of a given conflict**.

In the current implementation:

* tiers are **fixed and predefined by the protocol**,
* all disputes within the same tier follow exactly the same rules,
* and outcomes are executed automatically and verifiably on-chain.

This design ensures predictable behavior for both individual users and platforms integrating Slice.


# Dispute Tiers

Each tier defines a fixed set of parameters that determine the **security level**, **economic cost**, and **robustness** of the dispute resolution process.

| Tier       | Jurors   | Stake per Juror | Stake per Party (Claimer / Defender) | Fixed Fee\* | Security Level |
| ---------- | -------- | --------------- | ------------------------------------ | ----------- | -------------- |
| **Tier 1** | 3 jurors | 1 USD           | 4 USD                                | 3 USD       | Low            |
| **Tier 2** | 5 jurors | 5 USD           | 10 USD                               | 5 USD       | Medium         |
| **Tier 3** | 7 jurors | 10 USD          | 17 USD                               | 7 USD       | High           |
| **Tier 4** | 9 jurors | 20 USD          | 29 USD                               | 9 USD       | Very High      |

\* **Fixed Fee:** a fixed amount distributed among jurors who vote coherently. This fee is taken from the stake deposited by the parties involved in the dispute.

***

#### **Important Notes**

* All values are expressed in USD (or equivalent stablecoins).
* Tier values are target profiles for standardized configurations.
* Live deployments may use court/category configurations while preserving the same economic principles.
* Higher tiers increase the cost of attacks, the diversity of judgment, and the overall robustness of the outcome.
* Selecting a tier allows the parties to choose a security level proportional to the value or complexity of the dispute.


# Which tier should I choose?

* **Tier 1**\
  Suitable for low-value or simple disputes where speed and cost efficiency are the main priorities.
* **Tier 2**\
  Recommended for standard disputes involving moderate value or complexity.
* **Tier 3**\
  Designed for higher-value disputes or cases where stronger guarantees and broader juror consensus are required.
* **Tier 4**\
  Best suited for complex or high-stakes disputes where maximum robustness and security are needed.


# Dispute Lifecycle

Every dispute in Slice follows a deterministic, transparent lifecycle designed to ensure fairness, incentive alignment, and automatic execution.

While specific parameters may vary depending on the tier or dispute type, the overall structure of the process remains consistent across the protocol.

***

#### 1. Dispute Creation

A dispute begins when a party (the **Claimer**) initiates a case against another party (the **Defender**).

At creation time:

* the dispute parameters are defined,
* the applicable tier is selected,
* and the dispute becomes available for participation.

From this point forward, the dispute is governed entirely by protocol rules.

***

#### 2. Stake Deposit

Both the Claimer and the Defender are required to deposit the stake defined by the selected tier.

This stake:

* signals commitment to the process,
* prevents frivolous or spam disputes,
* and ensures that both parties have economic exposure to the outcome.

If the required stakes are not deposited within the allowed time window, the dispute does not proceed.

***

#### 3. Evidence Submission

Once the dispute is funded, both parties may submit evidence supporting their position.

Evidence is:

* submitted off-chain,
* cryptographically referenced on-chain,
* and made available to all assigned jurors.

The protocol does not interpret evidence.\
It only guarantees that evidence is immutable and equally accessible.

***

#### 4. Juror Assignment

A set of jurors is assigned to the dispute according to the rules defined by the selected tier.

Juror assignment:

* is randomized,
* is independent from the disputing parties,
* and ensures the dispute reaches the required number of jurors.

Jurors must deposit their own stake in order to participate.

***

#### 5. Commit Phase

During the commit phase, each juror submits a cryptographic commitment to their vote.

This phase:

* prevents vote copying or coordination,
* ensures jurors make independent decisions,
* and protects the integrity of the voting process.

Votes are not visible during this phase.

***

#### 6. Reveal Phase

In the reveal phase, jurors reveal their previously committed votes.

The protocol verifies that each revealed vote matches its original commitment.

Once all required votes are revealed — or the reveal period expires — the dispute moves to resolution.

***

#### 7. Resolution and Execution

After the voting phase concludes, the protocol determines the outcome based on juror votes.

The result is:

* final for the current dispute,
* enforced automatically by smart contracts,
* and executed without human intervention.

This includes:

* redistribution of stakes between the parties,
* rewards and penalties for jurors,
* and the final settlement of the dispute.

***

#### Finality

In the current implementation, dispute outcomes are final once executed.

Appeals are central to Slice's long-term security model and are one of the most urgent roadmap priorities.
Future iterations will introduce structured appeal rounds and additional resolution layers.


# Jurors

Jurors are independent human participants responsible for resolving disputes in Slice.

They act as neutral decision-makers, evaluating evidence and casting votes according to their honest judgment.\
The protocol is designed so that jurors are economically incentivized to vote coherently and independently.

***

#### Who Can Be a Juror

Any eligible participant who meets the protocol’s requirements may act as a juror.

Jurors:

* can be gated by identity and anti-Sybil mechanisms depending on deployment profile,
* participate anonymously with respect to the disputing parties,
* and must actively opt in to each dispute they join.

Jurors cannot participate in disputes in which they are directly involved.

***

#### Role and Responsibilities

Jurors are responsible for:

* reviewing the evidence submitted by both parties,
* applying their own judgment based on the dispute context,
* and submitting a vote within the defined voting phases.

Jurors do not communicate with each other during the dispute and have no visibility into other jurors’ votes until the process concludes.

***

#### Stakes and Economic Exposure

To participate in a dispute, jurors are required to deposit a stake defined by the selected tier.

This stake:

* represents economic exposure to the outcome,
* aligns juror incentives with honest participation,
* and discourages low-effort or malicious behavior.

Staking defines economic exposure and reinforces honest participation.

***

#### Rewards and Penalties

Jurors who vote coherently with the final outcome are rewarded.

Jurors who vote against the final outcome lose part or all of their stake, depending on the dispute type and tier.

This reward and penalty structure:

* reinforces honest decision-making,
* penalizes random or adversarial voting,
* and ensures long-term incentive alignment within the juror pool.

***

#### Independence and Neutrality

Jurors are selected independently and randomly.

The protocol ensures that:

* disputing parties cannot choose their jurors,
* jurors cannot influence assignment or outcomes,
* and all economic flows are enforced automatically by smart contracts.

Jurors do not have discretionary power beyond their individual vote.

***

#### Jurors in the Ecosystem

Jurors are a core component of the Slice ecosystem.

By participating in disputes, jurors:

* help maintain trust in digital platforms,
* contribute to fair and transparent outcomes,
* and earn rewards by providing honest human judgment.

The protocol is designed to scale the juror pool over time while preserving neutrality, reliability, and economic incentives.


# Voting and Incentives

{% hint style="info" %}
This section describes how voting and economic incentives operate in practice within Slice.\
For the theoretical rationale behind these mechanisms, see Security & Game Theory.
{% endhint %}

Slice uses an incentive-driven voting system designed to align honest human judgment with economic outcomes.

The protocol does not attempt to determine truth algorithmically.\
Instead, it relies on structured human voting combined with economic incentives to converge toward fair and reliable decisions.

***

#### Independent Juror Participation

Jurors participate independently in each dispute and are evaluated economically on outcome coherence.

Staking aligns incentives by creating meaningful upside for coherent decisions and downside for incoherent behavior.

***

#### Commit–Reveal Voting

Slice uses a **commit–reveal** voting scheme to protect the integrity of the voting process.

Roadmap: integrate Shutter's API for encrypted commit–reveal with automatic reveal to reduce juror UX friction and improve liveness.

The process is divided into two phases:

* **Commit phase**:\
  Jurors submit a cryptographic commitment to their vote without revealing its value.
* **Reveal phase**:\
  Jurors reveal their vote, which is verified against the original commitment.

This mechanism:

* prevents vote copying or coordination,
* encourages independent decision-making,
* and protects jurors from external pressure.

The protocol enforces this process automatically and uniformly across all disputes, regardless of tier.

***

#### Coherent Voting

After all votes are revealed, the protocol determines the final outcome based on the collective decision of the jurors.

Jurors are considered to have voted **coherently** if their vote aligns with the final outcome.

Coherent voting is the primary signal used by the protocol to distribute rewards and penalties.

Coherence is evaluated exclusively against the final collective outcome, not against external or subjective notions of correctness.

***

#### Rewards

Jurors who vote coherently are rewarded.

Rewards are sourced from:

* the stakes of jurors who voted incoherently,
* and predefined dispute fees, depending on the tier.

Rewards are distributed automatically and proportionally according to protocol rules.

Reward distribution follows deterministic protocol rules and does not involve discretionary judgment.

***

#### Penalties

Jurors who vote against the final outcome are penalized.

Penalties may include:

* partial or total loss of the juror’s stake,
* depending on the dispute type and selected tier.

This mechanism discourages:

* random voting,
* low-effort participation,
* and strategic manipulation.

Penalty application is automatic and applies equally to all jurors under the same dispute conditions.

***

#### Incentive Alignment

The voting and incentive system is designed so that:

* honest voting maximizes expected returns,
* dishonest or careless voting increases economic risk,
* and long-term participation favors consistent, coherent behavior.

Over time, this creates a juror pool that is economically aligned with fair and reliable dispute resolution.

This mechanism allows the juror pool to self-regulate over time without centralized reputation scoring.

***

#### Automatic Enforcement

All rewards, penalties, and fund transfers are enforced automatically by smart contracts.

The protocol does not rely on discretionary intervention, manual arbitration, or centralized control to execute outcomes.

This ensures:

* predictability,
* transparency,
* and neutrality across all disputes.

> Once executed, outcomes cannot be altered or overridden.


# Dispute Types

Slice supports multiple types of human judgment, depending on the nature of the conflict or evaluation being performed.

Each dispute type defines:

* how participants interact,
* how jurors evaluate information,
* and how outcomes are enforced on-chain.

Not all dispute types are available in the current implementation.\
This section describes the **full design of the protocol** and clearly indicates the status of each type.

| Types               | Purpose                                                      | Outcome            | Status  |
| ------------------- | ------------------------------------------------------------ | ------------------ | ------- |
| Adversarial Dispute | <sup><sub>*Resolve conflicts between two parties*<sub></sup> | *Winner/Loser*     | Live    |
| Decision Dispute    | <sup><sub>*Validate proposals or decisions*<sub></sup>       | *Accept/Reject*    | Planned |
| Rating Evaluation   | <sup><sub>*Evaluate quality or contribution*<sub></sup>      | *Aggregated Score* | Planned |

### Adversarial Dispute

**Status:** Live (Current Implementation)

Resolves conflicts between two opposing parties: a **Claimer** and a **Defender**.

Jurors evaluate evidence submitted by both sides and vote on a binding outcome that is enforced on-chain.

Used for:

* marketplaces,
* freelancer and contractor platforms,
* fintech and payment disputes,
* peer-to-peer conflicts.

→ *See: Adversarial Dispute*

***

### Decision Dispute

**Status:** Planned

Designed for collective decision-making rather than conflict resolution.

Jurors evaluate whether a proposal or action should be accepted or rejected according to predefined rules.

Used for:

* governance processes,
* protocol-level decisions,
* structured human validation.

→ *See: Decision Dispute*

***

### Rating Evaluation

**Status:** Planned

A collective evaluation mechanism based on structured numerical input rather than binary outcomes.

Jurors provide ratings that are aggregated to measure quality, performance, or contribution.

Used for:

* open-source contribution evaluation,
* content moderation,
* quality and performance scoring,
* reputation systems.

→ *See: Rating Evaluation*

{% hint style="info" %}
Some dispute types may support additional evaluation rounds under stricter conditions.
{% endhint %}

***

### Extensibility

Slice is designed as a modular protocol.

Additional dispute types and variations can be introduced over time without changing the core execution or incentive model.


# Adversarial Dispute

Not all conflicts require the same kind of resolution.

Some involve two opposing parties, competing claims, and a need for a clear, enforceable outcome.

**Adversarial disputes** are Slice’s core dispute primitive, designed to resolve these situations through neutral human judgment and on-chain execution.

***

### Overview

An adversarial dispute resolves a conflict between **two opposing parties**:

* a **Claimer**, who initiates the dispute,
* and a **Defender**, who responds to it.

Both parties:

* submit evidence,
* deposit a stake,
* and accept a binding outcome determined by jurors.

A group of independent human jurors evaluates the evidence and votes on the dispute.\
The final result is executed automatically and verifiably on-chain.

***

### When to use an Adversarial Dispute

Adversarial disputes are suitable when:

* responsibility or fault is contested,
* the outcome is binary,
* and a clear winner must be determined.

Typical use cases include:

* marketplaces and peer-to-peer transactions,
* freelancer and contractor platforms,
* fintech and payment disputes,
* protocol-level human arbitration.

***

### Participants

#### Claimer

The party that initiates the dispute.

The claimer is responsible for:

* opening the dispute,
* submitting evidence,
* and staking funds according to the selected tier.

***

#### Defender

The party responding to the claim.

The defender:

* submits counter-evidence,
* matches the required stake,
* and participates under the same rules as the claimer.

***

#### Jurors

Independent participants selected through randomized assignment.

Jurors:

* review the evidence,
* vote independently,
* and are economically incentivized to vote coherently.

Jurors are never parties to the dispute.

***

### Dispute Flow (High Level)

1. The dispute is created by the claimer.
2. Both parties submit evidence and deposit their stake.
3. Jurors are assigned to the dispute.
4. Jurors evaluate the evidence and vote.
5. The protocol determines the outcome.
6. Funds and results are executed automatically on-chain.

All steps follow predefined rules enforced by smart contracts.

***

### Appeals

Appeals are **central to adversarial disputes** and one of the most urgent roadmap priorities.

Current live contracts finalize in a single executed round. The next phase introduces additional appeal rounds.

An appeal represents a request for a new evaluation under stricter conditions.

Slice uses a **funding-based appeal model**:

* Only the appealing party is required to pay the cost to open a new round.
* The non-appealing party may choose to match the stake in order to participate in the appeal round.
* If the non-appealing party does not match:
  * they do not automatically lose the case,
  * but they forfeit the right to earn appeal-related rewards.

This design incentivizes participants to financially support the outcome they believe is correct, without forcing participation or introducing asymmetrical power.

Appeal rounds may involve:

* a higher tier,
* more jurors,
* or stronger economic guarantees.

***

### Guarantees

Adversarial disputes in Slice provide:

* **Neutrality**: jurors are independent and randomly assigned.
* **Economic alignment**: incentives reward coherent voting.
* **Deterministic execution**: outcomes are enforced by smart contracts.
* **Predictable structure**: all rules are defined upfront by the protocol.

Slice does not interpret evidence, influence jurors, or intervene in outcomes.

***

### Status

**Live (Current Implementation)**

Adversarial disputes are the primary dispute type supported in the current version of Slice.


# Decision Dispute

Not all judgments involve a conflict between two opposing parties.

Some situations require a **collective human decision** to validate whether an action, proposal, or outcome should be accepted or rejected.

**Decision disputes** are designed for these cases.

***

### Overview

A decision dispute enables **structured collective judgment** over a proposal or action.

Instead of resolving a conflict between two parties, jurors evaluate whether a submitted proposal is **valid, acceptable, and well-defined** according to predefined rules.

The outcome is enforced automatically on-chain.

***

### When to use a Decision Dispute

Decision disputes are suitable when:

* no direct adversarial conflict exists,
* a proposal must be validated by human judgment,
* or automated rules are insufficient or ambiguous.

Typical use cases include:

* governance and protocol decisions,
* validation of sensitive actions,
* structured approval workflows,
* human review of edge cases.

***

### Participants

#### Proposer

The proposer submits a proposal, action, or decision for evaluation.

The proposer:

* defines the proposal to be evaluated,
* deposits a **bond**,
* and accepts the outcome determined by jurors.

The proposer is **never a juror** in their own decision dispute.

***

#### Jurors

Independent participants selected through randomized assignment.

Jurors:

* evaluate the proposal according to the dispute rules,
* vote independently,
* and are economically incentivized to act coherently.

Jurors are not influenced by the proposer and have no special privileges.

***

### Decision Outcomes

Decision disputes produce one of the following outcomes:

#### Accept

The proposal is considered valid and acceptable.

The protocol executes the accepted action or records the decision accordingly.

***

#### Reject

The proposal is considered invalid, poorly defined, or unsuitable for evaluation.

Reject does **not** mean:

> “refund the proposer”

Reject means:

> “the proposal should not be accepted in its current form.”

In this case, the proposer’s bond is used to:

* compensate jurors,
* and cover protocol costs.

This mechanism discourages biased, low-quality, or malformed proposals without giving proposers special influence.

***

### Bond Mechanism

The proposer deposits a bond when opening a decision dispute.

The bond serves to:

* discourage spam or biased proposals,
* align incentives between proposers and jurors,
* and compensate jurors in case of rejection.

If:

* no clear majority is reached,
* or a rejection threshold is met,

the bond may be redistributed according to the dispute rules.

***

### Dispute Flow (High Level)

1. The proposer submits a proposal and deposits a bond.
2. Jurors are assigned to the dispute.
3. Jurors evaluate the proposal and vote.
4. The protocol determines the outcome.
5. The result is executed automatically on-chain.

All steps follow predefined rules enforced by smart contracts.

***

### Guarantees

Decision disputes in Slice provide:

* **Impartial evaluation**: proposers do not influence voting.
* **Economic discipline**: bonds discourage malformed proposals.
* **Transparent execution**: outcomes are enforced on-chain.
* **Predictable structure**: decision rules are defined upfront.

Slice does not interpret proposals or intervene in decisions.

***

### Status

**Planned**

Decision disputes are part of the core protocol design and will be introduced in a future implementation phase.


# Rating Evaluation

Not all judgments are about determining a winner.

Some problems require **measuring quality, performance, or contribution** rather than resolving a conflict.

**Rating Evaluation** is Slice’s primitive for these cases: a structured, incentive-aligned system for collective human evaluation.

***

### Overview

Rating Evaluation enables **collective assessment using numerical input**, rather than binary outcomes.

Instead of voting for a winning party, jurors provide **ratings on a predefined scale** (for example, 1–5).\
These ratings are aggregated using robust statistical methods to produce a final evaluation.

The result is enforced or recorded automatically on-chain.

Rating Evaluation is designed to support **subjective or qualitative judgment** while preserving incentive alignment and resistance to manipulation.

***

### When to use Rating Evaluation

Rating Evaluation is suitable when:

* there is no clear winner or loser,
* quality or contribution must be assessed,
* or outcomes exist on a spectrum rather than as binary choices.

Typical use cases include:

* open-source contribution evaluation and reward distribution,
* content moderation and severity assessment,
* marketplace quality scoring,
* performance and deliverable evaluation,
* reputation and feedback systems.

***

### Participants

#### Subject

The subject is the entity being evaluated.

This may be:

* a contribution,
* a piece of content,
* a deliverable,
* or a completed action.

The subject does not participate in voting.

***

#### Jurors

Independent participants selected through randomized assignment.

Jurors:

* review the submitted evidence,
* assign ratings according to the defined scale,
* and are economically incentivized to rate coherently.

Jurors do not coordinate directly and have no privileged information.

***

### Evaluation Method

Jurors submit ratings on a predefined numerical scale.

The protocol aggregates these ratings using a **median-based approach**, which:

* reduces sensitivity to outliers,
* penalizes extreme or incoherent inputs,
* and provides robustness against individual manipulation.

Incentives are adjusted based on **distance from the aggregated result**, rather than absolute correctness.

This creates a system where jurors are rewarded for **coherent judgment**, not for guessing an objective “truth”.

***

### Incentive Design

Rating Evaluation uses **partial incentive adjustment** rather than full slashing.

Jurors whose ratings are closer to the aggregated result retain more of their stake.\
Jurors whose ratings deviate significantly may lose a portion of it.

This design:

* discourages extreme or bad-faith ratings,
* tolerates reasonable disagreement,
* and avoids punishing minor deviations harshly.

***

### Generalization Across Domains

Rating Evaluation is designed as a **general evaluation engine**, not a domain-specific tool.

The protocol separates:

* the **rating engine** (aggregation and incentive logic),
* from the **evidence schema** (what is being evaluated and how).

This allows the same evaluation mechanism to be reused across multiple verticals, with domain-specific evidence formats defined at the integration layer.

***

### Dispute Flow (High Level)

1. An evaluation request is created.
2. Evidence related to the subject is submitted.
3. Jurors are assigned to the evaluation.
4. Jurors submit numerical ratings.
5. Ratings are aggregated and incentives adjusted.
6. The final evaluation is recorded or executed on-chain.

All steps follow predefined rules enforced by smart contracts.

***

### Guarantees

Rating Evaluation in Slice provides:

* **Robust aggregation**: resistance to outliers through median-based methods.
* **Incentive alignment**: partial slashing discourages manipulation.
* **Flexibility**: applicable across multiple evaluation domains.
* **Deterministic execution**: results enforced or recorded on-chain.

Slice does not define what “quality” means; it enforces how collective judgment is aggregated and incentivized.

Here is the translation of that section into English, maintaining the technical and formal tone of the original documentation.

***

#### Reward Calculation

To ensure the system is both fair and resistant to manipulation, Slice utilizes a linear loss function based on distance. Each juror's reward multiplier is determined by comparing their individual rating to the final aggregated result (the median).

The applied formula is:

$$
S\_i = 1 - \left( \frac{|r\_i - \tilde{x}|}{D\_{max}} \right)
$$

Where:

* $$S\_i$$: Juror’s reward score (between 0 and 1).
* $$|r\_i - \tilde{x}|$$: The absolute distance between the juror’s rating and the median.
* $$D\_{max}$$: The maximum possible distance within the scale (e.g., 4 on a 1–5 scale).

**Why this design?**

This incentive mechanism was selected for two fundamental reasons:

1. Fairness for Subjective Judgment:

   Unlike binary dispute resolution systems—where a minor deviation can lead to a total loss of stake—this formula recognizes that quality assessment is nuanced. If the majority rates a deliverable as a 4 and you rate it as a 3, the system does not treat you as a malicious actor, but as an evaluator with a slightly different perspective. You receive a partial reward (75% on a 1–5 scale) rather than being severely penalized.
2. Resistance to Collusion and Outliers:

   By using the median as the system's anchor, the protocol remains extremely robust. Jurors are economically incentivized to seek the "honest consensus," as moving away from what the majority perceives as reasonable results in a proportional financial loss. This compels jurors to be diligent: the more erratic or extreme their rating is relative to the collective judgment, the lower their profit will be.

***

### Status

**Planned**

Rating Evaluation is part of the core protocol design and will be introduced in a future implementation phase.


# Frequently Asked Questions

This page answers common questions about Slice, how it works, and what guarantees it provides.

Everything you need to know about Slice. If you happen to have any other questions, feel free to join our Slice Community Telegram group to talk directly you our team. Please check out [Official links](https://docs.idos.network/idos-token-launch/official-links).

### General

<details>

<summary>Can you really trust a decision made by anonymous jurors?</summary>

Slice extends the same incentive logic used in cryptoeconomic systems to human judgment.

Jurors are:

* **independent**,
* **randomly assigned**,
* and **economically incentivized** to vote coherently.

Because outcomes affect real value, the system is designed so that **dishonest or low-effort behavior is costly**, while coherent behavior is rewarded.

</details>

<details>

<summary>Is Slice a court or a legal arbitrator?</summary>

No. Slice is **neutral dispute resolution infrastructure**.

It is not a court and does not provide legal advice. It enforces outcomes based on protocol rules and smart contract execution.

(See: *Legal & Compliance Considerations*)

</details>

<details>

<summary>What kinds of disputes is Slice built for?</summary>

Slice is optimized for **micro-to-medium disputes** in digital platforms, where:

* disputes are frequent,
* amounts are not large enough for traditional legal processes,
* and fast resolution matters.

Examples include marketplaces, freelance platforms, fintech/payment conflicts, governance validation, and quality evaluation.

(See: *Use Cases*)

</details>

<details>

<summary>Is Slice only for Stellar?</summary>

No. Slice is designed to be **chain-agnostic**, although it may prioritize specific ecosystems depending on adoption and integration demand.

</details>

### How Slice Works

<details>

<summary>What is a Tier?</summary>

A tier defines the **security level and economic parameters** of a dispute: number of jurors, required stakes, and overall robustness.

Higher tiers increase the cost of manipulation by combining:

* more jurors,
* higher stakes,
* higher total cost to attack.

(See: *What is a Tier*)

</details>

<details>

<summary>How long does a dispute take?</summary>

Resolution time depends on:

* tier (number of jurors),
* evidence/voting windows,
* and juror availability.

Slice is designed to keep dispute resolution **predictable and reliable**, prioritizing liveness and completion.

(See: *Dispute Lifecycle*)

</details>

<details>

<summary>What happens after the dispute is resolved?</summary>

Once the dispute is resolved, the outcome is **executed automatically on-chain**:

* funds are redistributed according to the ruling,
* juror incentives are settled programmatically,
* and the final state becomes publicly verifiable.

</details>

### Jurors

<details>

<summary>Are jurors anonymous?</summary>

Jurors are pseudonymous participants, but Slice can require **Proof-of-Humanity (PoH)** to prevent sybil attacks.

This means jurors can remain private while still proving they are unique humans.

</details>

<details>

<summary>Why require Proof-of-Humanity (PoH)?</summary>

Without PoH, a malicious actor could create many identities and try to influence outcomes.

PoH increases security by ensuring:

* one human = one juror identity,
* and the economic cost to manipulate results becomes substantially higher.

</details>

<details>

<summary>Can parties be jurors in their own dispute?</summary>

No. Parties cannot serve as jurors in disputes where they have a direct interest.

This avoids conflicts of interest and preserves neutrality.

</details>

<details>

<summary>What if jurors don’t vote or go inactive?</summary>

Jurors are expected to participate within defined time windows.

Non-participation can result in:

* losing the chance to earn rewards,
* and protocol-defined penalties depending on the rules of the dispute.

</details>

### Security & Incentives

<details>

<summary>Can someone “whale” attack Slice by staking a lot?</summary>

Stakes affect:

* economic exposure,
* and rewards/penalties.

Large stakes increase financial exposure, but do not create special control over final execution rules.

(See: *Security Model)*

</details>

<details>

<summary>Can someone bribe jurors?</summary>

Bribery is made difficult by:

* randomized assignment,
* pseudonymity,
* and incentive alignment (jurors who vote incoherently are penalized).

Because jurors are not known in advance, targeted bribery becomes harder, and dishonest coordination is economically risky.

(See: *Security Model)*

</details>

<details>

<summary>What prevents sybil attacks?</summary>

Slice mitigates sybil attacks through:

* **Proof-of-Humanity (PoH)** eligibility,
* randomized juror assignment,
* and economic penalties for incoherent voting.

(See: *Security Model)*

</details>

<details>

<summary>Can Slice be fully trustless if matchmaking uses a backend?</summary>

Slice can use **backend-assisted matchmaking** to ensure disputes reach the required number of jurors and resolve reliably.

The backend:

* coordinates assignment and timing,
* but **cannot influence votes, outcomes, or fund execution**.

All rulings and transfers are enforced by smart contracts.

In the long-term, Slice can support multiple modes such as “Turbo” (assisted) and “Pure Randomness” (fully on-chain randomness).

(See: *Security Model)*

</details>

### Appeals

<details>

<summary>Does Slice support appeals?</summary>

Appeals are part of Slice’s protocol design and may be enabled depending on dispute type and implementation phase.

In adversarial disputes, appeal rounds can be opened under stricter conditions to increase robustness and security.

</details>

<details>

<summary>How are appeals funded?</summary>

In adversarial disputes, Slice follows a funding model where:

* the appellant pays the cost to open a new round,
* while the non-appellant may optionally “match” to preserve upside.

This discourages frivolous appeals while keeping escalation possible when needed.

(See: *Adversarial Dispute*)

</details>

### Integrations

<details>

<summary>Do users need to hold a specific token to use Slice?</summary>

No. Regular users (claimer/defender) do not need to hold a protocol token.

Slice is designed to work with **standard assets (e.g., stablecoins)** used for stakes and payouts.

</details>

<details>

<summary>Do I need the SDK to integrate Slice?</summary>

Not necessarily. Slice can be integrated through direct contract interaction and integration guidelines.

The SDK is planned to simplify and standardize integrations over time.

(See: *Integrate*)

</details>

<details>

<summary>Who is responsible for compliance when integrating Slice?</summary>

Compliance depends on the integrating platform, jurisdiction, and transaction type.

Slice is neutral infrastructure and can be combined with identity/KYC/AML solutions when required.

(See: *Legal & Compliance Considerations*)

</details>

### Legal & Responsibility

<details>

<summary>Who is responsible if a verdict causes economic loss?</summary>

Slice is provided “as-is”.

Outcomes result from:

* independent human judgment,
* and protocol-defined rules executed on-chain.

Users and integrators are responsible for determining whether Slice is appropriate for their use case and risk tolerance.

(See: *Legal & Compliance Considerations*)

</details>

<details>

<summary>Are Slice rulings legally binding?</summary>

Slice outcomes are **programmatically binding** because parties opt into on-chain enforcement.

They are not court rulings and do not automatically constitute legal judgments unless an integrator explicitly frames them within a legal agreement at the application layer.

</details>


# Quickstart

## 💻 Developer Guide


# Our vision


# Additional resources


# Roadmap: The Journey Ahead


# Still under construction...

;)
