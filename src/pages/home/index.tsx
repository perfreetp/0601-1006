import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import VideoCard from '@/components/VideoCard';
import { mockFamilyTags } from '@/data/videos';
import { useAppStore } from '@/store';
import type { FamilyMember } from '@/types/video';

const HomePage: React.FC = () => {
  const videos = useAppStore((s) => s.videos);
  const currentUser = useAppStore((s) => s.currentUser);
  const familyMembers = useAppStore((s) => s.familyMembers);
  const viewAsUserId = useAppStore((s) => s.viewAsUserId);
  const setViewAsUser = useAppStore((s) => s.setViewAsUser);
  const getEffectiveUser = useAppStore((s) => s.getEffectiveUser);
  const getHomeFeedVideos = useAppStore((s) => s.getHomeFeedVideos);
  const toggleLike = useAppStore((s) => s.toggleLike);

  const [activeFilter, setActiveFilter] = useState<string>('全部');

  const effectiveUser = useMemo(() => getEffectiveUser(), [getEffectiveUser, viewAsUserId]);
  const isViewingAs = viewAsUserId !== null;

  const visibleVideos = useMemo(() => {
    return getHomeFeedVideos();
  }, [videos, getHomeFeedVideos, viewAsUserId]);

  const allViewUsers = useMemo<Array<{ id: string; name: string; avatar: string; label: string }>>(() => {
    return [
      { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, label: '我自己' },
      ...familyMembers.map((m: FamilyMember) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        label: m.relation
      }))
    ];
  }, [currentUser, familyMembers]);

  const allFilters = useMemo(() => ['全部', ...mockFamilyTags], []);

  const filteredVideos = useMemo(() => {
    if (activeFilter === '全部') return visibleVideos;
    return visibleVideos.filter((v) => v.familyTags.includes(activeFilter));
  }, [visibleVideos, activeFilter]);

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

  const handleSwitchView = (userId: string) => {
    if (userId === currentUser.id) {
      setViewAsUser(null);
      Taro.showToast({ title: `已切回${currentUser.name}视角`, icon: 'none' });
    } else {
      setViewAsUser(userId);
      const member = familyMembers.find((m) => m.id === userId);
      Taro.showToast({ title: `已切换到${member?.name || '家人'}视角`, icon: 'none' });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>👨‍👩‍👧‍👦 亲友圈</Text>
        <Button className={styles.publishBtn} onClick={handlePublish}>
          📹 发视频
        </Button>
      </View>

      <View className={styles.viewSwitcher}>
        <View className={styles.viewSwitcherHeader}>
          <Text className={styles.viewSwitcherLabel}>
            {isViewingAs ? '🔄 家人视角预览（测试权限）' : '👤 当前身份'}
          </Text>
          <View className={styles.viewCurrentUser}>
            <Image className={styles.viewAvatar} src={effectiveUser.avatar} mode="aspectFill" />
            <Text className={styles.viewUserName}>{effectiveUser.name}</Text>
            {isViewingAs && (
              <Button
                className={styles.viewResetBtn}
                onClick={() => handleSwitchView(currentUser.id)}
              >
                切回自己
              </Button>
            )}
          </View>
        </View>
        <ScrollView className={styles.viewUserScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.viewUserList}>
            {allViewUsers.map((u) => {
              const isActive = u.id === effectiveUser.id;
              return (
                <View
                  key={u.id}
                  className={classnames(styles.viewUserItem, isActive && styles.viewUserItemActive)}
                  onClick={() => handleSwitchView(u.id)}
                >
                  <Image className={styles.viewUserAvatar} src={u.avatar} mode="aspectFill" />
                  <Text className={styles.viewUserNameSmall}>{u.name}</Text>
                  <Text className={styles.viewUserLabel}>{u.label}</Text>
                  {isActive && <View className={styles.viewUserCheck}>✓</View>}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {isViewingAs && (
        <View className={styles.viewHintBar}>
          <Text className={styles.viewHintIcon}>👓</Text>
          <Text className={styles.viewHintText}>
            正在以「{effectiveUser.name}」身份浏览，只能看到 TA 有权限查看的视频
          </Text>
        </View>
      )}

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
