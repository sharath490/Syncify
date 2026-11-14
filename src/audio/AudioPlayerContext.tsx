import { Audio, type AVPlaybackStatus } from 'expo-av';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { tracks, type Track } from '../data/music';

type AudioPlayerValue = {
  track: Track;
  isPlaying: boolean;
  error: string | null;
  play: (trackId?: string) => Promise<void>;
  toggle: () => Promise<void>;
  next: () => Promise<void>;
};

const AudioPlayerContext = createContext<AudioPlayerValue | null>(null);

export function AudioPlayerProvider({ children }: PropsWithChildren) {
  const [trackId, setTrackId] = useState(tracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const wantsPlaybackRef = useRef(false);
  const advanceRef = useRef<() => void>(() => undefined);
  const track = useMemo(() => tracks.find((item) => item.id === trackId) ?? tracks[0], [trackId]);

  const advance = useCallback(() => {
    setTrackId((current) => {
      const index = tracks.findIndex((item) => item.id === current);
      return tracks[(index + 1) % tracks.length].id;
    });
    wantsPlaybackRef.current = true;
    setIsPlaying(true);
  }, []);
  advanceRef.current = advance;

  useEffect(() => {
    let active = true;
    let createdSound: Audio.Sound | null = null;
    setError(null);

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        const result = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: false, progressUpdateIntervalMillis: 500 },
          (status: AVPlaybackStatus) => {
            if (!active || !status.isLoaded) return;
            if (status.error) setError('Could not load this audio preview.');
            if (status.didJustFinish) advanceRef.current();
          }
        );
        createdSound = result.sound;
        if (!active) {
          await result.sound.unloadAsync();
          return;
        }
        soundRef.current = result.sound;
        if (wantsPlaybackRef.current) await result.sound.playAsync();
      } catch {
        if (active) {
          setError('Preview could not be played. Check your connection and try again.');
          wantsPlaybackRef.current = false;
          setIsPlaying(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
      if (soundRef.current === createdSound) soundRef.current = null;
      if (createdSound) void createdSound.unloadAsync().catch(() => undefined);
    };
  }, [track.id, track.audioUrl]);

  const play = useCallback(async (nextTrackId?: string) => {
    const nextId = nextTrackId ?? trackId;
    if (nextId !== trackId) {
      wantsPlaybackRef.current = true;
      setIsPlaying(true);
      setTrackId(nextId);
      setError(null);
      return;
    }
    wantsPlaybackRef.current = true;
    setIsPlaying(true);
    setError(null);
    try {
      if (soundRef.current) await soundRef.current.playAsync();
    } catch {
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      setError('Preview could not be played. Check your connection and try again.');
    }
  }, [trackId]);

  const toggle = useCallback(async () => {
    if (wantsPlaybackRef.current) {
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      try { await soundRef.current?.pauseAsync(); } catch { setError('Unable to pause the preview.'); }
    } else {
      await play();
    }
  }, [play]);

  const next = useCallback(async () => {
    wantsPlaybackRef.current = true;
    setIsPlaying(true);
    advance();
  }, [advance]);

  useEffect(() => () => {
    wantsPlaybackRef.current = false;
    if (soundRef.current) void soundRef.current.unloadAsync().catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ track, isPlaying, error, play, toggle, next }), [track, isPlaying, error, play, toggle, next]);
  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const value = useContext(AudioPlayerContext);
  if (!value) throw new Error('useAudioPlayer must be used inside AudioPlayerProvider');
  return value;
}
