import React from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const EditorPage: React.FC = () => {
  const segments = [
    { id: '1', name: '片段 1', duration: '0:15', thumb: 'https://picsum.photos/id/64/160/120' },
    { id: '2', name: '片段 2', duration: '0:20', thumb: 'https://picsum.photos/id/1015/160/120' },
    { id: '3', name: '片段 3', duration: '0:10', thumb: 'https://picsum.photos/id/292/160/120' }
  ];

  const handleGoSubtitle = () => {
    console.log('[EditorPage] 进入字幕编辑');
    Taro.switchTab({ url: '/pages/subtitle/index' });
  };

  return (
    <View className={styles.page}>
      <Text className={styles.icon}>✂️</Text>
      <Text className={styles.title}>视频自动分段完成</Text>
      <Text className={styles.desc}>
        已将视频自动分为 {segments.length} 个片段{'\n'}
        您可以删除不需要的片段，或继续添加字幕
      </Text>

      <View className={styles.segmentList}>
        <Text className={styles.segmentTitle}>视频片段</Text>
        {segments.map((seg) => (
          <View key={seg.id} className={styles.segmentItem}>
            <Image className={styles.segmentThumb} src={seg.thumb} mode="aspectFill" />
            <View className={styles.segmentInfo}>
              <Text className={styles.segmentName}>{seg.name}</Text>
              <Text className={styles.segmentDuration}>时长：{seg.duration}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button className={styles.btn} onClick={handleGoSubtitle} style={{ marginTop: 40 }}>
        ✍️ 添加字幕和滤镜
      </Button>
    </View>
  );
};

export default EditorPage;
