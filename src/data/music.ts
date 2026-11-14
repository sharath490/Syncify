import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { RadioScreen } from './src/screens/RadioScreen';
import { playlists, tracks, type Track } from './src/data/music';

export type RootTabParamList = {
  Discover: undefined;
  Search: undefined;
  Library: undefined;
  Radio: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabDefinitions = [
  { name: 'Discover', icon: '⌂' },
  { name: 'Search', icon: '⌕' },
  { name: 'Library', icon: '▣' },
  { name: 'Radio', icon: '◉' },
] as const;

function CustomTabBar({ state, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {tabDefinitions.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <Pressable
            key={tab.name}
            style={styles.tabButton}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function App() {
  const [selectedTrackId, setSelectedTrackId] = React.useState(tracks[0].id);
  const [selectedPlaylistId, setSelectedPlaylistId] = React.useState(playlists[0].id);
  const [likedIds, setLikedIds] = React.useState<string[]>(['t2', 't5']);

  const selectedTrack = React.useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0],
    [selectedTrackId]
  );

  const handleSelectTrack = (track: Track) => {
    setSelectedTrackId(track.id);
  };

  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex((track) => track.id === selectedTrackId);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setSelectedTrackId(tracks[nextIndex].id);
  };

  const toggleLike = (trackId: string) => {
    setLikedIds((current) =>
      current.includes(trackId)
        ? current.filter((id) => id !== trackId)
        : [...current, trackId]
    );
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Discover"
        screenOptions={{ headerShown: false }}
        tabBar={(props: any) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Discover">
          {() => (
            <DiscoverScreen
              selectedTrack={selectedTrack}
              selectedPlaylistId={selectedPlaylistId}
              setSelectedPlaylistId={setSelectedPlaylistId}
              onSelectTrack={handleSelectTrack}
              likedIds={likedIds}
              onToggleLike={toggleLike}
              onNextTrack={handleNextTrack}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Search">
          {() => (
            <SearchScreen
              selectedTrack={selectedTrack}
              onSelectTrack={handleSelectTrack}
              likedIds={likedIds}
              onToggleLike={toggleLike}
              onNextTrack={handleNextTrack}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Library">
          {() => (
            <LibraryScreen
              selectedTrack={selectedTrack}
              onSelectTrack={handleSelectTrack}
              likedIds={likedIds}
              onToggleLike={toggleLike}
              onNextTrack={handleNextTrack}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Radio">
          {() => (
            <RadioScreen
              selectedTrack={selectedTrack}
              onSelectTrack={handleSelectTrack}
              likedIds={likedIds}
              onToggleLike={toggleLike}
              onNextTrack={handleNextTrack}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
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
