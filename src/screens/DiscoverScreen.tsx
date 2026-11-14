import type { Track } from '../data/music';

export type MusicScreenProps = {
  selectedTrack: Track;
  onSelectTrack: (track: Track) => void;
  likedIds: string[];
  onToggleLike: (trackId: string) => void;
  onNextTrack: () => void;
};
