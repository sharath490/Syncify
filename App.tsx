import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
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

type Tab = 'Discover' | 'Search' | 'Library' | 'Radio';
const tabs: { name: Tab; icon: string }[] = [
  { name: 'Discover', icon: '⌂' },
  { name: 'Search', icon: '⌕' },
  { name: 'Library', icon: '▤' },
  { name: 'Radio', icon: '◉' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Discover');
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>(['t2']);
  const [query, setQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('All');

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0],
    [selectedTrackId]
  );
  const visibleTracks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tracks.filter((track) => {
      const matchesQuery = !normalizedQuery ||
        `${track.title} ${track.artist}`.toLowerCase().includes(normalizedQuery);
      const matchesLibrary = activeTab !== 'Library' || likedIds.includes(track.id);
      return matchesQuery && matchesLibrary;
    });
  }, [activeTab, likedIds, query]);

  const playTrack = (track: Track) => {
    setSelectedTrackId(track.id);
    setIsPlaying(true);
  };

  const playNext = (direction: 1 | -1 = 1) => {
    const currentIndex = tracks.findIndex((track) => track.id === selectedTrackId);
    const nextIndex = (currentIndex + direction + tracks.length) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const toggleLike = (trackId: string) => {
    setLikedIds((current) => current.includes(trackId)
      ? current.filter((id) => id !== trackId)
      : [...current, trackId]);
  };

  const renderTrack = (track: Track) => (
    <View key={track.id} style={[styles.trackRow, selectedTrackId === track.id && styles.trackRowActive]}>
      <Pressable style={styles.trackMain} onPress={() => playTrack(track)} accessibilityRole="button">
        <Image source={{ uri: track.cover }} style={styles.trackCover} />
        <View style={styles.trackDetails}>
          <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
          <Text numberOfLines={1} style={styles.trackArtist}>{track.artist}</Text>
        </View>
      </Pressable>
      <Text style={styles.trackDuration}>{track.duration}</Text>
      <Pressable
        onPress={() => toggleLike(track.id)}
        style={styles.likeButton}
        accessibilityLabel={likedIds.includes(track.id) ? 'Remove from liked songs' : 'Add to liked songs'}
      >
        <Text style={[styles.likeIcon, likedIds.includes(track.id) && styles.likedIcon]}>
          {likedIds.includes(track.id) ? '♥' : '♡'}
        </Text>
      </Pressable>
    </View>
  );

  const sectionHeader = (title: string, action?: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );

  const renderDiscover = () => (
    <>
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <View style={styles.heroContent}>
          <Text style={styles.eyebrow}>YOUR DAILY MIX</Text>
          <Text style={styles.heroTitle}>Midnight{ '\n' }Echo</Text>
          <Text style={styles.heroSubtitle}>A little synth, a little soul. All yours.</Text>
          <Pressable style={styles.playButton} onPress={() => playTrack(tracks[0])}>
            <Text style={styles.playButtonText}>▶  Play mix</Text>
          </Pressable>
        </View>
        <Text style={styles.heroOrnament}>♫</Text>
      </View>

      {sectionHeader('Made for your mood')}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodList}>
        {['All', ...moods].map((mood) => (
          <Pressable
            key={mood}
            onPress={() => setSelectedMood(mood)}
            style={[styles.moodChip, selectedMood === mood && styles.moodChipSelected]}
          >
            <Text style={[styles.moodText, selectedMood === mood && styles.moodTextSelected]}>{mood}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {sectionHeader('Your soundtrack', 'See all')}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistList}>
        {playlists.map((playlist) => (
          <Pressable key={playlist.id} style={styles.playlistCard} onPress={() => playTrack(tracks[Number(playlist.id) % tracks.length])}>
            <Image source={{ uri: playlist.cover }} style={styles.playlistCover} />
            <Text numberOfLines={1} style={styles.playlistTitle}>{playlist.name}</Text>
            <Text numberOfLines={1} style={styles.playlistSubtitle}>{playlist.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {sectionHeader('Picked for you', '•••')}
      <View style={styles.trackList}>{tracks.map(renderTrack)}</View>
    </>
  );

  const renderTrackCollection = (title: string, subtitle: string) => (
    <>
      <View style={styles.pageHeading}>
        <Text style={styles.pageEyebrow}>{subtitle}</Text>
        <Text style={styles.pageTitle}>{title}</Text>
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search songs or artists"
        placeholderTextColor="#77809a"
        style={styles.searchInput}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {activeTab === 'Library' && (
        <View style={styles.libraryBanner}>
          <Text style={styles.libraryIcon}>♥</Text>
          <View style={styles.libraryCopy}>
            <Text style={styles.libraryTitle}>Liked songs</Text>
            <Text style={styles.librarySubtitle}>{likedIds.length} songs saved</Text>
          </View>
        </View>
      )}
      {sectionHeader(activeTab === 'Library' ? 'Your favorites' : 'Songs')}
      {visibleTracks.length ? (
        <View style={styles.trackList}>{visibleTracks.map(renderTrack)}</View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{activeTab === 'Library' ? 'Your library is waiting' : 'No matches yet'}</Text>
          <Text style={styles.emptyText}>{activeTab === 'Library' ? 'Tap the heart beside a song to save it here.' : 'Try a different song or artist.'}</Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.app}>
        <View style={styles.topBar}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>S</Text></View>
          <Text style={styles.brandName}>syncify</Text>
          <Pressable style={styles.profileButton} accessibilityLabel="Profile">
            <Text style={styles.profileInitial}>S</Text>
          </Pressable>
        </View>

        <ScrollView
          key={activeTab}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.pageContent}
        >
          {activeTab === 'Discover' && renderDiscover()}
          {activeTab === 'Search' && renderTrackCollection('Find your sound', 'SEARCH')}
          {activeTab === 'Library' && renderTrackCollection('Your library', 'COLLECTION')}
          {activeTab === 'Radio' && (
            <>
              <View style={styles.pageHeading}>
                <Text style={styles.pageEyebrow}>TUNE IN, ZONE OUT</Text>
                <Text style={styles.pageTitle}>Radio</Text>
                <Text style={styles.radioDescription}>Stations for every side of you.</Text>
              </View>
              <View style={styles.radioCard}>
                <Text style={styles.radioIcon}>◉</Text>
                <Text style={styles.radioTitle}>Syncify Selects</Text>
                <Text style={styles.radioSubtitle}>Fresh finds, chosen for your day</Text>
                <Pressable style={styles.playButton} onPress={() => playTrack(tracks[2])}>
                  <Text style={styles.playButtonText}>▶  Listen now</Text>
                </Pressable>
              </View>
              {sectionHeader('Featured stations')}
              <View style={styles.trackList}>{tracks.slice(1, 4).map(renderTrack)}</View>
            </>
          )}
        </ScrollView>

        <View style={styles.bottomArea}>
          <Pressable style={styles.miniPlayer} onPress={() => setIsPlaying((playing) => !playing)}>
            <Image source={{ uri: selectedTrack.cover }} style={styles.miniCover} />
            <View style={styles.miniDetails}>
              <Text numberOfLines={1} style={styles.miniTitle}>{selectedTrack.title}</Text>
              <Text numberOfLines={1} style={styles.miniArtist}>{selectedTrack.artist}</Text>
            </View>
            <Pressable onPress={() => toggleLike(selectedTrack.id)} style={styles.miniAction} accessibilityLabel="Like current song">
              <Text style={[styles.likeIcon, likedIds.includes(selectedTrack.id) && styles.likedIcon]}>{likedIds.includes(selectedTrack.id) ? '♥' : '♡'}</Text>
            </Pressable>
            <Pressable onPress={() => setIsPlaying((playing) => !playing)} style={styles.miniAction} accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
              <Text style={styles.miniPlayIcon}>{isPlaying ? 'Ⅱ' : '▶'}</Text>
            </Pressable>
            <Pressable onPress={() => playNext()} style={styles.miniAction} accessibilityLabel="Next song">
              <Text style={styles.miniPlayIcon}>▶|</Text>
            </Pressable>
          </Pressable>
          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <Pressable key={tab.name} onPress={() => { setActiveTab(tab.name); setQuery(''); }} style={styles.tabItem}>
                <Text style={[styles.tabIcon, activeTab === tab.name && styles.tabActive]}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, activeTab === tab.name && styles.tabActive]}>{tab.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090d18' },
  app: { flex: 1, backgroundColor: '#090d18' },
  topBar: { height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22 },
  brandMark: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#a3e635', alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#111827', fontWeight: '900', fontSize: 18 },
  brandName: { color: '#f5f7ff', fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginLeft: 9 },
  profileButton: { marginLeft: 'auto', width: 34, height: 34, borderRadius: 17, backgroundColor: '#252d42', alignItems: 'center', justifyContent: 'center' },
  profileInitial: { color: '#d9e3ff', fontSize: 13, fontWeight: '800' },
  pageContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 },
  heroCard: { height: 260, backgroundColor: '#262047', borderRadius: 26, overflow: 'hidden', marginBottom: 28, justifyContent: 'center' },
  heroGlow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#b9328d', opacity: 0.5, right: -55, top: -30 },
  heroContent: { padding: 24, zIndex: 1 },
  eyebrow: { color: '#d2c8ff', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 11 },
  heroTitle: { color: '#fff', fontSize: 40, lineHeight: 42, fontWeight: '900', letterSpacing: -1 },
  heroSubtitle: { color: '#e1dced', fontSize: 13, marginTop: 9, marginBottom: 18 },
  playButton: { alignSelf: 'flex-start', borderRadius: 22, backgroundColor: '#a3e635', paddingHorizontal: 17, paddingVertical: 11 },
  playButtonText: { color: '#17200b', fontSize: 12, fontWeight: '900' },
  heroOrnament: { position: 'absolute', right: 24, bottom: 24, color: '#f3a5db', fontSize: 58, opacity: 0.8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13, marginTop: 7 },
  sectionTitle: { color: '#f2f4fb', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  sectionAction: { color: '#9da7c0', fontSize: 12, fontWeight: '700' },
  moodList: { paddingBottom: 22, paddingRight: 10 },
  moodChip: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, backgroundColor: '#151b2a', marginRight: 8, borderWidth: 1, borderColor: '#222a3c' },
  moodChipSelected: { backgroundColor: '#a3e635', borderColor: '#a3e635' },
  moodText: { color: '#c4cadd', fontSize: 12, fontWeight: '700' },
  moodTextSelected: { color: '#17200b' },
  playlistList: { paddingBottom: 20, paddingRight: 10 },
  playlistCard: { width: 158, marginRight: 14 },
  playlistCover: { height: 158, width: 158, borderRadius: 18, backgroundColor: '#20283b', marginBottom: 9 },
  playlistTitle: { color: '#f3f5ff', fontWeight: '800', fontSize: 14 },
  playlistSubtitle: { color: '#939db7', fontSize: 11, marginTop: 4 },
  trackList: { marginBottom: 20 },
  trackRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 7, marginBottom: 3 },
  trackRowActive: { backgroundColor: '#141b2b' },
  trackMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  trackCover: { width: 48, height: 48, borderRadius: 11, backgroundColor: '#20283b' },
  trackDetails: { flex: 1, marginLeft: 12, marginRight: 8 },
  trackTitle: { color: '#eff2fb', fontSize: 13, fontWeight: '700' },
  trackArtist: { color: '#8993ad', fontSize: 11, marginTop: 4 },
  trackDuration: { color: '#818ba4', fontSize: 11, marginRight: 9 },
  likeButton: { padding: 8 },
  likeIcon: { color: '#a4aec5', fontSize: 18 },
  likedIcon: { color: '#a3e635' },
  pageHeading: { marginTop: 14, marginBottom: 20 },
  pageEyebrow: { color: '#a3e635', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 9 },
  pageTitle: { color: '#f2f4fb', fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  searchInput: { height: 50, color: '#f5f7ff', backgroundColor: '#151b2a', borderRadius: 15, paddingHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: '#242c40', fontSize: 14 },
  libraryBanner: { minHeight: 88, borderRadius: 18, backgroundColor: '#222044', flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 22 },
  libraryIcon: { color: '#d7a8ff', fontSize: 28, marginHorizontal: 10 },
  libraryCopy: { marginLeft: 10 },
  libraryTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  librarySubtitle: { color: '#b0abc9', fontSize: 12, marginTop: 5 },
  emptyState: { paddingVertical: 42, alignItems: 'center' },
  emptyTitle: { color: '#f1f3fc', fontSize: 16, fontWeight: '800' },
  emptyText: { color: '#8f99b2', fontSize: 12, marginTop: 8, textAlign: 'center' },
  radioDescription: { color: '#9ba5bd', fontSize: 14, marginTop: 7 },
  radioCard: { height: 250, borderRadius: 24, backgroundColor: '#162a35', marginBottom: 25, padding: 22, justifyContent: 'flex-end', overflow: 'hidden' },
  radioIcon: { position: 'absolute', top: 24, right: 28, fontSize: 90, color: '#8dd5b0', opacity: 0.55 },
  radioTitle: { color: '#fff', fontSize: 23, fontWeight: '900', marginBottom: 5 },
  radioSubtitle: { color: '#b4c9c4', fontSize: 13, marginBottom: 17 },
  bottomArea: { backgroundColor: '#090d18', paddingHorizontal: 12, paddingBottom: 4 },
  miniPlayer: { height: 64, borderRadius: 15, backgroundColor: '#1b2233', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, marginBottom: 5 },
  miniCover: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#30384a' },
  miniDetails: { flex: 1, marginLeft: 10 },
  miniTitle: { color: '#f6f7fb', fontSize: 12, fontWeight: '800' },
  miniArtist: { color: '#a0aac0', fontSize: 10, marginTop: 3 },
  miniAction: { paddingHorizontal: 9, paddingVertical: 10 },
  miniPlayIcon: { color: '#f5f6fb', fontSize: 16, fontWeight: '800' },
  tabBar: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  tabIcon: { color: '#69738d', fontSize: 21, height: 25 },
  tabLabel: { color: '#69738d', fontSize: 9, fontWeight: '700', marginTop: 1 },
  tabActive: { color: '#a3e635' },
});
