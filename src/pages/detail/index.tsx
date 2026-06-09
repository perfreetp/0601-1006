import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { VoiceComment } from '@/types/video';

type RecordingState = 'idle' | 'recording' | 'finished';

const genCommentId = () => `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const formatCommentTime = (d: Date) =>
  `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

const DetailPage: React.FC = () => {
  const router = useRouter();
  const videoId = router.params.id || '';

  const videos = useAppStore((s) => s.videos);
  const currentUser = useAppStore((s) => s.currentUser);
  const familyMembers = useAppStore((s) => s.familyMembers);
  const privacy = useAppStore((s) => s.privacy);
  const viewAsUserId = useAppStore((s) => s.viewAsUserId);
  const getEffectiveUser = useAppStore((s) => s.getEffectiveUser);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const toggleCollect = useAppStore((s) => s.toggleCollect);
  const addVoiceComment = useAppStore((s) => s.addVoiceComment);

  const video = useMemo(() => videos.find((v) => v.id === videoId) || videos[0], [videos, videoId]);
  const effectiveUser = useMemo(() => getEffectiveUser(), [getEffectiveUser, viewAsUserId]);
  const isViewingAs = viewAsUserId !== null;

  const hasPermission = useMemo(() => {
    if (!video) return false;
    if (video.visibility === 'private') return video.author.id === effectiveUser.id;
    if (video.author.id === effectiveUser.id) return true;
    if (video.visibility === 'public') return !privacy.blockStranger;
    if (video.visibility === 'family') {
      if (!video.visibleToMemberIds || video.visibleToMemberIds.length === 0) return true;
      return video.visibleToMemberIds.includes(effectiveUser.id);
    }
    return false;
  }, [video, effectiveUser, privacy]);

  const visibleMemberNames = useMemo(() => {
    if (!video || video.visibility !== 'family' || !video.visibleToMemberIds) return '';
    const names = video.visibleToMemberIds
      .map((id) => familyMembers.find((m) => m.id === id)?.name)
      .filter(Boolean) as string[];
    if (names.length === 0) return '';
    if (names.length <= 3) return names.join('、');
    return `${names.slice(0, 3).join('、')}等${names.length}人`;
  }, [video, familyMembers]);

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingCommentId, setPlayingCommentId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState(0);
  const [replyingTo, setReplyingTo] = useState<VoiceComment | null>(null);

  const recordTimerRef = useRef<number | null>(null);
  const playTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, []);

  const clearRecordTimer = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const clearPlayTimer = () => {
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
  };

  if (!video) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text style={{ fontSize: 80 }}>📭</Text>
          <Text style={{ fontSize: 36, color: '#86909C', display: 'block', marginTop: 20 }}>
            视频不存在或已删除
          </Text>
          <Button style={{ marginTop: 40 }} onClick={() => Taro.navigateBack()}>
            返回
          </Button>
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className={styles.page}>
        <View className={styles.noPermission}>
          <Text className={styles.noPermissionIcon}>🔒</Text>
          <Text className={styles.noPermissionTitle}>您暂时无法查看这个视频</Text>
          <Text className={styles.noPermissionDesc}>
            {isViewingAs
              ? `当前以「${effectiveUser.name}」身份预览，TA 没有被授权查看这个作品`
              : '这个作品设置了可见范围，您不在可查看的亲友名单中'}
          </Text>
          {isViewingAs && (
            <Text className={styles.noPermissionHint}>
              💡 切换回「{currentUser.name}」视角或其他家人身份试试
            </Text>
          )}
          <View className={styles.noPermissionActions}>
            <Button className={styles.noPermissionBtn} onClick={() => Taro.navigateBack()}>
              ← 返回亲友圈
            </Button>
            {isViewingAs && (
              <Button
                className={styles.noPermissionBtnSecondary}
                onClick={() => {
                  useAppStore.getState().setViewAsUser(null);
                }}
              >
                切回自己身份
              </Button>
            )}
          </View>
        </View>
      </View>
    );
  }

  const startRecording = (replyComment?: VoiceComment) => {
    if (recordingState === 'recording') return;
    if (replyComment) {
      setReplyingTo(replyComment);
      console.log('[DetailPage] 开始录制语音回复，回复:', replyComment.author.name);
      Taro.showToast({ title: `正在回复 ${replyComment.author.name}，说话吧...`, icon: 'none', duration: 1500 });
    } else {
      setReplyingTo(null);
      console.log('[DetailPage] 开始录制语音评论');
      Taro.showToast({ title: '正在录音，说话吧...', icon: 'none', duration: 1500 });
    }
    setRecordingState('recording');
    setRecordSeconds(0);
    recordTimerRef.current = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= 60) {
          finishRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000) as unknown as number;
  };

  const finishRecording = () => {
    if (recordingState !== 'recording') return;
    clearRecordTimer();
    if (recordSeconds < 1) {
      Taro.showToast({ title: '录制时间太短', icon: 'none' });
      setRecordingState('idle');
      setRecordSeconds(0);
      return;
    }
    console.log('[DetailPage] 录制完成，时长:', recordSeconds, '秒');
    setRecordingState('finished');
  };

  const cancelRecording = () => {
    clearRecordTimer();
    console.log('[DetailPage] 取消录制，不新增评论');
    setRecordingState('idle');
    setRecordSeconds(0);
    setReplyingTo(null);
    Taro.showToast({ title: '已取消录制', icon: 'none' });
  };

  const sendVoiceComment = () => {
    if (recordingState !== 'finished' || recordSeconds < 1) return;
    const now = new Date();
    const newComment: VoiceComment = {
      id: genCommentId(),
      author: { ...effectiveUser },
      duration: recordSeconds,
      audioUrl: '',
      createTime: formatCommentTime(now),
      ...(replyingTo
        ? { replyTo: { id: replyingTo.id, name: replyingTo.author.name } }
        : {})
    };
    addVoiceComment(video.id, newComment);
    console.log('[DetailPage] 发送语音评论:', newComment);
    setRecordingState('idle');
    setRecordSeconds(0);
    setReplyingTo(null);
    Taro.showToast({
      title: replyingTo ? '回复已发布' : '评论已发布', icon: 'success' });
  };

  const handleLike = () => {
    toggleLike(video.id);
  };

  const handleCollect = () => {
    const wasCollected = video.isCollected;
    toggleCollect(video.id);
    Taro.showToast({ title: wasCollected ? '已取消收藏' : '已收藏', icon: 'none' });
  };

  const playVoiceComment = (comment: VoiceComment) => {
    if (playingCommentId === comment.id) {
      clearPlayTimer();
      setPlayingCommentId(null);
      setPlayProgress(0);
      return;
    }
    clearPlayTimer();
    setPlayingCommentId(comment.id);
    setPlayProgress(0);
    let elapsed = 0;
    Taro.showToast({ title: `播放中 ${comment.duration}"`, icon: 'none', duration: 1000 });
    playTimerRef.current = setInterval(() => {
      elapsed += 1;
      setPlayProgress(Math.min(elapsed / comment.duration, 1));
      if (elapsed >= comment.duration) {
        clearPlayTimer();
        setPlayingCommentId(null);
        setPlayProgress(0);
      }
    }, 1000) as unknown as number;
  };

  return (
    <View className={styles.page}>
      <View className={styles.videoPlayer}>
        <Image
          className={styles.coverImg}
          src={video.coverUrl}
          mode="aspectFill"
          onError={(e) => console.error('[Detail] 图片加载失败:', e)}
        />
        <View className={styles.playBtn}>
          <Text className={styles.playIcon}>▶</Text>
        </View>
        {video.visibility === 'private' && (
          <View className={styles.visibilityTagPrivate}>
            <Text>🔒 仅自己可见</Text>
          </View>
        )}
        {video.visibility === 'family' && video.visibleToMemberIds && video.visibleToMemberIds.length > 0 && (
          <View className={styles.visibilityTagFamily}>
            <Text>👨‍👩‍👧 {visibleMemberNames || `${video.visibleToMemberIds.length}位亲友可见`}</Text>
          </View>
        )}
        {video.visibility === 'family' && (!video.visibleToMemberIds || video.visibleToMemberIds.length === 0) && (
          <View className={styles.visibilityTagFamily}>
            <Text>👨‍👩‍👧 全部亲友可见</Text>
          </View>
        )}
        {video.visibility === 'public' && (
          <View className={styles.visibilityTagPublic}>
            <Text>🌍 公开</Text>
          </View>
        )}
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
          {video.filters && video.filters !== '原图' && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>🎨</Text>
              <Text className={styles.metaText}>{video.filters}滤镜</Text>
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
            video.comments.map((comment) => {
              const isPlaying = playingCommentId === comment.id;
              const progress = isPlaying ? playProgress : 0;
              return (
                <View key={comment.id} className={styles.commentItem}>
                  <Image className={styles.commentAvatar} src={comment.author.avatar} mode="aspectFill" />
                  <View className={styles.commentContent}>
                    <View className={styles.commentHeader}>
                      <View className={styles.commentNameRow}>
                        <Text className={styles.commentName}>{comment.author.name}</Text>
                        {comment.replyTo && (
                          <Text className={styles.commentReplyTag}>
                            回复 @{comment.replyTo.name}
                          </Text>
                        )}
                      </View>
                      <Text className={styles.commentTime}>{comment.createTime}</Text>
                    </View>
                    <View
                      className={classnames(styles.voiceBubble, isPlaying && styles.voiceBubblePlaying)}
                      onClick={() => playVoiceComment(comment)}
                    >
                      <Text className={styles.voiceIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                      <View className={styles.voiceWave}>
                        <View
                          className={styles.voiceWaveFill}
                          style={{ width: `${Math.max(progress * 100, 20)}%` }}
                        />
                      </View>
                      <Text className={styles.voiceDuration}>{comment.duration}"</Text>
                    </View>
                    <View className={styles.commentActions}>
                      <Button
                        className={styles.commentReplyBtn}
                        onClick={() => startRecording(comment)}
                      >
                        💬 语音回复
                      </Button>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text className={styles.noComment}>还没有评论，快来发第一条吧！</Text>
          )}
        </View>
      </View>

      {recordingState !== 'idle' && (
        <View className={styles.recordingOverlay}>
          <View className={styles.recordingPanel}>
            {replyingTo && (
              <View className={styles.replyingToBar}>
                <Text className={styles.replyingIcon}>↩️</Text>
                <Text className={styles.replyingText}>
                  正在回复 @{replyingTo.author.name}
                </Text>
              </View>
            )}
            {recordingState === 'recording' && (
              <>
                <View className={styles.recordingIndicator}>
                  <View className={styles.recordingDot} />
                  <Text className={styles.recordingTimeText}>{recordSeconds}"</Text>
                </View>
                <Text className={styles.recordingHint}>
                  {replyingTo ? '录制语音回复中...' : '正在录音，松开发送，上滑取消'}
                </Text>
                <View className={styles.recordingActions}>
                  <Button className={styles.cancelRecBtn} onClick={cancelRecording}>
                    ✕ 取消
                  </Button>
                  <Button className={styles.finishRecBtn} onClick={finishRecording}>
                    ✓ 完成 ({recordSeconds}")
                  </Button>
                </View>
              </>
            )}
            {recordingState === 'finished' && (
              <>
                <View className={styles.recordingFinishedIcon}>🎵</View>
                <Text className={styles.recordingFinishedText}>
                  {replyingTo ? `回复已录制 · ${recordSeconds}"` : `录制完成 · ${recordSeconds}"`}
                </Text>
                <View className={styles.recordingActions}>
                  <Button
                    className={styles.cancelRecBtn}
                    onClick={() => {
                      setRecordingState('recording');
                      setRecordSeconds(0);
                      recordTimerRef.current = setInterval(() => {
                        setRecordSeconds((prev) => {
                          if (prev >= 60) {
                            finishRecording();
                            return 60;
                          }
                          return prev + 1;
                        });
                      }, 1000) as unknown as number;
                    }}
                  >
                    🔄 重录
                  </Button>
                  <Button className={styles.finishRecBtn} onClick={sendVoiceComment}>
                    📤 发送评论
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.actionBtn, video.isLiked && styles.actionBtnActive)}
          onClick={handleLike}
        >
          <Text>{video.isLiked ? '❤️' : '🤍'}</Text>
          <Text>{video.isLiked ? `${video.likes}` : '点赞'}</Text>
        </Button>
        <Button
          className={classnames(styles.actionBtn, video.isCollected && styles.actionBtnActive)}
          onClick={handleCollect}
        >
          <Text>{video.isCollected ? '⭐' : '☆'}</Text>
          <Text>{video.isCollected ? '已藏' : '收藏'}</Text>
        </Button>
        <Button
          className={classnames(styles.voiceBtn, recordingState === 'recording' && styles.voiceBtnRecording)}
          onTouchStart={recordingState === 'idle' ? () => startRecording() : undefined}
          onClick={recordingState !== 'recording' ? () => startRecording() : undefined}
        >
          <Text>{recordingState === 'recording' ? '🔴' : '🎤'}</Text>
          <Text>
            {recordingState === 'recording' ? `录制中 ${recordSeconds}"` : '说句话评论'}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default DetailPage;
