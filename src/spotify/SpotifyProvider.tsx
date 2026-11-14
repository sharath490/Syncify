import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';
const TOKEN_KEY = 'syncify.spotify.tokens';
const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};
const redirectUri = AuthSession.makeRedirectUri({ scheme: 'syncify', path: 'spotify-auth' });

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  imageUrl: string | null;
  durationMs: number;
  spotifyUrl: string;
};

type StoredTokens = { accessToken: string; refreshToken?: string; expiresAt: number };
type SpotifyContextValue = {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  clientConfigured: boolean;
  connect: () => Promise<void>;
  searchTracks: (query: string) => Promise<SpotifyTrack[]>;
};

const SpotifyContext = createContext<SpotifyContextValue | null>(null);

export function SpotifyProvider({ children }: PropsWithChildren) {
  const [tokens, setTokens] = useState<StoredTokens | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    clientId: CLIENT_ID || 'missing-client-id',
    scopes: [],
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  }, discovery);

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(TOKEN_KEY)
      .then((value) => {
        if (!mounted || !value) return;
        const parsed: unknown = JSON.parse(value);
        if (parsed && typeof parsed === 'object' && 'accessToken' in parsed && 'expiresAt' in parsed) {
          setTokens(parsed as StoredTokens);
        }
      })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!response) return;
    if (response.type !== 'success') {
      if (response.type === 'error') setError(response.error?.message ?? 'Spotify sign-in was not completed.');
      setConnecting(false);
      return;
    }

    const code = response.params.code;
    if (!code || !request?.codeVerifier || !CLIENT_ID) {
      setError('Spotify sign-in could not be completed. Check the client ID and redirect URI configuration.');
      setConnecting(false);
      return;
    }

    let cancelled = false;
    AuthSession.exchangeCodeAsync({
      clientId: CLIENT_ID,
      code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier },
    }, discovery).then(async (result) => {
      const next: StoredTokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: Date.now() + (result.expiresIn ?? 3600) * 1000,
      };
      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(next));
      if (!cancelled) {
        setTokens(next);
        setError(null);
      }
    }).catch(() => {
      if (!cancelled) setError('Spotify token exchange failed. Verify the app redirect URI and try again.');
    }).finally(() => {
      if (!cancelled) setConnecting(false);
    });
    return () => { cancelled = true; };
  }, [response, request]);

  const connect = useCallback(async () => {
    if (!CLIENT_ID) {
      setError('Add EXPO_PUBLIC_SPOTIFY_CLIENT_ID to your environment before connecting Spotify.');
      return;
    }
    if (!request) {
      setError('Spotify sign-in is still loading. Try again in a moment.');
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      await promptAsync();
    } catch {
      setConnecting(false);
      setError('Could not open Spotify sign-in. Please try again.');
    }
  }, [promptAsync, request]);

  const getAccessToken = useCallback(async (): Promise<string> => {
    let current = tokens;
    if (!current) {
      const saved = await SecureStore.getItemAsync(TOKEN_KEY);
      current = saved ? JSON.parse(saved) as StoredTokens : null;
    }
    if (!current) throw new Error('Connect Spotify to search its catalog.');
    if (current.expiresAt > Date.now() + 60_000) return current.accessToken;
    if (!current.refreshToken) {
      setTokens(null);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      throw new Error('Spotify session expired. Connect again to continue.');
    }

    const refreshed = await AuthSession.refreshAsync({ clientId: CLIENT_ID, refreshToken: current.refreshToken }, discovery);
    const next: StoredTokens = {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? current.refreshToken,
      expiresAt: Date.now() + (refreshed.expiresIn ?? 3600) * 1000,
    };
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(next));
    setTokens(next);
    return next.accessToken;
  }, [tokens]);

  const searchTracks = useCallback(async (query: string): Promise<SpotifyTrack[]> => {
    const accessToken = await getAccessToken();
    const url = `https://api.spotify.com/v1/search?type=track&limit=20&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (response.status === 401) {
      setTokens(null);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      throw new Error('Spotify session expired. Connect again to search.');
    }
    if (!response.ok) throw new Error(`Spotify search failed (${response.status}). Try again.`);

    const payload = await response.json();
    return (payload.tracks?.items ?? []).map((item: any): SpotifyTrack => ({
      id: item.id,
      name: item.name,
      artists: (item.artists ?? []).map((artist: { name: string }) => artist.name),
      album: item.album?.name ?? 'Unknown album',
      imageUrl: item.album?.images?.[0]?.url ?? null,
      durationMs: item.duration_ms ?? 0,
      spotifyUrl: item.external_urls?.spotify ?? `https://open.spotify.com/track/${item.id}`,
    }));
  }, [getAccessToken]);

  const value = useMemo(() => ({
    connected: Boolean(tokens?.accessToken), connecting, error,
    clientConfigured: Boolean(CLIENT_ID), connect, searchTracks,
  }), [tokens, connecting, error, connect, searchTracks]);

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}

export function useSpotify() {
  const value = useContext(SpotifyContext);
  if (!value) throw new Error('useSpotify must be used inside SpotifyProvider');
  return value;
}
