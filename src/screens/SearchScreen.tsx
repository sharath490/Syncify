import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { tracks, type Track } from '../data/music';
import type { MusicScreenProps } from './types';

export function SearchScreen({ selectedTrack, onSelectTrack, likedIds, onToggleLike, onNextTrack }: MusicScreenProps) {
  const [query, setQuery] = useState('');
  const filteredTracks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tracks.filter((track) => !normalized || `${track.title} ${track.artist} ${track.vibe}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>SEARCH</Text>
      <Text style={styles.title}>Find your sound</Text>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search songs, artists, moods" placeholderTextColor="#7b869d" style={styles.input} autoCapitalize="none" />
      <Text style={styles.count}>{filteredTracks.length} tracks</Text>
      {filteredTracks.map((track) => (
        <View key={track.id} style={styles.row}>
          <Pressable style={styles.main} onPress={() => onSelectTrack(track)}>
            <Image source={{ uri: track.cover }} style={styles.cover} />
            <View style={styles.meta}><Text numberOfLines={1} style={styles.track}>{track.title}</Text><Text style={styles.artist}>{track.artist}</Text></View>
          </Pressable>
          <Pressable onPress={() => onToggleLike(track.id)}><Text style={styles.heart}>{likedIds.includes(track.id) ? '♥' : '♡'}</Text></Pressable>
        </View>
      ))}
      <Text style={styles.nowPlaying}>Now playing: {selectedTrack.title}</Text>
      <Pressable onPress={onNextTrack}><Text style={styles.next}>Next track  ⏭</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 20, backgroundColor: '#090d18' },
  eyebrow: { color: '#a3e635', fontWeight: '800', fontSize: 10, letterSpacing: 2, marginTop: 16 },
  title: { color: '#f5f7ff', fontSize: 30, fontWeight: '900', marginTop: 7, marginBottom: 18 },
  input: { height: 50, borderRadius: 15, backgroundColor: '#151d2b', paddingHorizontal: 15, color: '#fff', marginBottom: 16 },
  count: { color: '#9ba6bf', fontSize: 11, marginBottom: 8 },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center' },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  cover: { width: 44, height: 44, borderRadius: 10 },
  meta: { marginLeft: 11 },
  track: { color: '#f3f5fb', fontSize: 12, fontWeight: '800' },
  artist: { color: '#8b96ae', fontSize: 10, marginTop: 4 },
  heart: { color: '#a3e635', fontSize: 19, padding: 8 },
  nowPlaying: { color: '#9da8c0', fontSize: 11, marginTop: 22 },
  next: { color: '#a3e635', fontSize: 12, fontWeight: '800', marginTop: 12 },
});
