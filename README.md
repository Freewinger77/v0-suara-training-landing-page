# Suara Training landing page

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/test7s-projects/v0-suara-training-landing-page)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/o3Z18hzAqu5)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/test7s-projects/v0-suara-training-landing-page](https://vercel.com/test7s-projects/v0-suara-training-landing-page)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/o3Z18hzAqu5](https://v0.app/chat/projects/o3Z18hzAqu5)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Features

- 🌏 Regional dialect selection for Malaysian speech training
- 🎤 Audio recording and transcription
- 🔐 Authentication with X (Twitter) and Google via Privy
- 🎨 Dark/Light theme support
- 📊 Training history and points tracking
- 🎯 Interactive step-by-step training flow

## Authentication Setup

This app uses [Privy](https://privy.io) for authentication with X (Twitter) and Google login.

### Quick Setup

1. Create a Privy account at [https://dashboard.privy.io](https://dashboard.privy.io)
2. Create a new app or use the default app
3. Copy your App ID
4. Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
   ```
5. Configure Google and Twitter OAuth in your Privy dashboard

For detailed setup instructions, see [PRIVY_SETUP.md](./PRIVY_SETUP.md)

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_PRIVY_APP_ID` - Your Privy App ID for authentication

See [PRIVY_SETUP.md](./PRIVY_SETUP.md) for complete setup guide.