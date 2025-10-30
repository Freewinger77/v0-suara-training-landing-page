# Privy Authentication Setup Guide

This guide will help you set up Privy authentication with X (Twitter) and Google login for your Suara application.

## Prerequisites

- A Privy account (sign up at [https://privy.io](https://privy.io))
- Google OAuth credentials (for Google login)
- X/Twitter OAuth credentials (for X login)

## Step 1: Create a Privy Account and App

1. Go to [https://dashboard.privy.io](https://dashboard.privy.io) and sign up/login
2. Click "Create App" or use the default app
3. Copy your **App ID** - you'll need this for your environment variables

## Step 2: Configure Login Methods

### Enable Google Login

1. In your Privy dashboard, go to **Settings** > **Login Methods**
2. Enable **Google** login
3. You'll need to configure Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to **Credentials** > **Create Credentials** > **OAuth Client ID**
   - Choose **Web application**
   - Add your authorized redirect URIs:
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com`
   - Copy the **Client ID** and **Client Secret**
4. Back in Privy dashboard, enter your Google OAuth credentials

### Enable X (Twitter) Login

1. In Privy dashboard, go to **Settings** > **Login Methods**
2. Enable **Twitter** login
3. You'll need to configure Twitter OAuth:
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create a new project and app (or use an existing one)
   - Go to your app's **Settings** > **User authentication settings**
   - Enable **OAuth 2.0**
   - Set your callback URLs:
     - For development: `http://localhost:3000/api/auth/callback/twitter`
     - For production: `https://yourdomain.com/api/auth/callback/twitter`
   - Set website URL to your domain
   - Copy the **API Key** and **API Secret**
4. Back in Privy dashboard, enter your Twitter OAuth credentials

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Privy App ID:
   ```bash
   NEXT_PUBLIC_PRIVY_APP_ID=your_actual_privy_app_id
   ```

3. (Optional) Add your Privy App Secret for server-side authentication:
   ```bash
   PRIVY_APP_SECRET=your_privy_app_secret
   ```

## Step 4: Configure Privy App Settings

1. In Privy dashboard, go to **Settings** > **General**
2. Configure the following:
   - **App Name**: Suara - Speech Training
   - **App Logo**: Upload your logo (optional)
   - **Allowed Origins**: Add your domains
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com`

## Step 5: Customize Appearance (Optional)

The Privy provider is already configured with custom styling in `components/privy-provider.tsx`:

```typescript
appearance: {
  theme: "light",
  accentColor: "#10B981",  // Green accent to match your brand
  logo: "/placeholder-logo.svg",
  showWalletLoginFirst: false,
}
```

You can customize:
- `theme`: "light" or "dark"
- `accentColor`: Any hex color code
- `logo`: Path to your logo image

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000`
3. Click the "Sign In" button in the top-right corner
4. Test both Google and Twitter login methods

## Features Included

### Authentication Button (`components/auth-button.tsx`)
- Shows "Sign In" button when not authenticated
- Shows user avatar and dropdown menu when authenticated
- Displays user name from Google or Twitter
- Shows user email (if available)
- Logout functionality

### User Profile Display
- Automatically displays user avatar from Google or Twitter
- Shows user initials as fallback
- Displays user name and email in dropdown

### Privy Provider (`components/privy-provider.tsx`)
- Wraps entire app to provide authentication context
- Configured for Google and Twitter login only
- Custom theming to match app design
- Embedded wallet creation for users (optional)

## Using Authentication in Your Components

To use authentication in your components:

```typescript
import { usePrivy } from "@privy-io/react-auth"

export function MyComponent() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  if (!ready) return <div>Loading...</div>
  
  if (!authenticated) {
    return <button onClick={login}>Sign In</button>
  }

  return (
    <div>
      <p>Welcome, {user?.google?.name || user?.twitter?.username}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  )
}
```

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use environment variables** for all sensitive data
3. **Verify tokens on the server** when needed using `@privy-io/server-auth`
4. **Enable HTTPS** in production
5. **Configure CORS** properly in production

## Troubleshooting

### "Invalid App ID" Error
- Double-check your `NEXT_PUBLIC_PRIVY_APP_ID` in `.env.local`
- Make sure you've copied the entire App ID from Privy dashboard
- Restart your development server after changing environment variables

### OAuth Redirect Issues
- Verify your callback URLs match exactly in both provider and Privy
- Check that your domains are added to "Allowed Origins" in Privy
- Ensure your OAuth apps are approved and active

### User Data Not Showing
- Check if you've granted the correct permissions/scopes
- Verify the OAuth configuration in Privy includes email and profile scopes

## Additional Resources

- [Privy Documentation](https://docs.privy.io)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Twitter OAuth 2.0 Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Privy dashboard logs
3. Contact Privy support at [support@privy.io](mailto:support@privy.io)

