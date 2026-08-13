# LearnVerse AI Mobile

LearnVerse AI Mobile is the Android and iOS student client for an AI-native educational video platform. It focuses on interactive learning rather than passive watching: discover content, watch lessons, ask a contextual tutor, practice, create revision materials, and follow measurable progress.

The complete architecture, production data model, API contract, security model, and deployment plan are documented in [ARCHITECTURE.md](./ARCHITECTURE.md), [DATABASE.md](./DATABASE.md), [API.md](./API.md), [SECURITY.md](./SECURITY.md), and [DEPLOYMENT.md](./DEPLOYMENT.md).

## Local Development

Run `pnpm dev` to start the Expo development environment. Run `pnpm check`, `pnpm lint`, and `pnpm test` to validate the codebase. Android and iOS builds are generated through the managed project publish workflow after a checkpoint has been created.

## Current Product Boundary

This repository builds a functional student experience and preserves typed contracts for platform services. The commercial platform capabilities that need privileged infrastructure—creator uploads, large-scale media processing, semantic index workers, multi-tenant institutions, billing, moderation, and live collaboration—are intentionally documented as separately deployed services rather than simulated inside native screens.
