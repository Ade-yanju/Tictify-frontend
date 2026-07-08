/**
 * Social Authentication Utilities
 * Handlers for Google, Microsoft, Apple sign-in
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID';
const APPLE_TEAM_ID = import.meta.env.VITE_APPLE_TEAM_ID || 'YOUR_APPLE_TEAM_ID';

export const initGoogleAuth = () => {
  if (window.google?.accounts) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
  }
};

export const handleGoogleAuth = (buttonElement) => {
  if (window.google?.accounts) {
    window.google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      width: '100%',
    });
  }
};

const handleGoogleResponse = async (response) => {
  try {
    const { credential } = response;
    // Send to backend for verification
    const result = await fetch('/api/v1/auth/social/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credential }),
    });
    return await result.json();
  } catch (error) {
    console.error('Google auth failed:', error);
    throw error;
  }
};

export const handleMicrosoftAuth = async () => {
  try {
    // Microsoft Azure AD implementation
    const redirectUri = `${window.location.origin}/auth/callback/microsoft`;
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${MICROSOFT_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=openid%20profile%20email`;

    window.location.href = authUrl;
  } catch (error) {
    console.error('Microsoft auth failed:', error);
    throw error;
  }
};

export const handleAppleAuth = async () => {
  try {
    // Apple Sign in requires AppleID JS SDK
    if (window.AppleID) {
      const response = await window.AppleID.auth.signIn();
      const { identityToken } = response.authorization;

      const result = await fetch('/api/v1/auth/social/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: identityToken }),
      });
      return await result.json();
    }
  } catch (error) {
    console.error('Apple auth failed:', error);
    throw error;
  }
};

export const socialAuthProviders = [
  { id: 'google', label: 'Google', handler: handleGoogleAuth, icon: 'G' },
  { id: 'microsoft', label: 'Microsoft', handler: handleMicrosoftAuth, icon: '⊞' },
  { id: 'apple', label: 'Apple', handler: handleAppleAuth, icon: '🍎' },
];
