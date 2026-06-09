import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { VideoItem, PrivacySettings, FamilyMember, VoiceComment, VideoSegment } from '@/types/video';
import { mockVideos, mockFamilyMembers } from '@/data/videos';

const CURRENT_USER = {
  id: 'u1',
  name: '王奶奶',
  avatar: 'https://picsum.photos/id/177/200/200'
};

const PRIVACY_STORAGE_KEY = 'family_memory_privacy';
const VIDEOS_STORAGE_KEY = 'family_memory_videos';

const defaultPrivacy: PrivacySettings = {
  blockStranger: true,
  allowComment: true,
  allowShare: false,
  defaultVisibility: 'family',
  defaultVisibleToMemberIds: mockFamilyMembers.map(m => m.id)
};

const loadPrivacy = (): PrivacySettings => {
  try {
    const saved = Taro.getStorageSync(PRIVACY_STORAGE_KEY);
    if (saved) return { ...defaultPrivacy, ...saved };
  } catch (e) {}
  return defaultPrivacy;
};

const loadVideos = (): VideoItem[] => {
  try {
    const saved = Taro.getStorageSync(VIDEOS_STORAGE_KEY);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
  } catch (e) {}
  return mockVideos;
};

interface AppState {
  videos: VideoItem[];
  currentEditingVideo: VideoItem | null;
  privacy: PrivacySettings;
  familyMembers: FamilyMember[];
  currentUser: { id: string; name: string; avatar: string };
  viewAsUserId: string | null;

  setCurrentEditingVideo: (video: VideoItem | null) => void;
  createDraftVideo: (duration: number, fromAlbum?: boolean) => VideoItem;
  updateEditingVideo: (updates: Partial<VideoItem>) => void;
  publishCurrentVideo: () => VideoItem | null;

  addVideo: (video: VideoItem) => void;
  toggleLike: (id: string) => void;
  toggleCollect: (id: string) => void;
  addVoiceComment: (videoId: string, comment: VoiceComment) => void;

  updatePrivacy: (updates: Partial<PrivacySettings>) => void;
  savePrivacy: () => void;

  setViewAsUser: (userId: string | null) => void;
  getEffectiveUser: () => { id: string; name: string; avatar: string };

  getMyVideos: () => VideoItem[];
  getVisibleVideosForMe: () => VideoItem[];
}

const generateId = () => `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const formatDateCN = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

const generateSegments = (totalDuration: number): VideoSegment[] => {
  const segments: VideoSegment[] = [];
  let remaining = totalDuration;
  let idx = 1;
  const picsumIds = [64, 1015, 292, 1025, 1036, 225, 1039, 1044, 338, 431];
  while (remaining > 0) {
    const segDur = Math.min(remaining, 15 + Math.floor(Math.random() * 10));
    segments.push({
      id: `seg_${idx}`,
      startTime: totalDuration - remaining,
      endTime: totalDuration - remaining + segDur,
      thumbnail: `https://picsum.photos/id/${picsumIds[(idx - 1) % picsumIds.length]}/160/120`
    });
    remaining -= segDur;
    idx++;
  }
  return segments;
};

