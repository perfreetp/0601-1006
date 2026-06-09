import React, { useState } from 'react';
import { View, Text, Button, Input, Image, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockFilters, mockFamilyTags, mockVideos } from '@/data/videos';

type FontSize = 'large' | 'xlarge' | 'xxlarge';

const SubtitlePage: React.FC = () => {
  const currentVideo = mockVideos[0];

  const [subtitleText, setSubtitleText] = useState('孙子生日快乐！健康成长～');
  const [fontSize, setFontSize] = useState<FontSize>('xxlarge');
  const [selectedFilter, setSelectedFilter] = useState('f2');
  const [videoDate, setVideoDate] = useState('2025年6月1日');
  const [videoLocation, setVideoLocation] = useState('家里客厅');
  const [oldPhotoCompare, setOldPhotoCompare] = useState(false);
  const [hasNarration, setHasNarration] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(['孙子', '儿子一家']);

  const fontSizeLabels: Record<FontSize, string> = {
    large: '大字体',
    xlarge: '加大',
    xxlarge: '超大'
  };

  const handleToggleTag = (tag: string) => {
    console.log('[SubtitlePage] 切换标签:', tag);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddOldPhoto = () => {
    console.log('[SubtitlePage] 添加老照片对比');
    Taro.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: () => {
        setOldPhotoCompare(true);
        Taro.showToast({ title: '老照片已添加', icon: 'success' });
      },
      fail: () => {
        setOldPhotoCompare(!oldPhotoCompare);
        Taro.showToast({ title: oldPhotoCompare ? '已取消对比' : '已添加对比效果', icon: 'none' });
      }
    });
  };

  const handleRecordNarration = () => {
    console.log('[SubtitlePage] 录制旁白');
    setHasNarration(!hasNarration);
    Taro.showToast({
      title: hasNarration ? '已删除旁白' : '请开始说话录制...',
      icon: 'none'
    });
    if (!hasNarration) {
      setTimeout(() => {
        Taro.showToast({ title: '旁白录制完成', icon: 'success' });
      }, 2000);
    }
  };

  const handleGetLocation = () => {
    console.log('[SubtitlePage] 获取位置');
    Taro.getLocation({
      success: () => {
        Taro.showToast({ title: '已获取当前位置', icon: 'success' });
      },
      fail: () => {
        setVideoLocation('家里客厅');
        Taro.showToast({ title: '位置已更新', icon: 'none' });
      }
    });
  };

  const handleSave = () => {
    console.log('[SubtitlePage] 保存草稿');
    Taro.showToast({ title: '已保存到草稿箱', icon: 'success' });
  };

  const handlePublish = () => {
    console.log('[SubtitlePage] 发布视频');
    Taro.showModal({
      title: '发布视频',
      content: '确定要发布给亲友查看吗？',
      confirmText: '发布',
      confirmColor: '#E67E22',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '发布中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '发布成功！', icon: 'success' });
            setTimeout(() => {
              Taro.switchTab({ url: '/pages/home/index' });
            }, 1500);
          }, 1500);
        }
      }
    });
  };

  const subtitleDisplaySize = fontSize === 'large' ? '36rpx' : fontSize === 'xlarge' ? '44rpx' : '56rpx';

  return (
    <View className={styles.page}>
      <View className={styles.previewSection}>
        <View className={styles.videoPreview}>
          <Image className={styles.previewImg} src={currentVideo.coverUrl} mode="aspectFill" onError={(e) => console.error('[Subtitle] 预览图加载失败:', e)} />

          {videoDate && (
            <Text className={styles.overlayDate}>📅 {videoDate}</Text>
          )}
          {videoLocation && (
            <Text className={styles.overlayLocation}>📍 {videoLocation}</Text>
          )}
          {hasNarration && (
            <Text className={styles.narrationBadge}>🎤 有旁白</Text>
          )}
          {oldPhotoCompare && (
            <Text className={styles.compareBadge}>📷 今昔对比</Text>
          )}

          <View className={styles.playBtn}>
            <Text className={styles.playIcon}>▶</Text>
          </View>

          {subtitleText && (
            <View className={styles.subtitleOverlay}>
              <Text className={styles.subtitleText} style={{ fontSize: subtitleDisplaySize }}>
                {subtitleText}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className={styles.editSection} scrollY enhanced>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>✍️</Text>
            <Text className={styles.sectionTitle}>大字字幕</Text>
          </View>
          <Textarea
            className={styles.subtitleInput}
            value={subtitleText}
            onInput={(e) => setSubtitleText(e.detail.value)}
            placeholder="输入字幕内容，字大会更清楚"
            maxlength={50}
            autoHeight
          />
          <View className={styles.fontSizeRow}>
            {(['large', 'xlarge', 'xxlarge'] as FontSize[]).map((size) => (
              <Button
                key={size}
                className={classnames(styles.fontSizeBtn, fontSize === size && styles.fontSizeBtnActive)}
                onClick={() => setFontSize(size)}
              >
                {fontSizeLabels[size]}
              </Button>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>🎨</Text>
            <Text className={styles.sectionTitle}>怀旧滤镜</Text>
          </View>
          <ScrollView className={styles.filterScroll} scrollX enhanced showScrollbar={false}>
            <View className={styles.filterList}>
              {mockFilters.map((filter) => (
                <View
                  key={filter.id}
                  className={styles.filterItem}
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  <View
                    className={classnames(
                      styles.filterPreview,
                      selectedFilter === filter.id && styles.filterPreviewActive
                    )}
                  >
                    <Image className={styles.filterImg} src={filter.preview} mode="aspectFill" />
                  </View>
                  <Text
                    className={classnames(
                      styles.filterName,
                      selectedFilter === filter.id && styles.filterNameActive
                    )}
                  >
                    {filter.name}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📅</Text>
            <Text className={styles.sectionTitle}>日期和地点</Text>
          </View>
          <View className={styles.inputRow}>
            <Input
              className={styles.infoInput}
              value={videoDate}
              onInput={(e) => setVideoDate(e.detail.value)}
              placeholder="点击选择日期"
            />
            <Input
              className={styles.infoInput}
              value={videoLocation}
              onInput={(e) => setVideoLocation(e.detail.value)}
              placeholder="点击选择或输入地点"
              onFocus={handleGetLocation}
            />
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>✨</Text>
            <Text className={styles.sectionTitle}>特色功能</Text>
          </View>
          <View className={styles.featureRow}>
            <Button
              className={classnames(styles.featureBtn, oldPhotoCompare && styles.featureBtnActive)}
              onClick={handleAddOldPhoto}
            >
              <Text className={styles.featureIcon}>📷</Text>
              <Text className={classnames(styles.featureText, oldPhotoCompare && styles.featureTextActive)}>
                老照片对比
              </Text>
            </Button>
            <Button
              className={classnames(styles.featureBtn, hasNarration && styles.featureBtnActive)}
              onClick={handleRecordNarration}
            >
              <Text className={styles.featureIcon}>🎤</Text>
              <Text className={classnames(styles.featureText, hasNarration && styles.featureTextActive)}>
                录制旁白
              </Text>
            </Button>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>👨‍👩‍👧</Text>
            <Text className={styles.sectionTitle}>家人标签</Text>
          </View>
          <ScrollView className={styles.tagsScroll} scrollX enhanced showScrollbar={false}>
            <View className={styles.tagsList}>
              {mockFamilyTags.map((tag) => (
                <View
                  key={tag}
                  className={classnames(styles.tagItem, selectedTags.includes(tag) && styles.tagItemActive)}
                  onClick={() => handleToggleTag(tag)}
                >
                  <Text className={styles.tagText}>
                    {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.saveBtn} onClick={handleSave}>
          💾 保存草稿
        </Button>
        <Button className={styles.publishBtn} onClick={handlePublish}>
          🚀 发布给亲友
        </Button>
      </View>
    </View>
  );
};

export default SubtitlePage;
