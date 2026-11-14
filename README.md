# Syncify

Cross-platform music discovery prototype built with Expo, React Native, and TypeScript.

## Run locally

```bash
npm install
npm run typecheck
npx expo start
```

## Current features

- Discover, Search, Library, and Radio tabs
- Search by title, artist, and mood; mood-based discovery filters
- Shared mini-player with play, pause, next-track, and end-of-track advance
- Likes saved locally on the device with AsyncStorage
- Real audio playback of public SoundHelix example streams through Expo AV

## QA notes / limitations

Audio URLs are sample streams for development and playback testing; the displayed track names are mock catalog metadata and do not describe the actual SoundHelix recordings. Network access is required. This is not a licensed commercial music catalog. Replace sample sources with authorized previews/catalog playback before release.

The app has been reviewed for navigation, storage, and playback state handling, but this repository update was not executed in a local Expo/iOS/Android build environment. Validate with `npm install`, `npm run typecheck`, and a device/simulator playback check.
