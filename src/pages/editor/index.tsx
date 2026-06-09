import React from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const EditorPage: React.FC = () => {
  const editingVideo = useAppStore((s) => s.currentEditingVideo);
  const updateEditingVideo = useAppStore((s) => s.updateEditingVideo);

  if (!editingVideo) {
    return (
      <View className={styles.page}>
        <Text className={styles.icon}>📭</Text>
        <Text className={styles.title}>暂无可编辑的视频</Text>
        <Text className={styles.desc}>请先返回拍摄页录制一段视频，或从相册导入</Text>
        <Button
          className={styles.btn}
          style={{ marginTop: 40 }}
          onClick={() => Taro.switchTab({ url: '/pages/capture/index' })}
        >
          📹 去拍摄
        </Button>
      </View>
    );
  }

  const segments = editingVideo.segments || [];
  const totalDuration = editingVideo.duration;

  const handleGoSubtitle = () => {
    console.log('[EditorPage] 进入字幕编辑');
    Taro.switchTab({ url: '/pages/subtitle/index' });
  };

  const handleDeleteSegment = (segId: string) => {
    const newSegments = segments.filter((s) => s.id !== segId);
    const newDuration = newSegments.reduce((acc, s) => acc + (s.endTime - s.startTime), 0);
    updateEditingVideo({ segments: newSegments, duration: newDuration });
    Taro.showToast({ title: '已删除该片段', icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <Text className={styles.icon}>✂️</Text>
      <Text className={styles.title}>视频自动分段完成</Text>
      <Text className={styles.desc}>
        {editingVideo.title} · 共 {formatDuration(totalDuration)}
        {'\n'}已自动分为 {segments.length} 个片段，您可以删除不需要的片段
      </Text>

      <View className={styles.videoCoverRow}>
        <Image className={styles.coverImg} src={editingVideo.coverUrl} mode="aspectFill" />
        <View className={styles.coverInfo}>
          <Text className={styles.coverTitle}>{editingVideo.title}</Text>
          <Text className={styles.coverMeta}>📅 {editingVideo.date || '未设置日期'}</Text>
          <Text className={styles.coverMeta}>📍 {editingVideo.location || '未设置地点'}</Text>
        </View>
      </View>

      <View className={styles.segmentList}>
        <Text className={styles.segmentTitle}>视频片段 ({segments.length} 段)</Text>
        {segments.length === 0 ? (
          <Text className={styles.emptyTip}>没有可编辑的片段</Text>
        ) : (
          segments.map((seg, idx) => {
            const dur = seg.endTime - seg.startTime;
            return (
              <View key={seg.id} className={styles.segmentItem}>
                <Text className={styles.segmentIndex}>{idx + 1}</Text>
                <Image className={styles.segmentThumb} src={seg.thumbnail} mode="aspectFill" />
                <View className={styles.segmentInfo}>
                  <Text className={styles.segmentName}>片段 {idx + 1}</Text>
                  <Text className={styles.segmentDuration}>
                    时长：{formatDuration(dur)} · {seg.startTime}s-{seg.endTime}s
                  </Text>
                </View>
                <Button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteSegment(seg.id)}
                >
                  删除
                </Button>
              </View>
            );
          })
        )}
      </View>

      <View className={styles.btnRow}>
        <Button
          className={styles.btnSecondary}
          onClick={() => Taro.switchTab({ url: '/pages/capture/index' })}
        >
          🔄 重新拍摄
        </Button>
        <Button className={styles.btn} onClick={handleGoSubtitle}>
          ✍️ 添加字幕和滤镜
        </Button>
      </View>
    </View>
  );
};

export default EditorPage;
