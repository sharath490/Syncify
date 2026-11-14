# Syncify

A cross-platform music discovery prototype built with Expo, React Native, and TypeScript.

## Run locally

```bash
npm install
npx expo start
```

Run on Android/iOS with Expo Go or use the web target. `npm run typecheck` runs TypeScript validation.

## Current features

- Separate Discover, Search, Library, and Radio tab screens
- Search by song, artist, and mood
- Mood-filtered discovery and curated playlist selection
- Shared mini-player state across tabs with play/pause and next-track controls
- Liked songs persisted locally on the device using AsyncStorage

## Prototype limitations

Catalog items and cover art are sample data. Player buttons demonstrate app state only; no licensed streaming catalog or audio source is connected. Real playback requires audio files or an authorized streaming provider.
