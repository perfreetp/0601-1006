import React from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

const MemoryPage: React.FC = () => {
  const year = new Date().getFullYear();

  const highlights = [
    { id: '1', title: '孙子生日', date: '6月1日', cover: 'https://picsum.photos/id/64/400/300' },
    { id: '2', title: '金婚纪念', date: '4月10日', cover: 'https://picsum.photos/id/1039/400/300' },
    { id: '3', title: '重孙走路', date: '5月5日', cover: 'https://picsum.photos/id/338/400/300' },
    { id: '4', title: '春节团聚', date: '1月29日', cover: 'https://picsum.photos/id/1025/400/300' }
  ];

  const handlePlay = () => {
    console.log('[MemoryPage] 播放年度回忆');
    Taro.showToast({ title: '开始播放年度回忆', icon: 'none' });
  };

  const handleShare = () => {
    console.log('[MemoryPage] 分享年度回忆');
    Taro.showToast({ title: '已分享给亲友', icon: 'success' });
  };

  const handleRegenerate = () => {
    console.log('[MemoryPage] 重新生成');
    Taro.showLoading({ title: '重新生成中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '已生成新版本', icon: 'success' });
    }, 2000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.year}>{year}</Text>
        <Text className={styles.title}>🎬 我的年度回忆</Text>
        <Text className={styles.subtitle}>记录这一年的美好时光</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statNum}>8</Text>
          <Text className={styles.statLabel}>精彩片段</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNum}>12</Text>
          <Text className={styles.statLabel}>分钟时长</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNum}>7</Text>
          <Text className={styles.statLabel}>位家人</Text>
        </View>
      </View>

      <View className={styles.previewSection}>
        <Text className={styles.sectionTitle}>📽️ 回忆预览</Text>
        <View className={styles.previewCard}>
          <View className={styles.previewCover}>
            <Image className={styles.coverImg} src="https://picsum.photos/id/1015/800/500" mode="aspectFill" onError={(e) => console.error('[Memory] 图片加载失败:', e)} />
            <View className={styles.playBtn} onClick={handlePlay}>
              <Text className={styles.playIcon}>▶</Text>
            </View>
            <Text className={styles.durationBadge}>⏱️ 12:30</Text>
          </View>
          <View className={styles.previewInfo}>
            <Text className={styles.previewTitle}>{year}年家庭美好回忆</Text>
            <Text className={styles.previewDesc}>
              这一年，我们一起度过了许多温馨时光。从春节的全家团聚，到孙子的生日派对，每一个画面都是珍贵的回忆...
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.highlights}>
        <Text className={styles.sectionTitle}>🌟 精彩瞬间</Text>
        <View className={styles.highlightList}>
          {highlights.map((item) => (
            <View key={item.id} className={styles.highlightItem}>
              <Image className={styles.highlightCover} src={item.cover} mode="aspectFill" />
              <View className={styles.highlightInfo}>
                <Text className={styles.highlightTitle}>{item.title}</Text>
                <Text className={styles.highlightDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.btn, styles.btnSecondary)} onClick={handleRegenerate}>
          🔄 重新生成
        </Button>
        <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={handleShare}>
          🚀 分享给亲友
        </Button>
      </View>
    </View>
  );
};

export default MemoryPage;
