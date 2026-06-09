import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import VideoCard from '@/components/VideoCard';
import { mockFamilyTags } from '@/data/videos';
import { useAppStore } from '@/store';

const HomePage: React.FC = () => {
  const getVisibleVideosForMe = useAppStore((s) => s.getVisibleVideosForMe);
  const toggleLike = useAppStore((s) => s.toggleLike);

  const [activeFilter, setActiveFilter] = useState<string>('全部');

  const videos = useMemo(() => getVisibleVideosForMe(), [getVisibleVideosForMe]);

  const allFilters = useMemo(() => ['全部', ...mockFamilyTags], []);

  const filteredVideos = useMemo(() => {
    if (activeFilter === '全部') return videos;
    return videos.filter((v) => v.familyTags.includes(activeFilter));
  }, [videos, activeFilter]);

  const handlePublish = () => {
    console.log('[HomePage] 点击发布');
    Taro.switchTab({ url: '/pages/capture/index' });
  };

  const handleLike = (id: string) => {
    console.log('[HomePage] 点赞视频:', id);
    toggleLike(id);
  };

  const handleFilterClick = (tag: string) => {
    console.log('[HomePage] 选择筛选:', tag);
    setActiveFilter(tag);
  };

  const handleRefresh = () => {
    console.log('[HomePage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '已更新', icon: 'success' });
    }, 1000);
  };

  React.useEffect(() => {
    Taro.eventCenter.on('onPullDownRefresh', handleRefresh);
    return () => {
      Taro.eventCenter.off('onPullDownRefresh', handleRefresh);
    };
  }, []);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>👨‍👩‍👧‍👦 亲友圈</Text>
        <Button className={styles.publishBtn} onClick={handlePublish}>
          📹 发视频
        </Button>
      </View>

      <View className={styles.tipBar}>
        <Text className={styles.tipIcon}>💡</Text>
        <Text className={styles.tipText}>快给家人的视频点个赞吧！</Text>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterTitle}>按家人筛选</Text>
        <ScrollView className={styles.filterScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.filterList}>
            {allFilters.map((tag) => (
              <View
                key={tag}
                className={classnames(styles.filterItem, activeFilter === tag && styles.filterItemActive)}
                onClick={() => handleFilterClick(tag)}
              >
                <Text className={styles.filterText}>{tag}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {filteredVideos.length > 0 ? (
        <View className={styles.list}>
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} onLike={handleLike} />
          ))}
        </View>
      ) : (
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>
            {activeFilter === '全部'
              ? '亲友圈还没有视频，快去发布第一个吧！'
              : `还没有与"${activeFilter}"相关的视频`}
          </Text>
          <Button className={styles.emptyBtn} onClick={handlePublish}>
            立即拍摄
          </Button>
        </View>
      )}
    </View>
  );
};

export default HomePage;
