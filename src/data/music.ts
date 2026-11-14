export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  accent: string;
  vibe: 'All' | 'Focus' | 'Chill' | 'Night Drive' | 'Workout' | 'Lo-fi' | 'Mood Boost';
};

export type Playlist = {
  id: string;
  name: string;
  subtitle: string;
  cover: string;
  description: string;
  followers: string;
};

export const moods = ['Focus', 'Chill', 'Night Drive', 'Workout', 'Lo-fi', 'Mood Boost'];

export const playlists: Playlist[] = [
  {
    id: '1',
    name: 'Velvet Nights',
    subtitle: 'Warm synth-laced evenings',
    cover: 'https://images.unsplash.com/photo-1516280440614-42139bb4f1f6?auto=format&fit=crop&w=900&q=80',
    description: 'Moody and atmospheric tracks for late-night listening.',
    followers: '28.4k',
  },
  {
    id: '2',
    name: 'Neon Rush',
    subtitle: 'Peak energy and momentum',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    description: 'High-intensity songs built to keep your flow alive.',
    followers: '18.9k',
  },
  {
    id: '3',
    name: 'Golden Hour',
    subtitle: 'Sunset driven and optimistic',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    description: 'The perfect blend of feel-good and uplifting energy.',
    followers: '32.1k',
  },
];

export const tracks: Track[] = [
  {
    id: 't1',
    title: 'Electric Bloom',
    artist: 'Nova Echo',
    duration: '3:42',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80',
    accent: '#7c3aed',
    vibe: 'Mood Boost',
  },
  {
    id: 't2',
    title: 'Afterglow Avenue',
    artist: 'Mila Keys',
    duration: '4:11',
    cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=300&q=80',
    accent: '#ec4899',
    vibe: 'Chill',
  },
  {
    id: 't3',
    title: 'Static Hearts',
    artist: 'Arden Lane',
    duration: '2:58',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80',
    accent: '#f59e0b',
    vibe: 'Night Drive',
  },
  {
    id: 't4',
    title: 'Starlight Run',
    artist: 'North Harbor',
    duration: '3:25',
    cover: 'https://images.unsplash.com/photo-1516280440614-42139bb4f1f6?auto=format&fit=crop&w=300&q=80',
    accent: '#22c55e',
    vibe: 'Workout',
  },
  {
    id: 't5',
    title: 'Glass City',
    artist: 'Vanta',
    duration: '4:03',
    cover: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=80',
    accent: '#0ea5e9',
    vibe: 'Focus',
  },
  {
    id: 't6',
    title: 'Kite in Blue',
    artist: 'Luna Sway',
    duration: '3:19',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80',
    accent: '#60a5fa',
    vibe: 'Lo-fi',
  },
];
