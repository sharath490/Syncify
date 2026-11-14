import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AudioPlayerProvider, useAudioPlayer } from './src/audio/AudioPlayerContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpotifyProvider } from './src/spotify/SpotifyProvider';
import { SpotifySearchScreen } from './src/spotify/SpotifySearchScreen';
import { tracks, type Track } from './src/data/music';

type TabParams = { Discover: undefined; Search: undefined; Library: undefined; Radio: undefined };
type TabName = keyof TabParams;
const Tab = createBottomTabNavigator<TabParams>();
const FAVORITES_KEY = '@syncify/liked-track-ids';
const tabs: { name: TabName; icon: string }[] = [
  { name: 'Discover', icon: '⌂' }, { name: 'Search', icon: '⌕' }, { name: 'Library', icon: '▣' }, { name: 'Radio', icon: '◉' },
];

function TrackRow({ track, selected, liked, onPlay, onLike }: { track: Track; selected: boolean; liked: boolean; onPlay: (track: Track) => void; onLike: (id: string) => void }) {
  return <View style={[styles.trackRow, selected && styles.trackRowActive]}><Pressable style={styles.trackMain} onPress={() => onPlay(track)}><View style={styles.trackCover}><Text style={styles.coverGlyph}>♫</Text></View><View style={styles.trackMeta}><Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text><Text numberOfLines={1} style={styles.trackArtist}>{track.artist} · {track.vibe}</Text></View></Pressable><Text style={styles.duration}>{track.duration}</Text><Pressable style={styles.like} onPress={() => onLike(track.id)} accessibilityLabel={liked ? 'Unlike track' : 'Like track'}><Text style={[styles.heart, liked && styles.liked]}>{liked ? '♥' : '♡'}</Text></Pressable></View>;
}

function AppShell() {
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [mood, setMood] = useState('All');
  const player = useAudioPlayer();

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(FAVORITES_KEY).then((stored) => {
      if (!active || !stored) return;
      const ids: unknown = JSON.parse(stored);
      if (Array.isArray(ids)) setLikedIds(ids.filter((id): id is string => typeof id === 'string' && tracks.some((track) => track.id === id)));
    }).catch(() => undefined).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => { if (ready) AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(likedIds)).catch(() => undefined); }, [ready, likedIds]);
  const toggleLike = (id: string) => setLikedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const playTrack = (track: Track) => { void player.play(track.id); };

  const Player = () => <View style={styles.player}><View style={styles.playerMeta}><Text numberOfLines={1} style={styles.playerTitle}>{player.track.title}</Text><Text numberOfLines={1} style={styles.playerArtist}>{player.error ? 'Preview unavailable' : `${player.track.artist} · demo preview`}</Text></View><Pressable onPress={() => toggleLike(player.track.id)}><Text style={[styles.heart, likedIds.includes(player.track.id) && styles.liked]}>{likedIds.includes(player.track.id) ? '♥' : '♡'}</Text></Pressable><Pressable onPress={() => void player.toggle()} style={styles.control}><Text style={styles.controlText}>{player.isPlaying ? 'Ⅱ' : '▶'}</Text></Pressable><Pressable onPress={() => void player.next()} style={styles.control}><Text style={styles.controlText}>⏭</Text></Pressable></View>;

  return <SafeAreaView style={styles.safe}><View style={styles.shell}><View style={styles.header}><Text style={styles.brand}>SYNCIFY</Text><Text style={styles.tagline}>MUSIC FOR YOUR MOMENT</Text></View><NavigationContainer><Tab.Navigator screenOptions={{ headerShown: false, lazy: false }} tabBar={(props) => <View style={styles.bottom}><Player /><View style={styles.tabs}>{tabs.map((tab, index) => { const selected = props.state.index === index; return <Pressable key={tab.name} onPress={() => props.navigation.navigate(tab.name)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected }}><Text style={[styles.tabIcon, selected && styles.tabSelected]}>{tab.icon}</Text><Text style={[styles.tabLabel, selected && styles.tabSelected]}>{tab.name}</Text></Pressable>; })}</View></View>}>
    <Tab.Screen name="Discover">{() => <View style={styles.page}><Text style={styles.eyebrow}>MADE FOR YOU</Text><Text style={styles.heading}>Discover</Text><Text style={styles.hero}>Find your next{ '\n' }favorite sound.</Text><Text style={styles.section}>Choose a mood</Text><View style={styles.moods}>{['All', 'Focus', 'Chill', 'Night Drive', 'Workout', 'Lo-fi', 'Mood Boost'].map((item) => <Pressable key={item} onPress={() => setMood(item)} style={[styles.mood, mood === item && styles.moodOn]}><Text style={[styles.moodText, mood === item && styles.moodTextOn]}>{item}</Text></Pressable>)}</View><Text style={styles.section}>Sample catalog · demo audio</Text>{tracks.filter((track) => mood === 'All' || track.vibe === mood).map((track) => <TrackRow key={track.id} track={track} selected={player.track.id === track.id} liked={likedIds.includes(track.id)} onPlay={playTrack} onLike={toggleLike} />)}</View>}</Tab.Screen>
    <Tab.Screen name="Search" component={SpotifySearchScreen} />
    <Tab.Screen name="Library">{() => <View style={styles.page}><Text style={styles.eyebrow}>YOUR COLLECTION</Text><Text style={styles.heading}>Library</Text><Text style={styles.section}>Liked songs · {likedIds.length}</Text>{tracks.filter((track) => likedIds.includes(track.id)).map((track) => <TrackRow key={track.id} track={track} selected={player.track.id === track.id} liked onPlay={playTrack} onLike={toggleLike} />)}{likedIds.length === 0 ? <Text style={styles.empty}>Like a demo track on Discover to save it here.</Text> : null}</View>}</Tab.Screen>
    <Tab.Screen name="Radio">{() => <View style={styles.page}><Text style={styles.eyebrow}>RADIO</Text><Text style={styles.heading}>Syncify Selects</Text><Text style={styles.hero}>Fresh finds for your day.</Text><Text style={styles.section}>Demo station</Text>{tracks.slice(1, 5).map((track) => <TrackRow key={track.id} track={track} selected={player.track.id === track.id} liked={likedIds.includes(track.id)} onPlay={playTrack} onLike={toggleLike} />)}</View>}</Tab.Screen>
  </Tab.Navigator></NavigationContainer></View></SafeAreaView>;
}

