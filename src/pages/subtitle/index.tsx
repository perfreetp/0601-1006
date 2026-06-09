import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input, Image, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockFilters, mockFamilyTags } from '@/data/videos';
import { useAppStore } from '@/store';
import type { VideoItem } from '@/types/video';

type FontSize = 'large' | 'xlarge' | 'xxlarge';
type Visibility = 'public' | 'family' | 'private';

const SubtitlePage: React.FC = () => {
  const editingVideo = useAppStore((s) => s.currentEditingVideo);
  const familyMembers = useAppStore((s) => s.familyMembers);
  const updateEditingVideo = useAppStore((s) => s.updateEditingVideo);
  const publishCurrentVideo = useAppStore((s) => s.publishCurrentVideo);

  const [subtitleText, setSubtitleText] = useState(editingVideo?.subtitles?.[0]?.text || '');
  const [fontSize, setFontSize] = useState<FontSize>((editingVideo?.subtitles?.[0]?.fontSize as FontSize) || 'xxlarge');
  const [selectedFilter, setSelectedFilter] = useState<string>(
    mockFilters.find((f) => f.name === editingVideo?.filters)?.id || 'f1'
  );
  const [videoDate, setVideoDate] = useState(editingVideo?.date || '');
  const [videoLocation, setVideoLocation] = useState(editingVideo?.location || '');
  const [oldPhotoCompare, setOldPhotoCompare] = useState(editingVideo?.oldPhotoCompare || false);
  const [hasNarration, setHasNarration] = useState(editingVideo?.narration || false);
  const [selectedTags, setSelectedTags] = useState<string[]>(editingVideo?.familyTags || []);
  const [visibility, setVisibility] = useState<Visibility>(editingVideo?.visibility || 'family');
  const [visibleMemberIds, setVisibleMemberIds] = useState<string[]>(
    editingVideo?.visibleToMemberIds || familyMembers.slice(0, 3).map((m) => m.id)
  );

  const currentVideo: VideoItem = useMemo(
    () =>
      editingVideo || {
        id: 'placeholder',
        title: '视频预览',
        coverUrl: 'https://picsum.photos/id/64/750/500',
        videoUrl: '',
        author: { id: '', name: '', avatar: '' },
        createTime: '',
        duration: 0,
        likes: 0,
        comments: [],
        isLiked: false,
        isCollected: false,
        familyTags: [],
        visibility: 'family'
      },
    [editingVideo]
  );

  const fontSizeLabels: Record<FontSize, string> = {
    large: '大字体',
    xlarge: '加大',
    xxlarge: '超大'
  };

  const visibilityLabels: Record<Visibility, { label: string; icon: string; desc: string }> = {
    public: { label: '公开', icon: '🌍', desc: '所有人可见' },
    family: { label: '仅亲友', icon: '👨‍👩‍👧', desc: '仅选中的亲友可见' },
    private: { label: '仅自己', icon: '🔒', desc: '只有自己能看' }
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleMember = (memberId: string) => {
    setVisibleMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSelectAllMembers = () => {
    if (visibleMemberIds.length === familyMembers.length) {
      setVisibleMemberIds([]);
    } else {
      setVisibleMemberIds(familyMembers.map((m) => m.id));
    }
  };

  const handleAddOldPhoto = () => {
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

  const collectFormData = () => {
    const filterName = mockFilters.find((f) => f.id === selectedFilter)?.name || '原图';
    return {
      title: subtitleText || currentVideo.title || '家庭美好时光',
      subtitles: subtitleText
        ? [{ id: 's1', text: subtitleText, startTime: 0, endTime: currentVideo.duration || 10, fontSize }]
        : [],
      filters: filterName,
      date: videoDate,
      location: videoLocation,
      oldPhotoCompare,
      narration: hasNarration,
      familyTags: selectedTags,
      visibility,
      visibleToMemberIds: visibility === 'family' ? visibleMemberIds : visibility === 'public' ? [] : []
    };
  };

  const handleSave = () => {
    if (!editingVideo) {
      Taro.showToast({ title: '请先拍摄视频', icon: 'none' });
      return;
    }
    updateEditingVideo(collectFormData());
    Taro.showToast({ title: '已保存到草稿箱', icon: 'success' });
  };

  const handlePublish = () => {
    if (!editingVideo) {
      Taro.showToast({ title: '请先拍摄视频', icon: 'none' });
      return;
    }
    if (visibility === 'family' && visibleMemberIds.length === 0) {
      Taro.showToast({ title: '请至少选择一位亲友', icon: 'none' });
      return;
    }
    const memberNames = familyMembers
      .filter((m) => visibleMemberIds.includes(m.id))
      .map((m) => m.name)
      .join('、');
    const rangeText =
      visibility === 'public'
        ? '所有人'
        : visibility === 'private'
        ? '仅自己'
        : `${visibleMemberIds.length}位亲友（${memberNames}）`;

    Taro.showModal({
      title: '发布视频',
      content: `确定要发布给 ${rangeText} 查看吗？`,
      confirmText: '发布',
      confirmColor: '#E67E22',
      success: (res) => {
        if (res.confirm) {
          updateEditingVideo(collectFormData());
          Taro.showLoading({ title: '发布中...' });
          setTimeout(() => {
            const published = publishCurrentVideo();
            Taro.hideLoading();
            if (published) {
              Taro.showToast({ title: '发布成功！', icon: 'success' });
              setTimeout(() => {
                Taro.switchTab({ url: '/pages/home/index' });
              }, 1500);
            } else {
              Taro.showToast({ title: '发布失败，请重试', icon: 'none' });
            }
          }, 1200);
        }
      }
    });
  };

  const subtitleDisplaySize = fontSize === 'large' ? '36rpx' : fontSize === 'xlarge' ? '44rpx' : '56rpx';

  return (
    <View className={styles.page}>
      <View className={styles.previewSection}>
        <View className={styles.videoPreview}>
          <Image
            className={styles.previewImg}
            src={currentVideo.coverUrl}
            mode="aspectFill"
            onError={(e) => console.error('[Subtitle] 预览图加载失败:', e)}
          />

          {videoDate && <Text className={styles.overlayDate}>📅 {videoDate}</Text>}
          {videoLocation && <Text className={styles.overlayLocation}>📍 {videoLocation}</Text>}
          {hasNarration && <Text className={styles.narrationBadge}>🎤 有旁白</Text>}
          {oldPhotoCompare && <Text className={styles.compareBadge}>📷 今昔对比</Text>}

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
        {!editingVideo && (
          <View className={styles.noDraftTip}>
            <Text className={styles.noDraftIcon}>📹</Text>
            <Text className={styles.noDraftText}>请先去拍摄或从相册导入视频</Text>
            <Button
              className={styles.goCaptureBtn}
              onClick={() => Taro.switchTab({ url: '/pages/capture/index' })}
            >
              去拍摄
            </Button>
          </View>
        )}
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
            disabled={!editingVideo}
          />
          <View className={styles.fontSizeRow}>
            {(['large', 'xlarge', 'xxlarge'] as FontSize[]).map((size) => (
              <Button
                key={size}
                className={classnames(styles.fontSizeBtn, fontSize === size && styles.fontSizeBtnActive)}
                onClick={() => setFontSize(size)}
                disabled={!editingVideo}
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
                  onClick={() => editingVideo && setSelectedFilter(filter.id)}
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
              disabled={!editingVideo}
            />
            <Input
              className={styles.infoInput}
              value={videoLocation}
              onInput={(e) => setVideoLocation(e.detail.value)}
              placeholder="点击选择或输入地点"
              onFocus={handleGetLocation}
              disabled={!editingVideo}
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
              disabled={!editingVideo}
            >
              <Text className={styles.featureIcon}>📷</Text>
              <Text className={classnames(styles.featureText, oldPhotoCompare && styles.featureTextActive)}>
                老照片对比
              </Text>
            </Button>
            <Button
              className={classnames(styles.featureBtn, hasNarration && styles.featureBtnActive)}
              onClick={handleRecordNarration}
              disabled={!editingVideo}
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
                  onClick={() => editingVideo && handleToggleTag(tag)}
                >
                  <Text className={styles.tagText}>
                    {selectedTags.includes(tag) ? '✓ ' : ''}
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>👁️</Text>
            <Text className={styles.sectionTitle}>可见范围</Text>
          </View>
          <View className={styles.visibilityRow}>
            {(['public', 'family', 'private'] as Visibility[]).map((v) => (
              <Button
                key={v}
                className={classnames(
                  styles.visibilityBtn,
                  visibility === v && styles.visibilityBtnActive
                )}
                onClick={() => editingVideo && setVisibility(v)}
                disabled={!editingVideo}
              >
                <Text className={styles.visibilityIcon}>{visibilityLabels[v].icon}</Text>
                <Text className={styles.visibilityLabel}>{visibilityLabels[v].label}</Text>
                <Text className={styles.visibilityDesc}>{visibilityLabels[v].desc}</Text>
              </Button>
            ))}
          </View>

          {visibility === 'family' && (
            <View className={styles.memberSection}>
              <View className={styles.memberSectionHeader}>
                <Text className={styles.memberSectionTitle}>选择可见的亲友</Text>
                <Button className={styles.selectAllBtn} onClick={handleSelectAllMembers}>
                  {visibleMemberIds.length === familyMembers.length ? '取消全选' : '全选'}
                </Button>
              </View>
              <Text className={styles.selectedCount}>
                已选 {visibleMemberIds.length}/{familyMembers.length} 位
              </Text>
              <View className={styles.memberList}>
                {familyMembers.map((member) => (
                  <View
                    key={member.id}
                    className={classnames(
                      styles.memberItem,
                      visibleMemberIds.includes(member.id) && styles.memberItemSelected
                    )}
                    onClick={() => editingVideo && handleToggleMember(member.id)}
                  >
                    <Image className={styles.memberAvatar} src={member.avatar} mode="aspectFill" />
                    <View className={styles.memberInfo}>
                      <Text className={styles.memberName}>{member.name}</Text>
                      <Text className={styles.memberRelation}>{member.relation}</Text>
                    </View>
                    <View
                      className={classnames(
                        styles.memberCheck,
                        visibleMemberIds.includes(member.id) && styles.memberCheckSelected
                      )}
                    >
                      {visibleMemberIds.includes(member.id) && <Text className={styles.checkIcon}>✓</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.saveBtn} onClick={handleSave} disabled={!editingVideo}>
          💾 保存草稿
        </Button>
        <Button className={styles.publishBtn} onClick={handlePublish} disabled={!editingVideo}>
          🚀 {visibility === 'public' ? '发布公开' : visibility === 'private' ? '保存仅自己看' : '发布给亲友'}
        </Button>
      </View>
    </View>
  );
};

export default SubtitlePage;
