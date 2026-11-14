import { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { moods, playlists, tracks, type Track } from '../data/music';
import type { MusicScreenProps } from './types';

export function DiscoverScreen({
  selectedTrack,
  selectedPlaylistId,
  setSelectedPlaylistId,
  onSelectTrack,
  likedIds,
  onToggleLike,
  onNextTrack,
}: MusicScreenProps & {
  selectedPlaylistId: string;
  setSelectedPlaylistId: (playlistId: string) => void;
}) {
  const selectedPlaylist = useMemo(
    () => playlists.find((item) => item.id === selectedPlaylistId) ?? playlists[0],
    [selectedPlaylistId]
  );

  const renderTrackRow = (track: Track) => (
    <View key={track.id} style={[styles.trackRow, selectedTrack.id === track.id && styles.trackRowActive]}>
      <Pressable style={styles.trackMain} onPress={() => onSelectTrack(track)}>
        <Image source={{ uri: track.cover }} style={styles.trackCover} />
        <View style={styles.trackMeta}>
          <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
          <Text numberOfLines={1} style={styles.trackArtist}>{track.artist}</Text>
        </View>
      </Pressable>
      <Text style={styles.trackDuration}>{track.duration}</Text>
      <Pressable style={styles.likeButton} onPress={() => onToggleLike(track.id)}>
        <Text style={[styles.likeIcon, likedIds.includes(track.id) && styles.likedIcon]}>
          {likedIds.includes(track.id) ? '♥' : '♡'}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.featuredCard}>
        <View style={styles.featuredGlow} />
        <View style={styles.featuredContent}>
          <Text style={styles.featuredEyebrow}>Daily mix</Text>
          <Text style={styles.featuredTitle}>Midnight Echo</Text>
          <Text style={styles.featuredSubtitle}>Synthwave • soul • cinematic chill</Text>
          <Pressable style={styles.primaryButton} onPress={() => onSelectTrack(tracks[0])}>
            <Text style={styles.primaryButtonText}>▶   Play mix</Text>
          </Pressable>
        </View>
        <Text style={styles.featuredEmoji}>♫</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your mood</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
        {moods.map((mood) => (
          <View key={mood} style={styles.moodChip}>
            <Text style={styles.moodText}>{mood}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Curated playlists</Text>
        <Text style={styles.sectionAction}>See all</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistRow}>
        {playlists.map((playlist) => (
          <Pressable key={playlist.id} style={styles.playlistCard} onPress={() => setSelectedPlaylistId(playlist.id)}>
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
        <Pressable style={styles.summaryAction} onPress={() => onSelectTrack(tracks[Number(selectedPlaylist.id) % tracks.length])}>
          <Text style={styles.summaryActionText}>Play</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Picked for you</Text>
        <Text style={styles.sectionAction}>Refresh</Text>
      </View>

      <View style={styles.trackList}>{tracks.slice(0, 5).map(renderTrackRow)}</View>

      <View style={styles.playerBar}>
        <Pressable style={styles.playerMain} onPress={() => onSelectTrack(selectedTrack)}>
          <Image source={{ uri: selectedTrack.cover }} style={styles.playerCover} />
          <View style={styles.playerTextWrap}>
            <Text numberOfLines={1} style={styles.playerTitle}>{selectedTrack.title}</Text>
            <Text numberOfLines={1} style={styles.playerArtist}>{selectedTrack.artist}</Text>
          </View>
        </Pressable>

        <View style={styles.controlsWrap}>
          <Pressable onPress={() => onToggleLike(selectedTrack.id)}>
            <Text style={[styles.controlIcon, likedIds.includes(selectedTrack.id) && styles.likedIcon]}>
              {likedIds.includes(selectedTrack.id) ? '♥' : '♡'}
            </Text>
          </Pressable>
          <Pressable onPress={onNextTrack}>
            <Text style={styles.controlIcon}>⏭</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 100 },
  featuredCard: { height: 250, backgroundColor: '#1c2340', borderRadius: 28, overflow: 'hidden', marginBottom: 22, justifyContent: 'center' },
  featuredGlow: { position: 'absolute', width: 240, height: 240, borderRadius: 120, top: -40, right: -50, backgroundColor: '#ff7db4', opacity: 0.45 },
  featuredContent: { paddingHorizontal: 24, zIndex: 1 },
  featuredEyebrow: { fontSize: 10, color: '#e7d8ff', letterSpacing: 2, fontWeight: '800' },
  featuredTitle: { marginTop: 12, fontSize: 38, lineHeight: 40, color: '#ffffff', fontWeight: '900', letterSpacing: -1 },
  featuredSubtitle: { marginTop: 10, color: '#e4e8fa', fontSize: 13 },
  primaryButton: { marginTop: 18, alignSelf: 'flex-start', backgroundColor: '#a3e635', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  primaryButtonText: { color: '#182306', fontWeight: '900', fontSize: 12 },
  featuredEmoji: { position: 'absolute', right: 20, bottom: 16, fontSize: 68, color: '#f8c6de', opacity: 0.7 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  sectionTitle: { color: '#f2f4fb', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  sectionAction: { color: '#9aa8c8', fontSize: 12, fontWeight: '700' },
  moodRow: { paddingBottom: 10, paddingRight: 12 },
  moodChip: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 18, backgroundColor: '#141d30', borderWidth: 1, borderColor: '#202b42', marginRight: 9 },
  moodText: { color: '#c9d0df', fontSize: 12, fontWeight: '700' },
  playlistRow: { paddingBottom: 8, paddingRight: 12 },
  playlistCard: { width: 158, marginRight: 14 },
  playlistImage: { width: 158, height: 158, borderRadius: 18, backgroundColor: '#222d49', marginBottom: 9 },
  playlistName: { color: '#eef3ff', fontSize: 14, fontWeight: '800' },
  playlistMeta: { color: '#8b96b1', fontSize: 11, marginTop: 4 },
  summaryCard: { marginTop: 6, marginBottom: 18, backgroundColor: '#121b2e', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center' },
  summaryMeta: { flex: 1 },
  summaryLabel: { color: '#a8b6d6', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  summaryTitle: { marginTop: 8, color: '#f6f7ff', fontWeight: '800', fontSize: 19 },
  summarySubtitle: { marginTop: 4, color: '#8e9bb8', fontSize: 12 },
  summaryAction: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: '#25324a' },
  summaryActionText: { color: '#eff4ff', fontWeight: '800', fontSize: 12 },
  trackList: { marginBottom: 8 },
  trackRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderRadius: 14, marginBottom: 4, paddingHorizontal: 6 },
  trackRowActive: { backgroundColor: '#111a2f' },
  trackMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  trackCover: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#212b45' },
  trackMeta: { flex: 1, marginLeft: 12, marginRight: 8 },
  trackTitle: { color: '#f1f4ff', fontSize: 13, fontWeight: '700' },
  trackArtist: { color: '#8a94af', fontSize: 11, marginTop: 4 },
  trackDuration: { color: '#8b96b2', fontSize: 11, marginRight: 8 },
  likeButton: { padding: 8 },
  likeIcon: { color: '#a2afce', fontSize: 18 },
  likedIcon: { color: '#a3e635' },
  playerBar: { position: 'absolute', bottom: 64, left: 16, right: 16, height: 68, borderRadius: 18, backgroundColor: '#101a2a', borderWidth: 1, borderColor: '#1b2a3c', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  playerMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  playerCover: { width: 46, height: 46, borderRadius: 12 },
  playerTextWrap: { flex: 1, marginLeft: 10 },
  playerTitle: { color: '#f5f7ff', fontSize: 13, fontWeight: '800' },
  playerArtist: { color: '#8c96b7', fontSize: 11, marginTop: 3 },
  controlsWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  controlIcon: { color: '#edf2ff', fontSize: 18, fontWeight: '700' },
});
