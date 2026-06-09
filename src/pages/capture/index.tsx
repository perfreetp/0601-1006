import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

type CaptureMode = 'video' | 'photo';

const CapturePage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<CaptureMode>('video');
  const [recordTime, setRecordTime] = useState(0);
  const [voiceControlActive, setVoiceControlActive] = useState(false);
  const [showVoiceTip, setShowVoiceTip] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = () => {
    console.log('[CapturePage] 开始拍摄');
    setIsRecording(true);
    setRecordTime(0);
    timerRef.current = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000) as unknown as number;
    Taro.showToast({ title: '开始拍摄', icon: 'none' });
  };

  const stopRecording = () => {
    console.log('[CapturePage] 停止拍摄，用时:', recordTime, '秒');
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    Taro.showToast({ title: '拍摄完成，自动分段中...', icon: 'none' });
    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/editor/index' });
    }, 1500);
  };

  const handleCaptureClick = () => {
    if (mode === 'video') {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    } else {
      console.log('[CapturePage] 拍照');
      Taro.showToast({ title: '拍照成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/editor/index' });
      }, 1000);
    }
  };

  const handleAlbumImport = () => {
    console.log('[CapturePage] 从相册导入');
    Taro.chooseMedia({
      count: 9,
      mediaType: ['video', 'image'],
      sourceType: ['album'],
      success: (res) => {
        console.log('[CapturePage] 选择文件成功:', res.tempFiles.length, '个');
        Taro.showToast({ title: `已选择 ${res.tempFiles.length} 个文件`, icon: 'none' });
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/editor/index' });
        }, 1000);
      },
      fail: (err) => {
        console.error('[CapturePage] 选择文件失败:', err);
        Taro.showToast({ title: '已取消选择', icon: 'none' });
      }
    });
  };

  const handleSwitchCamera = () => {
    console.log('[CapturePage] 切换摄像头');
    Taro.showToast({ title: '已切换摄像头', icon: 'none' });
  };

  const handleModeChange = (newMode: CaptureMode) => {
    console.log('[CapturePage] 切换模式:', newMode);
    setMode(newMode);
  };

  const toggleVoiceControl = () => {
    console.log('[CapturePage] 语音控制:', !voiceControlActive);
    setVoiceControlActive(!voiceControlActive);
    if (!voiceControlActive) {
      setShowVoiceTip(true);
      Taro.showToast({ title: '说"开始拍摄"即可开始', icon: 'none' });
      setTimeout(() => setShowVoiceTip(false), 3000);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className={styles.page}>
      <View className={styles.previewArea}>
        <View className={styles.previewPlaceholder}>
          <Text className={styles.previewIcon}>📷</Text>
          <Text className={styles.previewText}>
            {isRecording ? '拍摄中...' : mode === 'video' ? '点击下方按钮开始拍摄' : '点击下方按钮拍照'}
          </Text>
          <Text className={styles.previewHint}>
            {voiceControlActive ? '🎤 语音控制已开启' : '也可以使用语音控制拍摄'}
          </Text>
        </View>

        {isRecording && (
          <View className={styles.timerBar}>
            <Text className={styles.recordingDot}></Text>
            <Text className={styles.timerText}>{formatTime(recordTime)}</Text>
          </View>
        )}

        {showVoiceTip && (
          <View className={styles.voiceTip}>
            <Text className={styles.voiceTipText}>🎤 请说"开始拍摄"</Text>
          </View>
        )}

        <View className={styles.topBar}>
          <Button className={styles.topBtn} onClick={handleSwitchCamera}>
            🔄
          </Button>
          <Button className={styles.topBtn} onClick={() => Taro.showToast({ title: '闪光灯已开启', icon: 'none' })}>
            ⚡
          </Button>
        </View>
      </View>

      <View className={styles.controlArea}>
        <View className={styles.modeTabs}>
          <Button
            className={classnames(styles.modeTab, mode === 'photo' && styles.modeTabActive)}
            onClick={() => handleModeChange('photo')}
          >
            📷 拍照
          </Button>
          <Button
            className={classnames(styles.modeTab, mode === 'video' && styles.modeTabActive)}
            onClick={() => handleModeChange('video')}
          >
            🎥 视频
          </Button>
        </View>

        <View className={styles.captureRow}>
          <Button className={styles.sideBtn} onClick={handleAlbumImport}>
            <Text className={styles.sideBtnIcon}>🖼️</Text>
            <Text className={styles.sideBtnText}>相册</Text>
          </Button>

          <View className={styles.captureBtnWrap}>
            <Button
              className={classnames(styles.captureBtn, isRecording && styles.captureBtnRecording)}
              onClick={handleCaptureClick}
            >
              <View className={styles.captureBtnInner}>
                <Text className={styles.captureBtnIcon}>
                  {isRecording ? '⏹️' : mode === 'video' ? '▶️' : '📸'}
                </Text>
              </View>
            </Button>
          </View>

          <Button className={styles.sideBtn} onClick={() => Taro.showToast({ title: '特效开发中', icon: 'none' })}>
            <Text className={styles.sideBtnIcon}>✨</Text>
            <Text className={styles.sideBtnText}>特效</Text>
          </Button>
        </View>

        <View className={styles.voiceBtnRow}>
          <Button className={styles.voiceBtn} onClick={toggleVoiceControl}>
            <Text className={styles.voiceBtnIcon}>{voiceControlActive ? '🔊' : '🎤'}</Text>
            <Text className={styles.voiceBtnText}>
              {voiceControlActive ? '语音控制已开启 - 点击关闭' : '开启语音控制拍摄'}
            </Text>
          </Button>
        </View>

        <View className={styles.autoSegmentTip}>
          <Text>✨</Text>
          <Text className={styles.autoSegmentText}>视频将自动分段，方便后期编辑</Text>
        </View>
      </View>
    </View>
  );
};

export default CapturePage;
