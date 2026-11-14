import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { tracks, type Track } from '../data/music';
import type { MusicScreenProps } from './types';

export function LibraryScreen({ selectedTrack, onSelectTrack, likedIds, onToggleLike, onNextTrack }: MusicScreenProps) {
  const savedTracks = useMemo(() => tracks.filter((track) => likedIds.includes(track.id)), [likedIds]);

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
        <Text style={[styles.likeIcon, likedIds.includes(track.id) && styles.likedIcon]}>{likedIds.includes(track.id) ? '♥' : '♡'}</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>LIBRARY</Text>
        <Text style={styles.pageTitle}>Your favorites</Text>
      </View>

      <View style={styles.libraryBanner}>
        <View style={styles.libraryBadge}>♥</View>
        <View style={styles.libraryTextWrap}>
          <Text style={styles.libraryTitle}>Liked songs</Text>
          <Text style={styles.librarySubtitle}>{savedTracks.length} songs saved</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved tracks</Text>
      </View>

      {savedTracks.length ? (
        <View style={styles.trackList}>{savedTracks.map(renderTrackRow)}</View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyText}>Tap the heart on a track to save it here.</Text>
        </View>
      )}

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
            <Text style={[styles.controlIcon, likedIds.includes(selectedTrack.id) && styles.likedIcon]}>{likedIds.includes(selectedTrack.id) ? '♥' : '♡'}</Text>
          </Pressable>
          <Pressable onPress={onNextTrack}><Text style={styles.controlIcon}>⏭</Text></Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 100 },
  pageHeader: { paddingTop: 10, marginBottom: 16 },
  pageEyebrow: { color: '#a3e635', fontSize: 10, letterSpacing: 2, fontWeight: '800', marginBottom: 8 },
  pageTitle: { color: '#f5f7ff', fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  libraryBanner: { backgroundColor: '#191e35', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  libraryBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#232b49', alignItems: 'center', justifyContent: 'center', color: '#f6d7ff', fontSize: 22 },
  libraryTextWrap: { marginLeft: 12 },
  libraryTitle: { color: '#f6f7ff', fontSize: 15, fontWeight: '800' },
  librarySubtitle: { marginTop: 4, color: '#97a4c2', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  sectionTitle: { color: '#f2f4fb', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
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
  emptyState: { paddingVertical: 42, alignItems: 'center' },
  emptyTitle: { color: '#eef3ff', fontSize: 16, fontWeight: '800' },
  emptyText: { marginTop: 8, color: '#8f9bb4', fontSize: 12, textAlign: 'center' },
  playerBar: { position: 'absolute', bottom: 64, left: 16, right: 16, height: 68, borderRadius: 18, backgroundColor: '#101a2a', borderWidth: 1, borderColor: '#1b2a3c', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  playerMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  playerCover: { width: 46, height: 46, borderRadius: 12 },
  playerTextWrap: { flex: 1, marginLeft: 10 },
  playerTitle: { color: '#f5f7ff', fontSize: 13, fontWeight: '800' },
  playerArtist: { color: '#8c96b7', fontSize: 11, marginTop: 3 },
  controlsWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  controlIcon: { color: '#edf2ff', fontSize: 18, fontWeight: '700' },
});
