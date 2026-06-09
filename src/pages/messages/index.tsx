import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { AppNotification, NotificationType } from '@/types/video';

const typeConfig: Record<NotificationType, { icon: string; label: string; color: string }> = {
  like: { icon: '❤️', label: '点赞了你的视频', color: 'like' },
  comment: { icon: '🎤', label: '给你发来语音评论', color: 'comment' },
  reply: { icon: '💬', label: '回复了你的评论', color: 'reply' }
};

const MessagesPage: React.FC = () => {
  const notifications = useAppStore((s) => s.notifications);
  const getNotificationsForMe = useAppStore((s) => s.getNotificationsForMe);
  const getEffectiveUser = useAppStore((s) => s.getEffectiveUser);
  const viewAsUserId = useAppStore((s) => s.viewAsUserId);
  const currentUser = useAppStore((s) => s.currentUser);
  const setViewAsUser = useAppStore((s) => s.setViewAsUser);
  const familyMembers = useAppStore((s) => s.familyMembers);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  const [activeType, setActiveType] = useState<NotificationType | 'all'>('all');

  const effectiveUser = useMemo(() => getEffectiveUser(), [getEffectiveUser, viewAsUserId]);
  const isViewingAs = viewAsUserId !== null;

  const myNotifications = useMemo(() => {
    return getNotificationsForMe();
  }, [notifications, getNotificationsForMe]);

  const unreadCount = useMemo(
    () => myNotifications.filter((n) => !n.isRead).length,
    [myNotifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeType === 'all') return myNotifications;
    return myNotifications.filter((n) => n.type === activeType);
  }, [myNotifications, activeType]);

  const handleOpenNotification = (notif: AppNotification) => {
    if (!notif.isRead) {
      markNotificationRead(notif.id);
    }
    Taro.navigateTo({ url: `/pages/detail/index?id=${notif.videoId}` });
  };

  const allViewUsers = useMemo(
    () => [
      { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, label: '我自己' },
      ...familyMembers.map((m) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        label: m.relation
      }))
    ],
    [currentUser, familyMembers]
  );

  const handleSwitchView = (userId: string) => {
    if (userId === currentUser.id) {
      setViewAsUser(null);
    } else {
      setViewAsUser(userId);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    Taro.showToast({ title: '全部标为已读', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View>
          <Text className={styles.title}>🔔 家庭消息</Text>
          <Text className={styles.subtitle}>
            {isViewingAs
              ? `预览「${effectiveUser.name}」的消息箱 · 共 ${myNotifications.length} 条`
              : `共 ${myNotifications.length} 条消息${unreadCount > 0 ? `，${unreadCount} 条未读` : ''}`}
          </Text>
        </View>
        {unreadCount > 0 && (
          <Button className={styles.markAllReadBtn} onClick={handleMarkAllRead}>
            ✓ 全部已读
          </Button>
        )}
      </View>

      <View className={styles.viewSwitcher}>
        <Text className={styles.viewSwitcherLabel}>
          {isViewingAs ? '👓 家人视角预览' : '👤 查看身份'}
        </Text>
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
                  {isActive && <View className={styles.viewUserCheck}>✓</View>}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View className={styles.typeFilter}>
        {(['all', 'like', 'comment', 'reply'] as const).map((t) => {
          const cfg = t === 'all' ? { icon: '📋', label: '全部' } : typeConfig[t];
          const count =
            t === 'all'
              ? myNotifications.length
              : myNotifications.filter((n) => n.type === t).length;
          const isActive = activeType === t;
          return (
            <View
              key={t}
              className={classnames(styles.typeBtn, isActive && styles.typeBtnActive)}
              onClick={() => setActiveType(t)}
            >
              <Text className={styles.typeIcon}>{cfg.icon}</Text>
              <Text className={styles.typeLabel}>{cfg.label}</Text>
              <Text className={styles.typeCount}>{count}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView className={styles.list} scrollY enhanced>
        {filteredNotifications.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyTitle}>暂时没有消息</Text>
            <Text className={styles.emptyDesc}>
              {isViewingAs
                ? `${effectiveUser.name}还没有收到任何互动`
                : '家人点赞或评论你的视频后会在这里显示'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notif) => {
            const cfg = typeConfig[notif.type];
            return (
              <View
                key={notif.id}
                className={classnames(styles.notifItem, !notif.isRead && styles.notifItemUnread)}
                onClick={() => handleOpenNotification(notif)}
              >
                <View className={styles.notifAvatarWrap}>
                  <Image className={styles.notifAvatar} src={notif.fromUser.avatar} mode="aspectFill" />
                  <View className={classnames(styles.notifTypeIcon, styles[`notifType${cfg.color}`])}>
                    <Text>{cfg.icon}</Text>
                  </View>
                  {!notif.isRead && <View className={styles.notifUnreadDot} />}
                </View>
                <View className={styles.notifContent}>
                  <View className={styles.notifHeader}>
                    <Text className={styles.notifUserName}>{notif.fromUser.name}</Text>
                    <Text className={styles.notifTime}>{notif.createTime}</Text>
                  </View>
                  <Text className={styles.notifAction}>
                    {cfg.label}
                    {notif.comment && (
                      <Text className={styles.notifVoicePreview}>
                        {' '}🎵 {notif.comment.duration}"语音
                      </Text>
                    )}
                  </Text>
                  <View className={styles.notifVideoPreview}>
                    <Image className={styles.notifVideoCover} src={notif.videoCoverUrl} mode="aspectFill" />
                    <Text className={styles.notifVideoTitle}>{notif.videoTitle}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default MessagesPage;
