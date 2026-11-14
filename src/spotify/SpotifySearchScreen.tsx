import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSpotify, type SpotifyTrack } from './SpotifyProvider';

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function SpotifySearchScreen() {
  const spotify = useSpotify();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const term = query.trim();
    if (!spotify.connected || term.length < 2) {
      setResults([]);
      setLoading(false);
      setMessage(null);
      return;
    }

    let active = true;
    setLoading(true);
    setMessage(null);
    const timer = setTimeout(() => {
      spotify.searchTracks(term).then((items) => {
        if (active) setResults(items);
      }).catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : 'Spotify search failed.');
      }).finally(() => {
        if (active) setLoading(false);
      });
    }, 350);

    return () => { active = false; clearTimeout(timer); };
  }, [query, spotify.connected, spotify.searchTracks]);

  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>SPOTIFY CATALOG</Text>
      <Text style={styles.title}>Find your sound</Text>
      <Text style={styles.subtitle}>Search Spotify’s catalog and open tracks in Spotify.</Text>

      {!spotify.connected ? (
        <View style={styles.connectCard}>
          <Text style={styles.connectTitle}>Connect your Spotify account</Text>
          <Text style={styles.connectCopy}>Sign in securely to search the Spotify catalog. Syncify does not receive your Spotify password.</Text>
          <Pressable disabled={spotify.connecting || !spotify.clientConfigured} onPress={() => void spotify.connect()} style={[styles.connectButton, (spotify.connecting || !spotify.clientConfigured) && styles.disabled]}>
            {spotify.connecting ? <ActivityIndicator color="#14200a" /> : <Text style={styles.connectButtonText}>{spotify.clientConfigured ? 'Connect Spotify' : 'Spotify setup required'}</Text>}
          </Pressable>
          {!spotify.clientConfigured ? <Text style={styles.setupHint}>Set EXPO_PUBLIC_SPOTIFY_CLIENT_ID and register the Syncify redirect URI in your Spotify developer app.</Text> : null}
          {spotify.error ? <Text style={styles.error}>{spotify.error}</Text> : null}
        </View>
      ) : (
        <>
          <TextInput value={query} onChangeText={setQuery} placeholder="Search songs, artists, albums" placeholderTextColor="#7d879e" style={styles.search} autoCapitalize="none" returnKeyType="search" accessibilityLabel="Search Spotify catalog" />
          <Text style={styles.connected}>●  Spotify connected</Text>
          {loading ? <ActivityIndicator color="#a3e635" style={styles.loader} /> : null}
          {message ? <Text style={styles.error}>{message}</Text> : null}
          {!query.trim() ? <Text style={styles.hint}>Enter at least two characters to search.</Text> : null}
          {query.trim().length >= 2 && !loading && !message && results.length === 0 ? <Text style={styles.hint}>No tracks found.</Text> : null}
          {results.map((track) => (
            <Pressable key={track.id} onPress={() => void Linking.openURL(track.spotifyUrl)} style={styles.trackRow} accessibilityRole="link">
              {track.imageUrl ? <Image source={{ uri: track.imageUrl }} style={styles.cover} /> : <View style={styles.coverFallback}><Text style={styles.fallbackGlyph}>♫</Text></View>}
              <View style={styles.meta}>
                <Text numberOfLines={1} style={styles.trackTitle}>{track.name}</Text>
                <Text numberOfLines={1} style={styles.trackSubtitle}>{track.artists.join(', ')} · {track.album}</Text>
              </View>
              <Text style={styles.duration}>{formatDuration(track.durationMs)}</Text>
              <Text style={styles.openIcon}>↗</Text>
            </Pressable>
          ))}
          <Text style={styles.disclaimer}>Spotify catalog search is integrated. Full Spotify playback is controlled by Spotify and requires an eligible Spotify account/device; Syncify opens the selected track in Spotify.</Text>
        </>
      )}
      {spotify.error && spotify.connected ? <Text style={styles.error}>{spotify.error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 20, backgroundColor: '#090d18', paddingBottom: 28 },
  eyebrow: { color: '#a3e635', fontSize: 9, fontWeight: '900', letterSpacing: 1.8, marginTop: 16 },
  title: { color: '#f3f5fc', fontSize: 30, fontWeight: '900', marginTop: 7 },
  subtitle: { color: '#929db5', fontSize: 12, marginTop: 6, marginBottom: 20 },
  connectCard: { backgroundColor: '#151d2d', borderColor: '#273249', borderWidth: 1, borderRadius: 18, padding: 18 },
  connectTitle: { color: '#f5f7fc', fontSize: 16, fontWeight: '800' },
  connectCopy: { color: '#9da8bd', fontSize: 12, lineHeight: 18, marginTop: 8 },
  connectButton: { backgroundColor: '#a3e635', borderRadius: 22, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingHorizontal: 18 },
  connectButtonText: { color: '#17220a', fontWeight: '900', fontSize: 12 },
  disabled: { opacity: 0.55 },
  setupHint: { color: '#b5a981', fontSize: 10, lineHeight: 15, marginTop: 11 },
  error: { color: '#ff8b9b', fontSize: 11, lineHeight: 16, marginTop: 12 },
  search: { height: 50, borderRadius: 15, backgroundColor: '#151d2b', borderWidth: 1, borderColor: '#273249', color: '#f4f6fb', paddingHorizontal: 15, fontSize: 13 },
  connected: { color: '#a3e635', fontSize: 10, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  loader: { marginVertical: 20 },
  hint: { color: '#8994aa', fontSize: 12, textAlign: 'center', marginTop: 25 },
  trackRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#1b2435' },
  cover: { width: 46, height: 46, borderRadius: 9, backgroundColor: '#202a40' },
  coverFallback: { width: 46, height: 46, borderRadius: 9, backgroundColor: '#202a40', alignItems: 'center', justifyContent: 'center' },
  fallbackGlyph: { color: '#a3e635', fontSize: 20 },
  meta: { flex: 1, marginLeft: 11, marginRight: 6 },
  trackTitle: { color: '#f3f5fc', fontSize: 12, fontWeight: '800' },
  trackSubtitle: { color: '#909bb3', fontSize: 10, marginTop: 4 },
  duration: { color: '#8994aa', fontSize: 10, marginRight: 9 },
  openIcon: { color: '#a3e635', fontSize: 16, paddingHorizontal: 3 },
  disclaimer: { color: '#737e94', fontSize: 10, lineHeight: 15, marginTop: 18 },
});
