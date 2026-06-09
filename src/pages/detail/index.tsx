import React, { useState } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockVideos } from '@/data/videos';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const videoId = router.params.id || mockVideos[0].id;
  const video = mockVideos.find((v) => v.id === videoId) || mockVideos[0];

  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [isCollected, setIsCollected] = useState(video.isCollected);

  const handleLike = () => {
    console.log('[DetailPage] 点赞');
    setIsLiked(!isLiked);
  };

  const handleCollect = () => {
    console.log('[DetailPage] 收藏');
    setIsCollected(!isCollected);
    Taro.showToast({ title: isCollected ? '已取消收藏' : '已收藏', icon: 'none' });
  };

  const handleVoiceComment = () => {
    console.log('[DetailPage] 语音评论');
    Taro.showToast({ title: '长按说话录制评论', icon: 'none' });
  };

  const playVoiceComment = (duration: number) => {
    console.log('[DetailPage] 播放语音评论，时长:', duration);
    Taro.showToast({ title: `播放中 ${duration}秒`, icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.videoPlayer}>
        <Image className={styles.coverImg} src={video.coverUrl} mode="aspectFill" onError={(e) => console.error('[Detail] 图片加载失败:', e)} />
        <View className={styles.playBtn}>
          <Text className={styles.playIcon}>▶</Text>
        </View>
      </View>

      <View className={styles.content}>
        <Text className={styles.title}>{video.title}</Text>

        <View className={styles.authorRow}>
          <Image className={styles.avatar} src={video.author.avatar} mode="aspectFill" />
          <View className={styles.authorInfo}>
            <Text className={styles.authorName}>{video.author.name}</Text>
            <Text className={styles.createTime}>{video.createTime}</Text>
          </View>
        </View>

        <View className={styles.metaCard}>
          {video.date && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📅</Text>
              <Text className={styles.metaText}>{video.date}</Text>
            </View>
          )}
          {video.location && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📍</Text>
              <Text className={styles.metaText}>{video.location}</Text>
            </View>
          )}
          {video.narration && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>🎤</Text>
              <Text className={styles.metaText}>包含语音旁白</Text>
            </View>
          )}
          {video.oldPhotoCompare && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📷</Text>
              <Text className={styles.metaText}>老照片对比效果</Text>
            </View>
          )}
        </View>

        {video.familyTags.length > 0 && (
          <View className={styles.tagsSection}>
            <Text className={styles.sectionTitle}>👨‍👩‍👧 家人标签</Text>
            <View className={styles.tags}>
              {video.familyTags.map((tag) => (
                <Text key={tag} className={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View className={styles.commentsSection}>
          <Text className={styles.sectionTitle}>🎤 语音评论 ({video.comments.length})</Text>
          {video.comments.length > 0 ? (
            video.comments.map((comment) => (
              <View key={comment.id} className={styles.commentItem}>
                <Image className={styles.commentAvatar} src={comment.author.avatar} mode="aspectFill" />
                <View className={styles.commentContent}>
                  <View className={styles.commentHeader}>
                    <Text className={styles.commentName}>{comment.author.name}</Text>
                    <Text className={styles.commentTime}>{comment.createTime}</Text>
                  </View>
                  <View className={styles.voiceBubble} onClick={() => playVoiceComment(comment.duration)}>
                    <Text className={styles.voiceIcon}>▶</Text>
                    <Text className={styles.voiceDuration}>{comment.duration}" 语音</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 32, color: '#86909C', textAlign: 'center', padding: 32 }}>
              还没有评论，快来发第一条吧！
            </Text>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.actionBtn, isLiked && styles.actionBtnActive)}
          onClick={handleLike}
        >
          <Text>{isLiked ? '❤️' : '🤍'}</Text>
          <Text>{isLiked ? '已赞' : '点赞'}</Text>
        </Button>
        <Button
          className={classnames(styles.actionBtn, isCollected && styles.actionBtnActive)}
          onClick={handleCollect}
        >
          <Text>{isCollected ? '⭐' : '☆'}</Text>
          <Text>{isCollected ? '已藏' : '收藏'}</Text>
        </Button>
        <Button className={styles.voiceBtn} onClick={handleVoiceComment}>
          <Text>🎤</Text>
          <Text>说句话评论</Text>
        </Button>
      </View>
    </View>
  );
};

export default DetailPage;
