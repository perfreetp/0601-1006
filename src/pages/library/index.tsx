import React, { useState, useMemo } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockFamilyTags } from '@/data/videos';
import { useAppStore } from '@/store';

type LibraryTab = 'all' | 'collect' | 'person';

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const LibraryPage: React.FC = () => {
  const getMyVideos = useAppStore((s) => s.getMyVideos);
  const toggleCollect = useAppStore((s) => s.toggleCollect);

  const myVideos = useMemo(() => getMyVideos(), [getMyVideos]);

  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [activePersonFilter, setActivePersonFilter] = useState<string>('全部');

  const personFilters = useMemo(() => ['全部', ...mockFamilyTags.slice(0, 8)], []);

  const displayVideos = useMemo(() => {
    let result = myVideos;
    if (activeTab === 'collect') {
      result = result.filter((v) => v.isCollected);
    }
    if (activeTab === 'person' && activePersonFilter !== '全部') {
      result = result.filter((v) => v.familyTags.includes(activePersonFilter));
    }
    return result;
  }, [myVideos, activeTab, activePersonFilter]);

  const handleVideoClick = (id: string) => {
    console.log('[LibraryPage] 点击视频:', id);
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const handleToggleCollect = (e: any, id: string) => {
    e.stopPropagation?.();
    console.log('[LibraryPage] 切换收藏:', id);
    const target = myVideos.find((v) => v.id === id);
    toggleCollect(id);
    Taro.showToast({
      title: target?.isCollected ? '已取消收藏' : '已收藏',
      icon: 'none'
    });
  };

  const handleGenerateMemory = () => {
    console.log('[LibraryPage] 生成年度回忆');
    Taro.showLoading({ title: '生成中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.navigateTo({ url: '/pages/memory/index' });
    }, 1500);
  };

  const handleReminderShoot = () => {
    console.log('[LibraryPage] 补拍提醒');
    Taro.switchTab({ url: '/pages/capture/index' });
  };

  const handleGoCapture = () => {
    Taro.switchTab({ url: '/pages/capture/index' });
  };

  const handleFamilyManage = () => {
    console.log('[LibraryPage] 管理家人');
    Taro.navigateTo({ url: '/pages/family/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>📁 我的作品</Text>
        <Text className={styles.subtitle}>共 {myVideos.length} 个视频，记录美好时光</Text>
      </View>

      <View className={styles.quickActions}>
        <View
          className={classnames(styles.actionCard, styles.actionCardPrimary)}
          onClick={handleGenerateMemory}
        >
          <Text className={styles.actionIcon}>🎬</Text>
          <Text className={styles.actionTitle}>年度回忆</Text>
          <Text className={styles.actionDesc}>一键生成精彩集锦</Text>
        </View>
        <View className={styles.actionCard} onClick={handleFamilyManage}>
          <Text className={styles.actionIcon}>👨‍👩‍👧</Text>
          <Text className={styles.actionTitle}>按人物整理</Text>
          <Text className={styles.actionDesc}>家人分类更清晰</Text>
        </View>
      </View>

      <View className={styles.reminderCard}>
        <Text className={styles.reminderIcon}>⏰</Text>
        <View className={styles.reminderContent}>
          <Text className={styles.reminderTitle}>温馨提醒</Text>
          <Text className={styles.reminderText}>好久没记录孙子的成长了，快去拍一段吧！</Text>
        </View>
        <Button className={styles.reminderBtn} onClick={handleReminderShoot}>
          去拍摄
        </Button>
      </View>

      <View className={styles.tabs}>
        <Button
          className={classnames(styles.tab, activeTab === 'all' && styles.tabActive)}
          onClick={() => setActiveTab('all')}
        >
          📹 全部作品 ({myVideos.length})
        </Button>
        <Button
          className={classnames(styles.tab, activeTab === 'collect' && styles.tabActive)}
          onClick={() => setActiveTab('collect')}
        >
          ⭐ 重要收藏 ({myVideos.filter((v) => v.isCollected).length})
        </Button>
        <Button
          className={classnames(styles.tab, activeTab === 'person' && styles.tabActive)}
          onClick={() => setActiveTab('person')}
        >
          👨‍👩‍👧 按人物
        </Button>
      </View>

      {activeTab === 'person' && (
        <ScrollView className={styles.filterScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.filterList}>
            {personFilters.map((tag) => (
              <View
                key={tag}
                className={classnames(styles.filterItem, activePersonFilter === tag && styles.filterItemActive)}
                onClick={() => setActivePersonFilter(tag)}
              >
                <Text className={styles.filterText}>{tag}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {displayVideos.length > 0 ? (
        <View className={styles.videoGrid}>
          {displayVideos.map((video) => (
            <View key={video.id} className={styles.videoItem} onClick={() => handleVideoClick(video.id)}>
              <View className={styles.videoCover}>
                <Image
                  className={styles.coverImg}
                  src={video.coverUrl}
                  mode="aspectFill"
                  onError={(e) => console.error('[Library] 图片加载失败:', e)}
                />
                <View className={styles.collectBtn} onClick={(e) => handleToggleCollect(e, video.id)}>
                  <Text className={styles.collectIcon}>{video.isCollected ? '⭐' : '☆'}</Text>
                </View>
                <Text className={styles.durationBadge}>{formatDuration(video.duration)}</Text>
                {video.visibility === 'private' && (
                  <Text className={styles.visibilityBadge}>🔒 仅自己</Text>
                )}
                {video.visibility === 'family' && video.visibleToMemberIds && video.visibleToMemberIds.length > 0 && (
                  <Text className={styles.visibilityBadgeFamily}>👨‍👩‍👧 {video.visibleToMemberIds.length}人</Text>
                )}
              </View>
              <View className={styles.videoInfo}>
                <Text className={styles.videoTitle}>{video.title}</Text>
                <Text className={styles.videoMeta}>
                  {video.createTime} · {video.location || '未标注地点'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>
            {activeTab === 'collect'
              ? '还没有收藏的视频\n点击星标收藏重要视频吧'
              : activeTab === 'person'
              ? '该分类下暂无视频'
              : '还没有作品，快去拍摄第一个视频吧！'}
          </Text>
          <Button className={styles.emptyBtn} onClick={handleGoCapture}>
            📹 立即拍摄
          </Button>
        </View>
      )}
    </View>
  );
};

export default LibraryPage;
