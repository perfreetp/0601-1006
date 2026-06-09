import React, { useState } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockFamilyMembers } from '@/data/videos';
import { FamilyMember } from '@/types/video';

const FamilyPage: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>(
    mockFamilyMembers.map((m) => ({ ...m, isSelected: true }))
  );

  const toggleMember = (id: string) => {
    console.log('[FamilyPage] 切换成员选择:', id);
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isSelected: !m.isSelected } : m))
    );
  };

  const handleSelectAll = () => {
    console.log('[FamilyPage] 全选');
    setMembers((prev) => prev.map((m) => ({ ...m, isSelected: true })));
  };

  const handleAddMember = () => {
    console.log('[FamilyPage] 添加亲友');
    Taro.showToast({ title: '邀请家人功能开发中', icon: 'none' });
  };

  const handleSave = () => {
    const selected = members.filter((m) => m.isSelected);
    console.log('[FamilyPage] 保存选择，共选中:', selected.length);
    Taro.showToast({ title: `已选择 ${selected.length} 位亲友`, icon: 'success' });
  };

  const children = members.filter((m) => ['儿子', '女儿'].includes(m.relation));
  const grandkids = members.filter((m) => m.relation === '孙辈');
  const others = members.filter((m) => !['儿子', '女儿', '孙辈', '配偶'].includes(m.relation));
  const spouse = members.filter((m) => m.relation === '配偶');

  const renderMemberItem = (member: FamilyMember) => (
    <View key={member.id} className={styles.memberItem} onClick={() => toggleMember(member.id)}>
      <Image className={styles.avatar} src={member.avatar} mode="aspectFill" />
      <View className={styles.memberInfo}>
        <Text className={styles.memberName}>{member.name}</Text>
        <Text className={styles.memberRelation}>{member.relation}</Text>
      </View>
      <View className={styles.checkWrap}>
        <View
          className={classnames(styles.checkBox, member.isSelected && styles.checkBoxActive)}
        >
          {member.isSelected && <Text className={styles.checkIcon}>✓</Text>}
        </View>
      </View>
    </View>
  );

  const renderGroup = (title: string, list: FamilyMember[]) => {
    if (list.length === 0) return null;
    return (
      <View className={styles.groupCard}>
        <View className={styles.groupHeader}>
          <Text className={styles.groupTitle}>{title}</Text>
          <Text className={styles.groupCount}>{list.length} 人</Text>
        </View>
        <View className={styles.groupMembers}>
          {list.map((m) => (
            <View key={m.id} className={styles.groupMember}>
              <Image className={styles.groupAvatar} src={m.avatar} mode="aspectFill" />
              <Text className={styles.groupName}>{m.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.tipBar}>
        <Text className={styles.tipIcon}>💡</Text>
        <Text className={styles.tipText}>
          勾选的亲友可以看到您发布的视频。您的隐私对我们很重要！
        </Text>
      </View>

      <Text className={styles.sectionTitle}>✅ 选择可见亲友</Text>
      <View className={styles.memberList}>
        {members.map((member) => renderMemberItem(member))}
      </View>

      <Text className={styles.sectionTitle}>👨‍👩‍👧 按关系分组</Text>
      <View className={styles.relationGroups}>
        {renderGroup('💑 配偶', spouse)}
        {renderGroup('👨‍👩‍👦 子女', children)}
        {renderGroup('👶 孙辈', grandkids)}
        {renderGroup('👥 其他亲友', others)}
      </View>

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.btn, styles.btnSecondary)} onClick={handleSelectAll}>
          全选
        </Button>
        <Button className={classnames(styles.btn, styles.btnSecondary)} onClick={handleAddMember}>
          ➕ 添加亲友
        </Button>
        <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={handleSave}>
          💾 保存设置
        </Button>
      </View>
    </View>
  );
};

export default FamilyPage;
