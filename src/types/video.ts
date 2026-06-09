export interface VideoItem {
  id: string;
  title: string;
  coverUrl: string;
  videoUrl: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createTime: string;
  date?: string;
  location?: string;
  duration: number;
  likes: number;
  comments: VoiceComment[];
  isLiked: boolean;
  isCollected: boolean;
  familyTags: string[];
  filters?: string;
  subtitles?: SubtitleItem[];
  narration?: boolean;
  oldPhotoCompare?: boolean;
  segments?: VideoSegment[];
  visibility: 'public' | 'family' | 'private';
  visibleToMemberIds?: string[];
  isDraft?: boolean;
}

export interface PrivacySettings {
  blockStranger: boolean;
  allowComment: boolean;
  allowShare: boolean;
  defaultVisibility: 'public' | 'family' | 'private';
  defaultVisibleToMemberIds?: string[];
}

export interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  thumbnail: string;
}

export interface SubtitleItem {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  fontSize: 'large' | 'xlarge' | 'xxlarge';
}

export interface VoiceComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  duration: number;
  audioUrl: string;
  createTime: string;
  replyTo?: {
    id: string;
    name: string;
  };
}

export interface FilterOption {
  id: string;
  name: string;
  preview: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  relation: string;
  isSelected?: boolean;
}
