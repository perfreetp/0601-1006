import { VideoItem, FilterOption, FamilyMember } from '@/types/video';

export const mockVideos: VideoItem[] = [
  {
    id: '1',
    title: '孙子生日聚会',
    coverUrl: 'https://picsum.photos/id/64/750/500',
    videoUrl: '',
    author: {
      id: 'u1',
      name: '王奶奶',
      avatar: 'https://picsum.photos/id/177/200/200'
    },
    createTime: '2025-06-01',
    date: '2025年6月1日',
    location: '家里客厅',
    duration: 45,
    likes: 12,
    comments: [
      {
        id: 'c1',
        author: { id: 'u2', name: '小明', avatar: 'https://picsum.photos/id/338/200/200' },
        duration: 8,
        audioUrl: '',
        createTime: '2025-06-01'
      }
    ],
    isLiked: true,
    isCollected: true,
    familyTags: ['孙子', '儿子一家'],
    filters: '怀旧',
    subtitles: [],
    narration: true,
    oldPhotoCompare: false,
    visibility: 'family'
  },
  {
    id: '2',
    title: '老姐妹公园散步',
    coverUrl: 'https://picsum.photos/id/1015/750/500',
    videoUrl: '',
    author: {
      id: 'u1',
      name: '王奶奶',
      avatar: 'https://picsum.photos/id/177/200/200'
    },
    createTime: '2025-05-28',
    date: '2025年5月28日',
    location: '人民公园',
    duration: 62,
    likes: 8,
    comments: [],
    isLiked: false,
    isCollected: false,
    familyTags: ['老姐妹'],
    filters: '温暖',
    subtitles: [],
    narration: false,
    oldPhotoCompare: true,
    visibility: 'family'
  },
  {
    id: '3',
    title: '孙女学做饭',
    coverUrl: 'https://picsum.photos/id/292/750/500',
    videoUrl: '',
    author: {
      id: 'u3',
      name: '李爷爷',
      avatar: 'https://picsum.photos/id/1027/200/200'
    },
    createTime: '2025-05-25',
    date: '2025年5月25日',
    location: '厨房',
    duration: 88,
    likes: 15,
    comments: [
      {
        id: 'c2',
        author: { id: 'u1', name: '王奶奶', avatar: 'https://picsum.photos/id/177/200/200' },
        duration: 12,
        audioUrl: '',
        createTime: '2025-05-26'
      }
    ],
    isLiked: true,
    isCollected: false,
    familyTags: ['孙女'],
    filters: '明亮',
    subtitles: [],
    narration: true,
    oldPhotoCompare: false,
    visibility: 'family'
  },
  {
    id: '4',
    title: '春节全家福',
    coverUrl: 'https://picsum.photos/id/1025/750/500',
    videoUrl: '',
    author: {
      id: 'u1',
      name: '王奶奶',
      avatar: 'https://picsum.photos/id/177/200/200'
    },
    createTime: '2025-01-29',
    date: '2025年1月29日',
    location: '老家',
    duration: 120,
    likes: 28,
    comments: [
      {
        id: 'c3',
        author: { id: 'u4', name: '大女儿', avatar: 'https://picsum.photos/id/64/200/200' },
        duration: 6,
        audioUrl: '',
        createTime: '2025-01-30'
      }
    ],
    isLiked: true,
    isCollected: true,
    familyTags: ['全家', '儿子一家', '女儿一家'],
    filters: '怀旧',
    subtitles: [],
    narration: true,
    oldPhotoCompare: true,
    visibility: 'family'
  },
  {
    id: '5',
    title: '小区晨练',
    coverUrl: 'https://picsum.photos/id/1036/750/500',
    videoUrl: '',
    author: {
      id: 'u3',
      name: '李爷爷',
      avatar: 'https://picsum.photos/id/1027/200/200'
    },
    createTime: '2025-05-20',
    date: '2025年5月20日',
    location: '小区广场',
    duration: 35,
    likes: 5,
    comments: [],
    isLiked: false,
    isCollected: false,
    familyTags: ['老邻居'],
    filters: '自然',
    subtitles: [],
    narration: false,
    oldPhotoCompare: false,
    visibility: 'public'
  },
  {
    id: '6',
    title: '外孙获奖',
    coverUrl: 'https://picsum.photos/id/225/750/500',
    videoUrl: '',
    author: {
      id: 'u1',
      name: '王奶奶',
      avatar: 'https://picsum.photos/id/177/200/200'
    },
    createTime: '2025-05-15',
    date: '2025年5月15日',
    location: '学校礼堂',
    duration: 55,
    likes: 20,
    comments: [],
    isLiked: true,
    isCollected: true,
    familyTags: ['外孙', '女儿一家'],
    filters: '明亮',
    subtitles: [],
    narration: true,
    oldPhotoCompare: false,
    visibility: 'family'
  },
  {
    id: '7',
    title: '金婚纪念日',
    coverUrl: 'https://picsum.photos/id/1039/750/500',
    videoUrl: '',
    author: {
      id: 'u1',
      name: '王奶奶',
      avatar: 'https://picsum.photos/id/177/200/200'
    },
    createTime: '2025-04-10',
    date: '2025年4月10日',
    location: '餐厅',
    duration: 180,
    likes: 45,
    comments: [
      {
        id: 'c4',
        author: { id: 'u3', name: '李爷爷', avatar: 'https://picsum.photos/id/1027/200/200' },
        duration: 15,
        audioUrl: '',
        createTime: '2025-04-10'
      }
    ],
    isLiked: true,
    isCollected: true,
    familyTags: ['老伴', '全家'],
    filters: '怀旧',
    subtitles: [],
    narration: true,
    oldPhotoCompare: true,
    visibility: 'family'
  },
  {
    id: '8',
    title: '种的花开了',
    coverUrl: 'https://picsum.photos/id/1044/750/500',
    videoUrl: '',
    author: {
      id: 'u1',
      name: '王奶奶',
      avatar: 'https://picsum.photos/id/177/200/200'
    },
    createTime: '2025-05-10',
    date: '2025年5月10日',
    location: '阳台',
    duration: 22,
    likes: 6,
    comments: [],
    isLiked: false,
    isCollected: false,
    familyTags: [],
    filters: '自然',
    subtitles: [],
    narration: false,
    oldPhotoCompare: false,
    visibility: 'public'
  },
  {
    id: '9',
    title: '重孙第一次走路',
    coverUrl: 'https://picsum.photos/id/338/750/500',
    videoUrl: '',
    author: {
      id: 'u1',
      name: '王奶奶',
      avatar: 'https://picsum.photos/id/177/200/200'
    },
    createTime: '2025-05-05',
    date: '2025年5月5日',
    location: '客厅',
    duration: 38,
    likes: 32,
    comments: [],
    isLiked: true,
    isCollected: true,
    familyTags: ['重孙', '儿子一家'],
    filters: '温暖',
    subtitles: [],
    narration: true,
    oldPhotoCompare: false,
    visibility: 'family'
  },
  {
    id: '10',
    title: '老同学聚会',
    coverUrl: 'https://picsum.photos/id/431/750/500',
    videoUrl: '',
    author: {
      id: 'u3',
      name: '李爷爷',
      avatar: 'https://picsum.photos/id/1027/200/200'
    },
    createTime: '2025-04-28',
    date: '2025年4月28日',
    location: '酒店',
    duration: 95,
    likes: 18,
    comments: [],
    isLiked: false,
    isCollected: false,
    familyTags: ['老同学'],
    filters: '怀旧',
    subtitles: [],
    narration: true,
    oldPhotoCompare: true,
    visibility: 'family'
  }
];