export default function App() {
  return <SpotifyProvider><AudioPlayerProvider><AppShell /></AudioPlayerProvider></SpotifyProvider>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#090d18' }, shell: { flex: 1, backgroundColor: '#090d18' }, header: { height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }, brand: { color: '#a3e635', fontSize: 16, fontWeight: '900', letterSpacing: 1.2 }, tagline: { color: '#6f7a92', fontSize: 8, marginLeft: 'auto', letterSpacing: 1 },
  page: { flexGrow: 1, padding: 20, backgroundColor: '#090d18' }, eyebrow: { color: '#a3e635', fontSize: 9, fontWeight: '900', letterSpacing: 1.8, marginTop: 16 }, heading: { color: '#f4f6fc', fontSize: 31, fontWeight: '900', marginTop: 7 }, hero: { color: '#eaf0fb', fontSize: 23, fontWeight: '800', marginTop: 18, marginBottom: 20, backgroundColor: '#202345', borderRadius: 20, padding: 22, overflow: 'hidden' }, section: { color: '#f1f3fb', fontSize: 17, fontWeight: '800', marginTop: 18, marginBottom: 8 }, moods: { flexDirection: 'row', flexWrap: 'wrap' }, mood: { backgroundColor: '#141b2a', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, marginRight: 7, marginBottom: 8 }, moodOn: { backgroundColor: '#a3e635' }, moodText: { color: '#c4ccdd', fontSize: 11, fontWeight: '700' }, moodTextOn: { color: '#182306' },
  trackRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 5 }, trackRowActive: { backgroundColor: '#141d2e' }, trackMain: { flex: 1, flexDirection: 'row', alignItems: 'center' }, trackCover: { width: 44, height: 44, borderRadius: 9, backgroundColor: '#202a40', alignItems: 'center', justifyContent: 'center' }, coverGlyph: { color: '#a3e635', fontSize: 20 }, trackMeta: { flex: 1, marginLeft: 10 }, trackTitle: { color: '#f3f5fb', fontSize: 12, fontWeight: '800' }, trackArtist: { color: '#8e99b0', fontSize: 10, marginTop: 4 }, duration: { color: '#8792aa', fontSize: 10, marginRight: 6 }, like: { padding: 8 }, heart: { color: '#9aa5bd', fontSize: 18 }, liked: { color: '#a3e635' }, empty: { color: '#8e99b0', fontSize: 12, marginTop: 24 },
  bottom: { backgroundColor: '#090d18' }, player: { height: 59, marginHorizontal: 12, marginVertical: 5, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', borderRadius: 15, backgroundColor: '#141d2e', borderWidth: 1, borderColor: '#222f45' }, playerMeta: { flex: 1 }, playerTitle: { color: '#f4f6fc', fontSize: 11, fontWeight: '800' }, playerArtist: { color: '#8994ac', fontSize: 9, marginTop: 3 }, control: { paddingHorizontal: 10, paddingVertical: 8 }, controlText: { color: '#f2f4fb', fontWeight: '900', fontSize: 15 }, tabs: { height: 54, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1b2537' }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center' }, tabIcon: { color: '#68748c', fontSize: 19 }, tabLabel: { color: '#68748c', fontSize: 9, fontWeight: '700', marginTop: 2 }, tabSelected: { color: '#a3e635' },
});
