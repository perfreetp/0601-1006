import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { VideoItem } from '@/types/video';

interface VideoCardProps {
  video: VideoItem;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onClick?: (id: string) => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VideoCard: React.FC<VideoCardProps> = ({ video, onLike, onComment, onClick }) => {
  const handleCardClick = () => {
    console.log('[VideoCard] 点击视频:', video.id);
    onClick?.(video.id);
    Taro.navigateTo({ url: `/pages/detail/index?id=${video.id}` });
  };

  const handleLike = (e: any) => {
    e.stopPropagation?.();
    console.log('[VideoCard] 点赞:', video.id);
    onLike?.(video.id);
  };

  const handleComment = (e: any) => {
    e.stopPropagation?.();
    console.log('[VideoCard] 评论:', video.id);
    onComment?.(video.id);
    Taro.showToast({ title: '长按说话评论', icon: 'none' });
  };

  return (
    <View className={styles.card} onClick={handleCardClick}>
      <View className={styles.coverWrap}>
        <Image className={styles.cover} src={video.coverUrl} mode="aspectFill" onError={(e) => console.error('[VideoCard] 图片加载失败:', e)} />
        <Text className={styles.duration}>{formatDuration(video.duration)}</Text>
      </View>

      <View className={styles.info}>
        <View className={styles.header}>
          <Image className={styles.avatar} src={video.author.avatar} mode="aspectFill" />
          <View className={styles.authorInfo}>
            <Text className={styles.authorName}>{video.author.name}</Text>
            <Text className={styles.meta}>{video.createTime}</Text>
          </View>
        </View>

        <Text className={styles.title}>{video.title}</Text>

        <View className={styles.metaInfo}>
          {video.date && (
            <View className={styles.metaItem}>
              <Text>📅 {video.date}</Text>
            </View>
          )}
          {video.location && (
            <View className={styles.metaItem}>
              <Text>📍 {video.location}</Text>
            </View>
          )}
        </View>

        {video.familyTags.length > 0 && (
          <View className={styles.tags}>
            {video.familyTags.map((tag) => (
              <Text key={tag} className={styles.tag}>
                👨‍👩‍👧 {tag}
              </Text>
            ))}
          </View>
        )}

        <View className={styles.actions}>
          <Button
            className={classnames(styles.likeBtn, video.isLiked && styles.likeBtnActive)}
            onClick={handleLike}
          >
            <Text className={styles.actionIcon}>{video.isLiked ? '❤️' : '🤍'}</Text>
            <Text className={classnames(styles.actionText, video.isLiked && styles.likeTextActive)}>
              点赞 {video.likes}
            </Text>
          </Button>

          <Button className={styles.commentBtn} onClick={handleComment}>
            <Text className={styles.actionIcon}>🎤</Text>
            <Text className={styles.actionText}>语音评论 {video.comments.length}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default VideoCard;
