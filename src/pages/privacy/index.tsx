import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

type Visibility = 'private' | 'family' | 'public';

const PrivacyPage: React.FC = () => {
  const [blockStranger, setBlockStranger] = useState(true);
  const [allowComment, setAllowComment] = useState(true);
  const [allowShare, setAllowShare] = useState(false);
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>('family');

  const visibilityOptions: { value: Visibility; label: string }[] = [
    { value: 'private', label: '仅自己' },
    { value: 'family', label: '仅亲友' },
    { value: 'public', label: '所有人' }
  ];

  const showToast = (msg: string) => {
    Taro.showToast({ title: msg, icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.tipCard}>
        <Text className={styles.tipIcon}>💡</Text>
        <View className={styles.tipContent}>
          <Text className={styles.tipTitle}>隐私保护提示</Text>
          <Text className={styles.tipText}>
            您的家庭视频仅对授权的亲友可见。我们重视您的隐私，所有数据均加密存储。
          </Text>
        </View>
      </View>

      <View className={styles.settingCard}>
        <View className={styles.settingItem} onClick={() => setBlockStranger(!blockStranger)}>
          <Text className={styles.settingIcon}>🚫</Text>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>限制陌生人查看</Text>
            <Text className={styles.settingDesc}>开启后，陌生人无法搜索和查看您的视频</Text>
          </View>
          <View className={styles.switchWrap}>
            <View className={classnames(styles.switch, blockStranger && styles.switchActive)}>
              <View className={classnames(styles.switchDot, blockStranger && styles.switchDotActive)} />
            </View>
          </View>
        </View>

        <View className={styles.settingItem} onClick={() => setAllowComment(!allowComment)}>
          <Text className={styles.settingIcon}>💬</Text>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>允许语音评论</Text>
            <Text className={styles.settingDesc}>亲友可以给您的视频发送语音评论</Text>
          </View>
          <View className={styles.switchWrap}>
            <View className={classnames(styles.switch, allowComment && styles.switchActive)}>
              <View className={classnames(styles.switchDot, allowComment && styles.switchDotActive)} />
            </View>
          </View>
        </View>

        <View className={styles.settingItem} onClick={() => setAllowShare(!allowShare)}>
          <Text className={styles.settingIcon}>🔗</Text>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>允许转发分享</Text>
            <Text className={styles.settingDesc}>亲友可以将您的视频分享给其他家人</Text>
          </View>
          <View className={styles.switchWrap}>
            <View className={classnames(styles.switch, allowShare && styles.switchActive)}>
              <View className={classnames(styles.switchDot, allowShare && styles.switchDotActive)} />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.settingCard}>
        <View className={styles.settingItem}>
          <Text className={styles.settingIcon}>👁️</Text>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>默认可见范围</Text>
            <Text className={styles.settingDesc}>新发布视频的默认可见范围</Text>
            <View className={styles.visibilityOptions}>
              {visibilityOptions.map((opt) => (
                <Button
                  key={opt.value}
                  className={classnames(styles.optionBtn, defaultVisibility === opt.value && styles.optionBtnActive)}
                  onClick={() => {
                    setDefaultVisibility(opt.value);
                    showToast(`已设置：${opt.label}`);
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.settingCard}>
        <View className={styles.settingItem} onClick={() => showToast('黑名单管理开发中')}>
          <Text className={styles.settingIcon}>⛔</Text>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>黑名单管理</Text>
            <Text className={styles.settingDesc}>管理被屏蔽的用户</Text>
          </View>
          <Text style={{ fontSize: 40, color: '#86909C' }}>›</Text>
        </View>

        <View className={styles.settingItem} onClick={() => showToast('数据已加密安全存储')}>
          <Text className={styles.settingIcon}>🔐</Text>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>数据安全</Text>
            <Text className={styles.settingDesc}>您的视频均加密存储，保护隐私安全</Text>
          </View>
          <Text style={{ fontSize: 40, color: '#86909C' }}>›</Text>
        </View>
      </View>
    </View>
  );
};

export default PrivacyPage;
