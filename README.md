# Syncify

Cross-platform music discovery prototype built with Expo, React Native, and TypeScript.

## Spotify catalog setup

1. Create a Spotify developer app and copy its **Client ID** (never put a client secret in a mobile app).
2. Set `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` in the environment before starting Expo.
3. Register the exact redirect URI produced by `AuthSession.makeRedirectUri({ scheme: 'syncify', path: 'spotify-auth' })` in the Spotify app settings. The app scheme is configured as `syncify` in `app.json`.
4. Install dependencies and run `npx expo start`. For OAuth with a custom URI scheme, use an Expo development build or standalone build; Expo Go may not support the configured app redirect.

Example (macOS/Linux):

```bash
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id npx expo start
```

PowerShell:

```powershell
$env:EXPO_PUBLIC_SPOTIFY_CLIENT_ID="your_client_id"
npx expo start
```

## Implemented

- Spotify Authorization Code with PKCE (public mobile client; no client secret)
- Spotify catalog track search in the Search tab
- Secure token storage and refresh using Expo SecureStore
- Spotify result links open in Spotify; catalog search is not full audio streaming
- Existing sample catalog/player remains a separate demo experience

Spotify playback itself is not streamed by this app. Full playback requires Spotify's supported playback integration and an eligible account/device. Catalog preview availability is not guaranteed. Follow Spotify's developer terms and brand guidelines.
