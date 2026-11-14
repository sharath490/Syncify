import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { moods, playlists, tracks, type Track } from './src/data/music';

type TabParamList = {
  Discover: undefined;
  Search: undefined;
  Library: undefined;
  Radio: undefined;
};
type TabName = keyof TabParamList;

const Tab = createBottomTabNavigator<TabParamList>();
const FAVORITES_KEY = '@syncify/liked-track-ids';
const tabs: { name: TabName; icon: string }[] = [
  { name: 'Discover', icon: '⌂' },
  { name: 'Search', icon: '⌕' },
  { name: 'Library', icon: '▣' },
  { name: 'Radio', icon: '◉' },
];

function TrackRow({
  track,
  isSelected,
  liked,
  onPlay,
  onToggleLike,
}: {
  track: Track;
  isSelected: boolean;
  liked: boolean;
  onPlay: (track: Track) => void;
  onToggleLike: (id: string) => void;
}) {
  return (
    <View style={[styles.trackRow, isSelected && styles.trackRowActive]}>
      <Pressable style={styles.trackMain} onPress={() => onPlay(track)} accessibilityRole="button">
        <Image source={{ uri: track.cover }} style={styles.trackCover} />
        <View style={styles.trackMeta}>
          <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
          <Text numberOfLines={1} style={styles.trackArtist}>{track.artist}</Text>
        </View>
      </Pressable>
      <Text style={styles.trackDuration}>{track.duration}</Text>
      <Pressable
        onPress={() => onToggleLike(track.id)}
        style={styles.likeButton}
        accessibilityRole="button"
        accessibilityLabel={liked ? `Unlike ${track.title}` : `Like ${track.title}`}
      >
        <Text style={[styles.likeIcon, liked && styles.likedIcon]}>{liked ? '♥' : '♡'}</Text>
      </Pressable>
    </View>
  );
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.pageEyebrow}>{eyebrow}</Text>
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function App() {
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0].id);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0].id);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMood, setSelectedMood] = useState('All');
  const [favoritesReady, setFavoritesReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(FAVORITES_KEY)
      .then((stored) => {
        if (!mounted) return;
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setLikedIds(parsed.filter((id): id is string => typeof id === 'string' && tracks.some((track) => track.id === id)));
          }
        }
      })
      .catch(() => {
        // Keep the app usable if local storage is unavailable or has invalid data.
      })
      .finally(() => {
        if (mounted) setFavoritesReady(true);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (favoritesReady) {
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(likedIds)).catch(() => {
        // Favorites remain available for the current session if persistence fails.
      });
    }
  }, [favoritesReady, likedIds]);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0],
    [selectedTrackId]
  );
  const selectedPlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === selectedPlaylistId) ?? playlists[0],
    [selectedPlaylistId]
  );
  const savedTracks = useMemo(
    () => tracks.filter((track) => likedIds.includes(track.id)),
    [likedIds]
  );

  const playTrack = (track: Track) => {
    setSelectedTrackId(track.id);
    setIsPlaying(true);
  };
  const playNext = () => {
    const index = tracks.findIndex((track) => track.id === selectedTrackId);
    playTrack(tracks[(index + 1) % tracks.length]);
  };
  const toggleLike = (trackId: string) => {
    setLikedIds((current) => current.includes(trackId)
      ? current.filter((id) => id !== trackId)
      : [...current, trackId]);
  };

  const commonTrackProps = (track: Track) => ({
    track,
    isSelected: selectedTrackId === track.id,
    liked: likedIds.includes(track.id),
    onPlay: playTrack,
    onToggleLike: toggleLike,
  });

  const renderPlayer = () => (
    <View style={styles.playerBar}>
      <Image source={{ uri: selectedTrack.cover }} style={styles.playerCover} />
      <View style={styles.playerMeta}>
        <Text numberOfLines={1} style={styles.playerTitle}>{selectedTrack.title}</Text>
        <Text numberOfLines={1} style={styles.playerArtist}>{selectedTrack.artist}</Text>
      </View>
      <Pressable onPress={() => toggleLike(selectedTrack.id)} style={styles.playerAction} accessibilityLabel="Toggle like">
        <Text style={[styles.likeIcon, likedIds.includes(selectedTrack.id) && styles.likedIcon]}>
          {likedIds.includes(selectedTrack.id) ? '♥' : '♡'}
        </Text>
      </Pressable>
      <Pressable onPress={() => setIsPlaying((playing) => !playing)} style={styles.playerAction} accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
        <Text style={styles.playerControl}>{isPlaying ? 'Ⅱ' : '▶'}</Text>
      </Pressable>
      <Pressable onPress={playNext} style={styles.playerAction} accessibilityLabel="Next track">
        <Text style={styles.playerControl}>⏭</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appShell}>
        <View style={styles.topBar}>
          <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>S</Text></View>
          <Text style={styles.brandName}>syncify</Text>
          <Text style={styles.headerCaption}>MUSIC FOR YOUR MOMENT</Text>
        </View>

        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Discover"
            screenOptions={{ headerShown: false, lazy: false }}
            tabBar={(props) => (
              <View style={styles.bottomArea}>
                {renderPlayer()}
                <View style={styles.tabBar}>
                  {tabs.map((tab, index) => {
                    const focused = props.state.index === index;
                    return (
                      <Pressable
                        key={tab.name}
                        onPress={() => props.navigation.navigate(tab.name)}
                        style={styles.tabButton}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: focused }}
                      >
                        <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{tab.icon}</Text>
                        <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{tab.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          >
            <Tab.Screen name="Discover">
              {() => (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                  <View style={styles.featuredCard}>
                    <View style={styles.featuredGlow} />
                    <View style={styles.featuredContent}>
                      <Text style={styles.featuredEyebrow}>DAILY MIX</Text>
                      <Text style={styles.featuredTitle}>Midnight Echo</Text>
                      <Text style={styles.featuredSubtitle}>Synthwave · soul · cinematic chill</Text>
                      <Pressable style={styles.primaryButton} onPress={() => playTrack(tracks[0])}>
                        <Text style={styles.primaryButtonText}>▶   Play mix</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.featuredOrnament}>♫</Text>
                  </View>

                  <SectionTitle title="Made for your mood" />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
                    {['All', ...moods].map((mood) => (
                      <Pressable
                        key={mood}
                        onPress={() => setSelectedMood(mood)}
                        style={[styles.moodChip, selectedMood === mood && styles.moodChipActive]}
                      >
                        <Text style={[styles.moodText, selectedMood === mood && styles.moodTextActive]}>{mood}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <SectionTitle title="Curated playlists" action="EXPLORE" />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistRow}>
                    {playlists.map((playlist) => (
                      <Pressable key={playlist.id} onPress={() => setSelectedPlaylistId(playlist.id)} style={styles.playlistCard}>
                        <Image source={{ uri: playlist.cover }} style={styles.playlistImage} />
                        <Text numberOfLines={1} style={styles.playlistName}>{playlist.name}</Text>
                        <Text numberOfLines={1} style={styles.playlistMeta}>{playlist.subtitle}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <View style={styles.selectedPlaylist}>
                    <View style={styles.selectedPlaylistMeta}>
                      <Text style={styles.eyebrow}>CURRENT COLLECTION</Text>
                      <Text style={styles.selectedPlaylistName}>{selectedPlaylist.name}</Text>
                      <Text style={styles.playlistMeta}>{selectedPlaylist.subtitle}</Text>
                    </View>
                    <Pressable onPress={() => playTrack(tracks[Number(selectedPlaylist.id) % tracks.length])} style={styles.roundPlay}>
                      <Text style={styles.roundPlayText}>▶</Text>
                    </Pressable>
                  </View>

                  <SectionTitle title="Picked for you" action="TODAY" />
                  <View style={styles.trackList}>
                    {tracks.filter((track) => selectedMood === 'All' || track.vibe === selectedMood).map((track) => (
                      <TrackRow key={track.id} {...commonTrackProps(track)} />
                    ))}
                  </View>
                </ScrollView>
              )}
            </Tab.Screen>

            <Tab.Screen name="Search">
              {() => <SearchPage tracks={tracks} commonTrackProps={commonTrackProps} />}
            </Tab.Screen>

            <Tab.Screen name="Library">
              {() => (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                  <PageHeader eyebrow="YOUR COLLECTION" title="Library" subtitle={`${savedTracks.length} liked songs`} />
                  <View style={styles.libraryBanner}>
                    <Text style={styles.libraryHeart}>♥</Text>
                    <View>
                      <Text style={styles.libraryTitle}>Liked songs</Text>
                      <Text style={styles.librarySubtitle}>Saved on this device</Text>
                    </View>
                  </View>
                  {savedTracks.length ? (
                    <View style={styles.trackList}>{savedTracks.map((track) => <TrackRow key={track.id} {...commonTrackProps(track)} />)}</View>
                  ) : (
                    <EmptyState title="Your library is waiting" message="Tap the heart beside a track to save it here." />
                  )}
                </ScrollView>
              )}
            </Tab.Screen>

            <Tab.Screen name="Radio">
              {() => (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                  <PageHeader eyebrow="TUNE IN, ZONE OUT" title="Radio" subtitle="Stations for every side of you." />
                  <View style={styles.radioCard}>
                    <Text style={styles.radioOrb}>◉</Text>
                    <Text style={styles.eyebrow}>SYNCIFY ORIGINAL</Text>
                    <Text style={styles.radioTitle}>Syncify Selects</Text>
                    <Text style={styles.radioSubtitle}>Fresh finds for your day, curated around the music you love.</Text>
                    <Pressable style={styles.primaryButton} onPress={() => playTrack(tracks[2])}>
                      <Text style={styles.primaryButtonText}>▶   Listen now</Text>
                    </Pressable>
                  </View>
                  <SectionTitle title="Featured tracks" />
                  <View style={styles.trackList}>{tracks.slice(1, 5).map((track) => <TrackRow key={track.id} {...commonTrackProps(track)} />)}</View>
                </ScrollView>
              )}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaView>
  );
}

function SearchPage({
  tracks: catalog,
  commonTrackProps,
}: {
  tracks: Track[];
  commonTrackProps: (track: Track) => {
    track: Track;
    isSelected: boolean;
    liked: boolean;
    onPlay: (track: Track) => void;
    onToggleLike: (id: string) => void;
  };
}) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return catalog;
    return catalog.filter((track) => `${track.title} ${track.artist} ${track.vibe}`.toLowerCase().includes(term));
  }, [catalog, query]);

  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <PageHeader eyebrow="SEARCH" title="Find your sound" subtitle="Search songs, artists, or a mood." />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="What do you want to hear?"
        placeholderTextColor="#8590a8"
        style={styles.searchInput}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="Search songs, artists, or moods"
      />
      <SectionTitle title={query ? 'Search results' : 'All tracks'} action={`${results.length} TRACKS`} />
      {results.length ? (
        <View style={styles.trackList}>{results.map((track) => <TrackRow key={track.id} {...commonTrackProps(track)} />)}</View>
      ) : (
        <EmptyState title="No matches found" message="Try another song, artist, or mood." />
      )}
    </ScrollView>
  );
}

export default App;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090d18' },
  appShell: { flex: 1, backgroundColor: '#090d18' },
  topBar: { height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  brandBadge: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#a3e635', alignItems: 'center', justifyContent: 'center' },
  brandBadgeText: { color: '#15210a', fontSize: 18, fontWeight: '900' },
  brandName: { marginLeft: 9, color: '#f5f7ff', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  headerCaption: { marginLeft: 'auto', color: '#66718a', fontSize: 8, fontWeight: '800', letterSpacing: 1.2 },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 22, backgroundColor: '#090d18' },
  featuredCard: { height: 236, backgroundColor: '#30224c', borderRadius: 26, overflow: 'hidden', justifyContent: 'center', marginBottom: 18 },
  featuredGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#e94c9b', opacity: 0.55, top: -34, right: -40 },
  featuredContent: { paddingHorizontal: 22, zIndex: 1 },
  featuredEyebrow: { color: '#d8caf7', fontSize: 9, letterSpacing: 2, fontWeight: '900' },
  featuredTitle: { color: '#fff', fontSize: 37, fontWeight: '900', letterSpacing: -1, marginTop: 12 },
  featuredSubtitle: { color: '#e8dff2', fontSize: 12, marginTop: 6 },
  featuredOrnament: { position: 'absolute', right: 18, bottom: 13, color: '#ffc0df', fontSize: 64, opacity: 0.7 },
  primaryButton: { backgroundColor: '#a3e635', alignSelf: 'flex-start', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, marginTop: 17 },
  primaryButtonText: { color: '#182306', fontSize: 12, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 10 },
  sectionTitle: { color: '#f1f3fb', fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  sectionAction: { color: '#8e9ab4', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  moodRow: { paddingVertical: 4, paddingBottom: 14 },
  moodChip: { borderWidth: 1, borderColor: '#242e42', backgroundColor: '#141b2a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, marginRight: 8 },
  moodChipActive: { backgroundColor: '#a3e635', borderColor: '#a3e635' },
  moodText: { color: '#c4ccdd', fontSize: 11, fontWeight: '700' },
  moodTextActive: { color: '#182306' },
  playlistRow: { paddingBottom: 8 },
  playlistCard: { width: 148, marginRight: 13 },
  playlistImage: { width: 148, height: 148, borderRadius: 18, backgroundColor: '#1b263b', marginBottom: 8 },
  playlistName: { color: '#eff2fb', fontSize: 13, fontWeight: '800' },
  playlistMeta: { color: '#8792ab', fontSize: 10, marginTop: 4 },
  selectedPlaylist: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121b2c', borderRadius: 18, padding: 15, marginTop: 8, marginBottom: 11 },
  selectedPlaylistMeta: { flex: 1 },
  eyebrow: { color: '#a3e635', fontSize: 8, letterSpacing: 1.4, fontWeight: '900' },
  selectedPlaylistName: { color: '#f4f6fc', fontSize: 17, fontWeight: '800', marginTop: 6 },
  roundPlay: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#a3e635', alignItems: 'center', justifyContent: 'center' },
  roundPlayText: { color: '#182306', fontSize: 14, fontWeight: '900' },
  trackList: { marginBottom: 10 },
  trackRow: { minHeight: 65, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, borderRadius: 14, marginBottom: 3 },
  trackRowActive: { backgroundColor: '#131b2b' },
  trackMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  trackCover: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#202a40' },
  trackMeta: { flex: 1, marginLeft: 11, marginRight: 6 },
  trackTitle: { color: '#f0f3fb', fontSize: 12, fontWeight: '800' },
  trackArtist: { color: '#8994ae', fontSize: 10, marginTop: 4 },
  trackDuration: { color: '#8590a8', fontSize: 10, marginRight: 6 },
  likeButton: { padding: 8 },
  likeIcon: { color: '#9aa5bd', fontSize: 18 },
  likedIcon: { color: '#a3e635' },
  pageHeader: { marginTop: 12, marginBottom: 20 },
  pageEyebrow: { color: '#a3e635', fontSize: 9, fontWeight: '900', letterSpacing: 1.8, marginBottom: 8 },
  pageTitle: { color: '#f3f5fc', fontSize: 32, fontWeight: '900', letterSpacing: -0.8 },
  pageSubtitle: { color: '#909bb3', fontSize: 12, marginTop: 7 },
  searchInput: { height: 50, color: '#f3f5fc', backgroundColor: '#141c2b', borderRadius: 15, borderWidth: 1, borderColor: '#253047', paddingHorizontal: 15, fontSize: 13, marginBottom: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 44, paddingHorizontal: 20 },
  emptyTitle: { color: '#f0f3fb', fontSize: 16, fontWeight: '800' },
  emptyText: { color: '#8b96ae', fontSize: 11, textAlign: 'center', marginTop: 8, lineHeight: 17 },
  libraryBanner: { backgroundColor: '#252044', borderRadius: 18, minHeight: 83, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  libraryHeart: { width: 42, height: 42, textAlign: 'center', textAlignVertical: 'center', color: '#f2d2ff', fontSize: 24, backgroundColor: '#352b5a', borderRadius: 13, overflow: 'hidden', marginRight: 13 },
  libraryTitle: { color: '#f2f4fb', fontSize: 14, fontWeight: '800' },
  librarySubtitle: { color: '#a6a2c0', fontSize: 10, marginTop: 5 },
  radioCard: { minHeight: 230, backgroundColor: '#102d35', borderRadius: 24, padding: 22, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 20 },
  radioOrb: { position: 'absolute', top: 8, right: 16, color: '#7fd4a8', fontSize: 100, opacity: 0.55 },
  radioTitle: { color: '#f3f8f6', fontSize: 23, fontWeight: '900', marginTop: 10 },
  radioSubtitle: { color: '#b2c9c4', fontSize: 12, lineHeight: 18, marginTop: 6 },
  bottomArea: { backgroundColor: '#090d18' },
  playerBar: { height: 61, marginHorizontal: 12, marginTop: 5, marginBottom: 6, backgroundColor: '#141d2e', borderWidth: 1, borderColor: '#222f45', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  playerCover: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#202a40' },
  playerMeta: { flex: 1, marginLeft: 9 },
  playerTitle: { color: '#f2f4fb', fontSize: 11, fontWeight: '800' },
  playerArtist: { color: '#8793ad', fontSize: 9, marginTop: 3 },
  playerAction: { paddingHorizontal: 8, paddingVertical: 10 },
  playerControl: { color: '#f4f6fc', fontSize: 15, fontWeight: '800' },
  tabBar: { height: 55, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1b2537' },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { color: '#68748c', fontSize: 19 },
  tabIconActive: { color: '#a3e635' },
  tabLabel: { color: '#68748c', fontSize: 9, fontWeight: '700', marginTop: 2 },
  tabLabelActive: { color: '#a3e635' },
});
