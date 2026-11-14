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
import { moods, playlists, tracks, type Playlist, type Track } from './src/data/music';

type TabName = 'Discover' | 'Search' | 'Library' | 'Radio';

const tabs: { name: TabName; icon: string }[] = [
  { name: 'Discover', icon: '⌂' },
  { name: 'Search', icon: '⌕' },
  { name: 'Library', icon: '▣' },
  { name: 'Radio', icon: '◉' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('Discover');
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0].id);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0].id);
  const [selectedMood, setSelectedMood] = useState('All');
  const [query, setQuery] = useState('');
  const [likedIds, setLikedIds] = useState<string[]>(['t2', 't5']);
  const [isPlaying, setIsPlaying] = useState(true);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0],
    [selectedTrackId]
  );

  const selectedPlaylist = useMemo(
    () => playlists.find((item) => item.id === selectedPlaylistId) ?? playlists[0],
    [selectedPlaylistId]
  );

  const filteredTracks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tracks.filter((track) => {
      const matchesQuery = !normalized || `${track.title} ${track.artist}`.toLowerCase().includes(normalized);
      const matchesMood = selectedMood === 'All' || track.vibe === selectedMood;
      return matchesQuery && matchesMood;
    });
  }, [query, selectedMood]);

  const libraryTracks = useMemo(
    () => tracks.filter((track) => likedIds.includes(track.id)),
    [likedIds]
  );

  const handlePlay = (track: Track) => {
    setSelectedTrackId(track.id);
    setIsPlaying(true);
  };

  const handleNext = () => {
    const currentIndex = tracks.findIndex((track) => track.id === selectedTrackId);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlay(tracks[nextIndex]);
  };

  const toggleLike = (trackId: string) => {
    setLikedIds((current) =>
      current.includes(trackId)
        ? current.filter((id) => id !== trackId)
        : [...current, trackId]
    );
  };

  const renderTrackRow = (track: Track) => (
    <View key={track.id} style={[styles.trackRow, selectedTrackId === track.id && styles.trackRowActive]}>
      <Pressable style={styles.trackMain} onPress={() => handlePlay(track)} accessibilityRole="button">
        <Image source={{ uri: track.cover }} style={styles.trackCover} />
        <View style={styles.trackMeta}>
          <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
          <Text numberOfLines={1} style={styles.trackArtist}>{track.artist}</Text>
        </View>
      </Pressable>
      <Text style={styles.trackDuration}>{track.duration}</Text>
      <Pressable onPress={() => toggleLike(track.id)} style={styles.likeButton}>
        <Text style={[styles.likeIcon, likedIds.includes(track.id) && styles.likedIcon]}>
          {likedIds.includes(track.id) ? '♥' : '♡'}
        </Text>
      </Pressable>
    </View>
  );

  const renderSectionHeader = (title: string, action?: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );

  const renderDiscover = () => (
    <>
      <View style={styles.featuredCard}>
        <View style={styles.featuredGlow} />
        <View style={styles.featuredContent}>
          <Text style={styles.featuredEyebrow}>Daily mix</Text>
          <Text style={styles.featuredTitle}>Midnight Echo</Text>
          <Text style={styles.featuredSubtitle}>Synthwave • soul • cinematic chill</Text>
          <Pressable style={styles.primaryButton} onPress={() => handlePlay(tracks[0])}>
            <Text style={styles.primaryButtonText}>▶   Play mix</Text>
          </Pressable>
        </View>
        <Text style={styles.featuredEmoji}>♫</Text>
      </View>

      {renderSectionHeader('Your mood')}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
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

      {renderSectionHeader('Curated playlists', 'See all')}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistRow}>
        {playlists.map((playlist) => (
          <Pressable
            key={playlist.id}
            style={styles.playlistCard}
            onPress={() => setSelectedPlaylistId(playlist.id)}
          >
            <Image source={{ uri: playlist.cover }} style={styles.playlistImage} />
            <Text style={styles.playlistName}>{playlist.name}</Text>
            <Text style={styles.playlistMeta}>{playlist.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.summaryCard}>
        <View style={styles.summaryMeta}>
          <Text style={styles.summaryLabel}>Now playing</Text>
          <Text style={styles.summaryTitle}>{selectedPlaylist.name}</Text>
          <Text style={styles.summarySubtitle}>{selectedPlaylist.subtitle}</Text>
        </View>
        <Pressable style={styles.summaryAction} onPress={() => handlePlay(tracks[Number(selectedPlaylist.id) % tracks.length])}>
          <Text style={styles.summaryActionText}>Play</Text>
        </Pressable>
      </View>

      {renderSectionHeader('Picked for you', 'Refresh')}
      <View style={styles.trackList}>{filteredTracks.slice(0, 5).map(renderTrackRow)}</View>
    </>
  );

  const renderSearch = () => (
    <>
      <View style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>SEARCH</Text>
        <Text style={styles.pageTitle}>Find your sound</Text>
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search songs or artists"
        placeholderTextColor="#7b869d"
        style={styles.searchInput}
        autoCapitalize="none"
      />

      {renderSectionHeader('Results', `${filteredTracks.length} found`)}
      <View style={styles.trackList}> {filteredTracks.length ? filteredTracks.map(renderTrackRow) : <View style={styles.emptyState}><Text style={styles.emptyTitle}>No matches</Text><Text style={styles.emptyText}>Try a different artist or song name.</Text></View>} </View>
    </>
  );

  const renderLibrary = () => (
    <>
      <View style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>LIBRARY</Text>
        <Text style={styles.pageTitle}>Your favorites</Text>
      </View>

      <View style={styles.libraryBanner}>
        <View style={styles.libraryBadge}>♥</View>
        <View style={styles.libraryTextWrap}>
          <Text style={styles.libraryTitle}>Liked songs</Text>
          <Text style={styles.librarySubtitle}>{libraryTracks.length} songs saved</Text>
        </View>
      </View>

      {renderSectionHeader('Saved tracks')}
      <View style={styles.trackList}>{libraryTracks.length ? libraryTracks.map(renderTrackRow) : <View style={styles.emptyState}><Text style={styles.emptyTitle}>Nothing saved yet</Text><Text style={styles.emptyText}>Tap the heart on a track to save it here.</Text></View>}</View>
    </>
  );

  const renderRadio = () => (
    <>
      <View style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>RADIO</Text>
        <Text style={styles.pageTitle}>Tune in</Text>
      </View>

      <View style={styles.radioCard}>
        <Text style={styles.radioIcon}>◉</Text>
        <Text style={styles.radioTitle}>Syncify Selects</Text>
        <Text style={styles.radioText}>Fresh picks for your mood, all day.</Text>
        <Pressable style={styles.primaryButton} onPress={() => handlePlay(tracks[2])}>
          <Text style={styles.primaryButtonText}>▶   Listen now</Text>
        </Pressable>
      </View>

      {renderSectionHeader('Featured stations')}
      <View style={styles.trackList}>{tracks.slice(1, 4).map(renderTrackRow)}</View>
    </>
  );

  const screenContent =
    activeTab === 'Discover' ? renderDiscover() :
    activeTab === 'Search' ? renderSearch() :
    activeTab === 'Library' ? renderLibrary() :
    renderRadio();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appShell}>
        <View style={styles.topBar}>
          <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>S</Text></View>
          <Text style={styles.brandName}>syncify</Text>
          <Pressable style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {screenContent}
        </ScrollView>

        <View style={styles.playerBar}>
          <Pressable style={styles.playerMain} onPress={() => handlePlay(selectedTrack)}>
            <Image source={{ uri: selectedTrack.cover }} style={styles.playerCover} />
            <View style={styles.playerTextWrap}>
              <Text numberOfLines={1} style={styles.playerTitle}>{selectedTrack.title}</Text>
              <Text numberOfLines={1} style={styles.playerArtist}>{selectedTrack.artist}</Text>
            </View>
          </Pressable>

          <View style={styles.controlsWrap}>
            <Pressable onPress={() => toggleLike(selectedTrack.id)}>
              <Text style={[styles.controlIcon, likedIds.includes(selectedTrack.id) && styles.likedIcon]}>
                {likedIds.includes(selectedTrack.id) ? '♥' : '♡'}
              </Text>
            </Pressable>
            <Pressable onPress={() => setIsPlaying((value) => !value)}>
              <Text style={styles.controlIconLarge}>{isPlaying ? '❚❚' : '▶'}</Text>
            </Pressable>
            <Pressable onPress={handleNext}>
              <Text style={styles.controlIcon}>⏭</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <Pressable key={tab.name} onPress={() => { setActiveTab(tab.name); setQuery(''); }} style={styles.tabButton}>
              <Text style={[styles.tabIcon, activeTab === tab.name && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.name && styles.tabLabelActive]}>{tab.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d18',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#090d18',
  },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  brandBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#a3e635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '900',
  },
  brandName: {
    marginLeft: 9,
    fontSize: 20,
    color: '#f5f7ff',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatar: {
    marginLeft: 'auto',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1e2940',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#dfe7ff',
    fontWeight: '800',
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  featuredCard: {
    height: 250,
    backgroundColor: '#1c2340',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 22,
    justifyContent: 'center',
  },
  featuredGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -40,
    right: -50,
    backgroundColor: '#ff7db4',
    opacity: 0.45,
  },
  featuredContent: {
    paddingHorizontal: 24,
    zIndex: 1,
  },
  featuredEyebrow: {
    fontSize: 10,
    color: '#e7d8ff',
    letterSpacing: 2,
    fontWeight: '800',
  },
  featuredTitle: {
    marginTop: 12,
    fontSize: 38,
    lineHeight: 40,
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: -1,
  },
  featuredSubtitle: {
    marginTop: 10,
    color: '#e4e8fa',
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: '#a3e635',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#182306',
    fontWeight: '900',
    fontSize: 12,
  },
  featuredEmoji: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    fontSize: 68,
    color: '#f8c6de',
    opacity: 0.7,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionTitle: {
    color: '#f2f4fb',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionAction: {
    color: '#9aa8c8',
    fontSize: 12,
    fontWeight: '700',
  },
  moodRow: {
    paddingBottom: 10,
    paddingRight: 12,
  },
  moodChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#141d30',
    borderWidth: 1,
    borderColor: '#202b42',
    marginRight: 9,
  },
  moodChipSelected: {
    backgroundColor: '#a3e635',
    borderColor: '#a3e635',
  },
  moodText: {
    color: '#c9d0df',
    fontSize: 12,
    fontWeight: '700',
  },
  moodTextSelected: {
    color: '#152110',
  },
  playlistRow: {
    paddingBottom: 8,
    paddingRight: 12,
  },
  playlistCard: {
    width: 158,
    marginRight: 14,
  },
  playlistImage: {
    width: 158,
    height: 158,
    borderRadius: 18,
    backgroundColor: '#222d49',
    marginBottom: 9,
  },
  playlistName: {
    color: '#eef3ff',
    fontSize: 14,
    fontWeight: '800',
  },
  playlistMeta: {
    color: '#8b96b1',
    fontSize: 11,
    marginTop: 4,
  },
  summaryCard: {
    marginTop: 6,
    marginBottom: 18,
    backgroundColor: '#121b2e',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryMeta: {
    flex: 1,
  },
  summaryLabel: {
    color: '#a8b6d6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    marginTop: 8,
    color: '#f6f7ff',
    fontWeight: '800',
    fontSize: 19,
  },
  summarySubtitle: {
    marginTop: 4,
    color: '#8e9bb8',
    fontSize: 12,
  },
  summaryAction: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#25324a',
  },
  summaryActionText: {
    color: '#eff4ff',
    fontWeight: '800',
    fontSize: 12,
  },
  trackList: {
    marginBottom: 8,
  },
  trackRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  trackRowActive: {
    backgroundColor: '#111a2f',
  },
  trackMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#212b45',
  },
  trackMeta: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  trackTitle: {
    color: '#f1f4ff',
    fontSize: 13,
    fontWeight: '700',
  },
  trackArtist: {
    color: '#8a94af',
    fontSize: 11,
    marginTop: 4,
  },
  trackDuration: {
    color: '#8b96b2',
    fontSize: 11,
    marginRight: 8,
  },
  likeButton: {
    padding: 8,
  },
  likeIcon: {
    color: '#a2afce',
    fontSize: 18,
  },
  likedIcon: {
    color: '#a3e635',
  },
  pageHeader: {
    paddingTop: 10,
    marginBottom: 16,
  },
  pageEyebrow: {
    color: '#a3e635',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 8,
  },
  pageTitle: {
    color: '#f5f7ff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  searchInput: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#151d2b',
    borderWidth: 1,
    borderColor: '#232d40',
    paddingHorizontal: 16,
    marginBottom: 20,
    color: '#edf3ff',
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 42,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#eef3ff',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    color: '#8f9bb4',
    fontSize: 12,
    textAlign: 'center',
  },
  libraryBanner: {
    backgroundColor: '#191e35',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  libraryBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#232b49',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f6d7ff',
    fontSize: 22,
  },
  libraryTextWrap: {
    marginLeft: 12,
  },
  libraryTitle: {
    color: '#f6f7ff',
    fontSize: 15,
    fontWeight: '800',
  },
  librarySubtitle: {
    marginTop: 4,
    color: '#97a4c2',
    fontSize: 12,
  },
  radioCard: {
    height: 230,
    borderRadius: 24,
    backgroundColor: '#0e2b35',
    marginBottom: 20,
    padding: 22,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  radioIcon: {
    position: 'absolute',
    right: 22,
    top: 18,
    fontSize: 92,
    color: '#8addb2',
    opacity: 0.6,
  },
  radioTitle: {
    color: '#f1f9ff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  radioText: {
    color: '#b4d0ca',
    fontSize: 13,
    marginBottom: 18,
  },
  playerBar: {
    position: 'absolute',
    bottom: 64,
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#101a2a',
    borderWidth: 1,
    borderColor: '#1b2a3c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  playerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerCover: {
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  playerTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  playerTitle: {
    color: '#f5f7ff',
    fontSize: 13,
    fontWeight: '800',
  },
  playerArtist: {
    color: '#8c96b7',
    fontSize: 11,
    marginTop: 3,
  },
  controlsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlIcon: {
    color: '#edf2ff',
    fontSize: 18,
    fontWeight: '700',
  },
  controlIconLarge: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    flexDirection: 'row',
    backgroundColor: '#0d1422',
    borderTopWidth: 1,
    borderTopColor: '#1d2638',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabIcon: {
    color: '#69758d',
    fontSize: 21,
  },
  tabIconActive: {
    color: '#a3e635',
  },
  tabLabel: {
    color: '#69758d',
    fontSize: 9,
    marginTop: 3,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#a3e635',
  },
});