export const mockFilters: FilterOption[] = [
  { id: 'f1', name: '原图', preview: 'https://picsum.photos/id/1/100/100' },
  { id: 'f2', name: '怀旧', preview: 'https://picsum.photos/id/2/100/100' },
  { id: 'f3', name: '温暖', preview: 'https://picsum.photos/id/3/100/100' },
  { id: 'f4', name: '明亮', preview: 'https://picsum.photos/id/6/100/100' },
  { id: 'f5', name: '自然', preview: 'https://picsum.photos/id/8/100/100' },
  { id: 'f6', name: '老照片', preview: 'https://picsum.photos/id/9/100/100' }
];

export const mockFamilyMembers: FamilyMember[] = [
  { id: 'fm1', name: '老伴', avatar: 'https://picsum.photos/id/1027/200/200', relation: '配偶' },
  { id: 'fm2', name: '大儿子', avatar: 'https://picsum.photos/id/338/200/200', relation: '儿子' },
  { id: 'fm3', name: '大女儿', avatar: 'https://picsum.photos/id/64/200/200', relation: '女儿' },
  { id: 'fm4', name: '小儿子', avatar: 'https://picsum.photos/id/177/200/200', relation: '儿子' },
  { id: 'fm5', name: '孙子小明', avatar: 'https://picsum.photos/id/91/200/200', relation: '孙辈' },
  { id: 'fm6', name: '孙女小红', avatar: 'https://picsum.photos/id/237/200/200', relation: '孙辈' },
  { id: 'fm7', name: '外孙小刚', avatar: 'https://picsum.photos/id/659/200/200', relation: '孙辈' }
];

export const mockFamilyTags = [
  '全家', '老伴', '儿子一家', '女儿一家', '孙子', '孙女', '外孙', '外孙女', '重孙', '老姐妹', '老邻居', '老同学'
];