export const useAppStore = create<AppState>((set, get) => ({
  videos: loadVideos(),
  currentEditingVideo: null,
  privacy: loadPrivacy(),
  familyMembers: mockFamilyMembers,
  currentUser: CURRENT_USER,
  viewAsUserId: null,

  setCurrentEditingVideo: (video) => set({ currentEditingVideo: video }),

  setViewAsUser: (userId) => set({ viewAsUserId: userId }),

  getEffectiveUser: () => {
    const { viewAsUserId, familyMembers, currentUser } = get();
    if (!viewAsUserId) return currentUser;
    const member = familyMembers.find((m) => m.id === viewAsUserId);
    if (member) {
      return { id: member.id, name: member.name, avatar: member.avatar };
    }
    return currentUser;
  },

  createDraftVideo: (duration, fromAlbum = false) => {
    const now = new Date();
    const segments = generateSegments(Math.max(duration, 10));
    const coverUrl = segments[0]?.thumbnail.replace('/160/120', '/750/500') || 'https://picsum.photos/id/64/750/500';
    const draft: VideoItem = {
      id: generateId(),
      title: fromAlbum ? '从相册导入的视频' : '新拍摄的视频',
      coverUrl,
      videoUrl: '',
      author: CURRENT_USER,
      createTime: formatDate(now),
      date: formatDateCN(now),
      location: '家里客厅',
      duration,
      likes: 0,
      comments: [],
      isLiked: false,
      isCollected: false,
      familyTags: [],
      filters: '原图',
      subtitles: [],
      narration: false,
      oldPhotoCompare: false,
      segments,
      visibility: get().privacy.defaultVisibility,
      visibleToMemberIds: [...(get().privacy.defaultVisibleToMemberIds || [])],
      isDraft: true
    };
    set({ currentEditingVideo: draft });
    return draft;
  },

  updateEditingVideo: (updates) => {
    set((state) => ({
      currentEditingVideo: state.currentEditingVideo
        ? { ...state.currentEditingVideo, ...updates }
        : null
    }));
  },

  publishCurrentVideo: () => {
    const draft = get().currentEditingVideo;
    if (!draft) return null;
    const published: VideoItem = {
      ...draft,
      isDraft: false,
      createTime: formatDate(new Date())
    };
    set((state) => {
      const newVideos = [published, ...state.videos];
      try { Taro.setStorageSync(VIDEOS_STORAGE_KEY, newVideos); } catch (e) {}
      return { videos: newVideos, currentEditingVideo: null };
    });
    return published;
  },

  addVideo: (video) => {
    set((state) => {
      const newVideos = [video, ...state.videos];
      try { Taro.setStorageSync(VIDEOS_STORAGE_KEY, newVideos); } catch (e) {}
      return { videos: newVideos };
    });
  },

  toggleLike: (id) => {
    set((state) => {
      const newVideos = state.videos.map((v) =>
        v.id === id
          ? { ...v, isLiked: !v.isLiked, likes: v.isLiked ? v.likes - 1 : v.likes + 1 }
          : v
      );
      try { Taro.setStorageSync(VIDEOS_STORAGE_KEY, newVideos); } catch (e) {}
      return { videos: newVideos };
    });
  },

  toggleCollect: (id) => {
    set((state) => {
      const newVideos = state.videos.map((v) =>
        v.id === id ? { ...v, isCollected: !v.isCollected } : v
      );
      try { Taro.setStorageSync(VIDEOS_STORAGE_KEY, newVideos); } catch (e) {}
      return { videos: newVideos };
    });
  },

  addVoiceComment: (videoId, comment) => {
    set((state) => {
      const newVideos = state.videos.map((v) =>
        v.id === videoId ? { ...v, comments: [...v.comments, comment] } : v
      );
      try { Taro.setStorageSync(VIDEOS_STORAGE_KEY, newVideos); } catch (e) {}
      return { videos: newVideos };
    });
  },

  updatePrivacy: (updates) => {
    set((state) => ({ privacy: { ...state.privacy, ...updates } }));
  },

  savePrivacy: () => {
    try { Taro.setStorageSync(PRIVACY_STORAGE_KEY, get().privacy); } catch (e) {}
  },

  getMyVideos: () => {
    const effectiveUser = get().getEffectiveUser();
    return get().videos.filter((v) => v.author.id === effectiveUser.id && !v.isDraft);
  },

  getVisibleVideosForMe: () => {
    const { privacy, videos } = get();
    const effectiveUser = get().getEffectiveUser();
    return videos.filter((v) => {
      if (v.isDraft) return false;
      if (v.visibility === 'private') {
        return v.author.id === effectiveUser.id;
      }
      if (v.author.id === effectiveUser.id) return true;
      if (v.visibility === 'public') {
        return !privacy.blockStranger ? true : false;
      }
      if (v.visibility === 'family') {
        if (!v.visibleToMemberIds || v.visibleToMemberIds.length === 0) return true;
        return v.visibleToMemberIds.includes(effectiveUser.id);
      }
      return false;
    });
  }
}));
