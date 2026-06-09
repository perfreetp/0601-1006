import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { VideoItem, PrivacySettings, FamilyMember, VoiceComment, VideoSegment, AppNotification } from '@/types/video';
import { mockVideos, mockFamilyMembers } from '@/data/videos';

const CURRENT_USER = {
  id: 'u1',
  name: '王奶奶',
  avatar: 'https://picsum.photos/id/177/200/200'
};

const PRIVACY_STORAGE_KEY = 'family_memory_privacy';
const VIDEOS_STORAGE_KEY = 'family_memory_videos';
const NOTIFICATIONS_STORAGE_KEY = 'family_memory_notifications';

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

const loadNotifications = (): AppNotification[] => {
  try {
    const saved = Taro.getStorageSync(NOTIFICATIONS_STORAGE_KEY);
    if (saved && Array.isArray(saved)) return saved;
  } catch (e) {}
  return [];
};

const saveNotifications = (notifications: AppNotification[]) => {
  try { Taro.setStorageSync(NOTIFICATIONS_STORAGE_KEY, notifications); } catch (e) {}
};

const formatDateTime = (d: Date) => {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
};

const generateNid = () => `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

interface AppState {
  videos: VideoItem[];
  currentEditingVideo: VideoItem | null;
  privacy: PrivacySettings;
  familyMembers: FamilyMember[];
  currentUser: { id: string; name: string; avatar: string };
  viewAsUserId: string | null;
  notifications: AppNotification[];

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
  getHomeFeedVideos: () => VideoItem[];

  getNotificationsForMe: () => AppNotification[];
  getUnreadNotificationCount: () => number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
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
  notifications: loadNotifications(),

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
      const video = state.videos.find((v) => v.id === id);
      const effectiveUser = get().getEffectiveUser();
      const newVideos = state.videos.map((v) =>
        v.id === id
          ? { ...v, isLiked: !v.isLiked, likes: v.isLiked ? v.likes - 1 : v.likes + 1 }
          : v
      );
      try { Taro.setStorageSync(VIDEOS_STORAGE_KEY, newVideos); } catch (e) {}

      let newNotifications = state.notifications;
      if (video && !video.isLiked && video.author.id !== effectiveUser.id) {
        const notif: AppNotification = {
          id: generateNid(),
          type: 'like',
          videoId: video.id,
          videoTitle: video.title,
          videoCoverUrl: video.coverUrl,
          fromUser: { ...effectiveUser },
          toUserId: video.author.id,
          createTime: formatDateTime(new Date()),
          isRead: false
        };
        newNotifications = [notif, ...state.notifications];
        saveNotifications(newNotifications);
      }
      return { videos: newVideos, notifications: newNotifications };
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
      const video = state.videos.find((v) => v.id === videoId);
      const newVideos = state.videos.map((v) =>
        v.id === videoId ? { ...v, comments: [...v.comments, comment] } : v
      );
      try { Taro.setStorageSync(VIDEOS_STORAGE_KEY, newVideos); } catch (e) {}

      let newNotifications = state.notifications;
      if (video) {
        const now = formatDateTime(new Date());
        if (comment.replyTo) {
          const parentComment = video.comments.find((c) => c.id === comment.replyTo!.id);
          if (parentComment && parentComment.author.id !== comment.author.id) {
            const replyNotif: AppNotification = {
              id: generateNid(),
              type: 'reply',
              videoId: video.id,
              videoTitle: video.title,
              videoCoverUrl: video.coverUrl,
              fromUser: { ...comment.author },
              toUserId: parentComment.author.id,
              comment,
              createTime: now,
              isRead: false
            };
            newNotifications = [replyNotif, ...newNotifications];
          }
        }
        if (video.author.id !== comment.author.id) {
          const commentNotif: AppNotification = {
            id: generateNid(),
            type: 'comment',
            videoId: video.id,
            videoTitle: video.title,
            videoCoverUrl: video.coverUrl,
            fromUser: { ...comment.author },
            toUserId: video.author.id,
            comment,
            createTime: now,
            isRead: false
          };
          newNotifications = [commentNotif, ...newNotifications];
        }
        saveNotifications(newNotifications);
      }
      return { videos: newVideos, notifications: newNotifications };
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
    const { privacy, videos, familyMembers, currentUser } = get();
    const effectiveUser = get().getEffectiveUser();
    return videos.filter((v) => {
      if (v.isDraft) return false;
      if (v.visibility === 'private') {
        return v.author.id === effectiveUser.id;
      }
      if (v.author.id === effectiveUser.id) return true;
      if (v.visibility === 'public') {
        const effectiveIsFamily =
          effectiveUser.id === currentUser.id ||
          familyMembers.some((m) => m.id === effectiveUser.id);
        if (effectiveIsFamily) return true;
        return !privacy.blockStranger;
      }
      if (v.visibility === 'family') {
        if (!v.visibleToMemberIds || v.visibleToMemberIds.length === 0) return true;
        return v.visibleToMemberIds.includes(effectiveUser.id);
      }
      return false;
    });
  },

  getHomeFeedVideos: () => {
    const visible = get().getVisibleVideosForMe();
    return visible.filter((v) => v.visibility !== 'private');
  },

  getNotificationsForMe: () => {
    const effectiveUser = get().getEffectiveUser();
    return get().notifications.filter((n) => n.toUserId === effectiveUser.id);
  },

  getUnreadNotificationCount: () => {
    return get().getNotificationsForMe().filter((n) => !n.isRead).length;
  },

  markNotificationRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      saveNotifications(updated);
      return { notifications: updated };
    });
  },

  markAllNotificationsRead: () => {
    set((state) => {
      const effectiveUser = get().getEffectiveUser();
      const updated = state.notifications.map((n) =>
        n.toUserId === effectiveUser.id ? { ...n, isRead: true } : n
      );
      saveNotifications(updated);
      return { notifications: updated };
    });
  }
}));
