import React, { useState } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockVideos, mockFamilyMembers } from '@/data/videos';

const MinePage: React.FC = () => {
  const [strangerBlocked, setStrangerBlocked] = useState(true);
  const myVideos = mockVideos.filter(v => v.author.id === 'u1');
  const collectedVideos = myVideos.filter(v => v.isCollected);

  const handleSOS = () => {
    console.log('[MinePage] 一键求助家人');
    Taro.showModal({
      title: '求助家人',
      content: '将通知您的家人来协助您编辑视频，确定要发送求助吗？',
      confirmText: '发送求助',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '正在通知家人...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '已通知大儿子', icon: 'success' });
          }, 1500);
        }
      }
    });
  };

  const handlePrivacyClick = () => {
    console.log('[MinePage] 进入隐私设置');
    Taro.navigateTo({ url: '/pages/privacy/index' });
  };

  const handleToggleStranger = () => {
    console.log('[MinePage] 切换陌生人限制:', !strangerBlocked);
    setStrangerBlocked(!strangerBlocked);
    Taro.showToast({
      title: !strangerBlocked ? '已开启：陌生人无法查看' : '已关闭：所有人可见',
      icon: 'none'
    });
  };

  const handleFamilyManage = () => {
    console.log('[MinePage] 亲友管理');
    Taro.navigateTo({ url: '/pages/family/index' });
  };

  const handleEditProfile = () => {
    console.log('[MinePage] 编辑资料');
    Taro.showToast({ title: '编辑资料开发中', icon: 'none' });
  };

  const handleHelp = () => {
    console.log('[MinePage] 使用帮助');
    Taro.showModal({
      title: '使用帮助',
      content: '1. 点击底部"拍摄"按钮录制视频\n2. 添加字幕和滤镜让视频更好看\n3. 发布给亲友分享快乐时光\n\n如有问题，点击"求助家人"按钮',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#E67E22'
    });
  };

  const handleAbout = () => {
    console.log('[MinePage] 关于');
    Taro.showModal({
      title: '家庭记忆',
      content: '版本 1.0.0\n\n专为银发用户设计的家庭视频记录工具，记录每一个美好瞬间。',
      showCancel: false,
      confirmText: '好的',
      confirmColor: '#E67E22'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.profileSection}>
        <View className={styles.profileHeader} onClick={handleEditProfile}>
          <Image className={styles.avatar} src="https://picsum.photos/id/177/200/200" mode="aspectFill" />
          <View className={styles.profileInfo}>
            <Text className={styles.userName}>王奶奶</Text>
            <Text className={styles.userDesc}>记录家庭美好时光 ❤️</Text>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{myVideos.length}</Text>
            <Text className={styles.statLabel}>作品</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{collectedVideos.length}</Text>
            <Text className={styles.statLabel}>收藏</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{mockFamilyMembers.length}</Text>
            <Text className={styles.statLabel}>亲友</Text>
          </View>
        </View>
      </View>

      <View className={styles.sosSection}>
        <View className={styles.sosCard}>
          <Text className={styles.sosIcon}>🆘</Text>
          <View className={styles.sosContent}>
            <Text className={styles.sosTitle}>需要帮助？</Text>
            <Text className={styles.sosDesc}>一键通知家人来协助您</Text>
          </View>
          <Button className={styles.sosBtn} onClick={handleSOS}>
            求助家人
          </Button>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handlePrivacyClick}>
            <Text className={styles.menuIcon}>🔒</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>隐私设置</Text>
              <Text className={styles.menuDesc}>
                管理谁可以看到我的视频
                <Text className={styles.privacyStatus}>
                  <Text className={styles.privacyStatusText}>
                    {strangerBlocked ? '仅亲友可见' : '公开'}
                  </Text>
                </Text>
              </Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={handleToggleStranger}>
            <Text className={styles.menuIcon}>🚫</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>限制陌生人查看</Text>
              <Text className={styles.menuDesc}>开启后，陌生人无法看到您的作品</Text>
            </View>
            <View className={styles.switchWrap}>
              <View
                className={classnames(styles.switch, strangerBlocked && styles.switchActive)}
              >
                <View
                  className={classnames(styles.switchDot, strangerBlocked && styles.switchDotActive)}
                />
              </View>
            </View>
          </View>
        </View>

        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleFamilyManage}>
            <Text className={styles.menuIcon}>👨‍👩‍👧</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>亲友管理</Text>
              <Text className={styles.menuDesc}>管理家人列表和可见范围</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={() => Taro.switchTab({ url: '/pages/library/index' })}>
            <Text className={styles.menuIcon}>⭐</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的收藏</Text>
              <Text className={styles.menuDesc}>查看收藏的重要视频</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/memory/index' })}>
            <Text className={styles.menuIcon}>🎬</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>年度回忆</Text>
              <Text className={styles.menuDesc}>生成专属年度回忆视频</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleHelp}>
            <Text className={styles.menuIcon}>❓</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>使用帮助</Text>
              <Text className={styles.menuDesc}>学习如何使用这个应用</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={handleAbout}>
            <Text className={styles.menuIcon}>ℹ️</Text>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>关于我们</Text>
              <Text className={styles.menuDesc}>版本信息和介绍</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
