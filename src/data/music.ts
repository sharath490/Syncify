import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { tracks, playlists, moods } from './src/data/music';

const tabs = ['Discover', 'Search', 'Library', 'Radio'];

export default function App() {
  const [activeTab, setActiveTab] = useState('Discover');
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0].id);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0],
    [selectedTrackId]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good evening</Text>
            <Text style={styles.title}>Syncify</Text>
          </View>
          <Pressable style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroOverlay}>
              <Text style={styles.kicker}>Featured mix</Text>
              <Text style={styles.heroTitle}>Midnight Echo</Text>
              <Text style={styles.heroSubtitle}>Synthwave + neo-soul + cinematic chill</Text>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Play mix</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your moods</Text>
            <Text style={styles.sectionLink}>See all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
            {moods.map((mood) => (
              <Pressable key={mood} style={styles.moodChip}>
                <Text style={styles.moodChipText}>{mood}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending playlists</Text>
            <Text style={styles.sectionLink}>More</Text>
          </View>

          <FlatList
            data={playlists}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.playlistRow}
            renderItem={({ item }) => (
              <Pressable key={item.id} style={styles.playlistCard}>
                <Image source={{ uri: item.cover }} style={styles.playlistImage} />
                <Text style={styles.playlistTitle}>{item.name}</Text>
                <Text style={styles.playlistMeta}>{item.subtitle}</Text>
              </Pressable>
            )}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>For you</Text>
            <Text style={styles.sectionLink}>Refresh</Text>
          </View>

          <View style={styles.trackList}>
            {tracks.map((track) => (
              <Pressable
                key={track.id}
                style={[
                  styles.trackItem,
                  selectedTrackId === track.id && styles.trackItemActive,
                ]}
                onPress={() => setSelectedTrackId(track.id)}
              >
                <Image source={{ uri: track.cover }} style={styles.trackCover} />
                <View style={styles.trackMeta}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackArtist}>{track.artist}</Text>
                </View>
                <Text style={styles.trackDuration}>{track.duration}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.playerBar}>
          <Image source={{ uri: selectedTrack.cover }} style={styles.playerImage} />
          <View style={styles.playerMeta}>
            <Text style={styles.playerTitle}>{selectedTrack.title}</Text>
            <Text style={styles.playerArtist}>{selectedTrack.artist}</Text>
          </View>
          <View style={styles.playerControls}>
            <Text style={styles.controlGlyph}>⏮</Text>
            <Text style={styles.controlGlyphLarge}>⏸</Text>
            <Text style={styles.controlGlyph}>⏭</Text>
          </View>
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
  container: {
    flex: 1,
    backgroundColor: '#090d18',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 18,
  },
  greeting: {
    color: '#a7afc4',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#edf2ff',
    marginTop: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#5eead4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#06121d',
    fontWeight: '800',
    fontSize: 18,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 18,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#121a2d',
  },
  activeTab: {
    backgroundColor: '#ff4d94',
  },
  tabText: {
    color: '#b5bfd7',
    fontWeight: '700',
    fontSize: 12,
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  heroCard: {
    height: 210,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#1b2440',
    justifyContent: 'flex-end',
    backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #fb7185 100%)',
  },
  heroOverlay: {
    padding: 22,
    backgroundColor: 'rgba(8,10,18,0.18)',
  },
  kicker: {
    color: '#dfe6ff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#edf2ff',
    opacity: 0.9,
    fontSize: 14,
    maxWidth: 220,
    marginBottom: 16,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#0d1117',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#edf2ff',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionLink: {
    color: '#8ea0d6',
    fontSize: 12,
    fontWeight: '700',
  },
  moodRow: {
    paddingVertical: 6,
    paddingRight: 12,
    gap: 10,
  },
  moodChip: {
    backgroundColor: '#131d33',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  moodChipText: {
    color: '#e9edff',
    fontSize: 13,
    fontWeight: '700',
  },
  playlistRow: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  playlistCard: {
    width: 170,
    marginRight: 16,
  },
  playlistImage: {
    width: 170,
    height: 170,
    borderRadius: 22,
    marginBottom: 10,
    backgroundColor: '#1d2942',
  },
  playlistTitle: {
    color: '#eef3ff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  playlistMeta: {
    color: '#8da0d8',
    fontSize: 12,
  },
  trackList: {
    marginTop: 14,
    gap: 12,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 8,
    backgroundColor: 'transparent',
  },
  trackItemActive: {
    backgroundColor: '#131d33',
  },
  trackCover: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  trackMeta: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    color: '#edf2ff',
    fontSize: 15,
    fontWeight: '700',
  },
  trackArtist: {
    color: '#939fc3',
    fontSize: 12,
    marginTop: 4,
  },
  trackDuration: {
    color: '#aeb9d7',
    fontSize: 12,
    fontWeight: '700',
  },
  playerBar: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    right: 18,
    height: 78,
    backgroundColor: '#10182d',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1a2540',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  playerImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  playerMeta: {
    flex: 1,
    marginLeft: 12,
  },
  playerTitle: {
    color: '#edf2ff',
    fontWeight: '800',
    fontSize: 14,
  },
  playerArtist: {
    color: '#7d8ab2',
    fontSize: 11,
    marginTop: 3,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlGlyph: {
    fontSize: 18,
    color: '#e7ebff',
    fontWeight: '700',
  },
  controlGlyphLarge: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '800',
    marginHorizontal: 4,
  },
});
