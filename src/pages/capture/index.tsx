import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';

type CaptureMode = 'video' | 'photo';
type VoiceState = 'idle' | 'listening' | 'recognized';

type VoiceActionType = 'start' | 'stop' | 'noise';
interface VoiceCommand {
  text: string;
  action: VoiceActionType;
}

const CapturePage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<CaptureMode>('video');
  const [recordTime, setRecordTime] = useState(0);
  const [voiceControlActive, setVoiceControlActive] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [recognizedText, setRecognizedText] = useState('');
  const [lastCommandResult, setLastCommandResult] = useState<{ text: string; success: boolean; msg: string } | null>(null);

  const timerRef = useRef<number | null>(null);
  const voiceSimulateRef = useRef<number | null>(null);
  const createDraftVideo = useAppStore((s) => s.createDraftVideo);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (voiceSimulateRef.current) {
      clearTimeout(voiceSimulateRef.current);
      voiceSimulateRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const startRecording = useCallback(() => {
    if (isRecording) return;
    console.log('[CapturePage] 开始拍摄');
    setIsRecording(true);
    setRecordTime(0);
    timerRef.current = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000) as unknown as number;
    Taro.showToast({ title: '开始拍摄', icon: 'none' });
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    console.log('[CapturePage] 停止拍摄，用时:', recordTime, '秒');
    const finalDuration = Math.max(recordTime, 3);
    setIsRecording(false);
    clearTimers();
    Taro.showLoading({ title: '自动分段中...' });
    setTimeout(() => {
      createDraftVideo(finalDuration, false);
      Taro.hideLoading();
      Taro.navigateTo({ url: '/pages/editor/index' });
    }, 1200);
  }, [isRecording, recordTime, clearTimers, createDraftVideo]);

  const handleCaptureClick = () => {
    if (mode === 'video') {
      if (isRecording) stopRecording();
      else startRecording();
    } else {
      console.log('[CapturePage] 拍照');
      Taro.showLoading({ title: '处理中...' });
      setTimeout(() => {
        createDraftVideo(5, false);
        Taro.hideLoading();
        Taro.navigateTo({ url: '/pages/editor/index' });
      }, 800);
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
        const totalDur = res.tempFiles.reduce((acc, f) => acc + ((f as any).duration || 10), 0);
        Taro.showLoading({ title: '导入并分段中...' });
        setTimeout(() => {
          createDraftVideo(Math.max(totalDur, 10), true);
          Taro.hideLoading();
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
    if (isRecording) {
      Taro.showToast({ title: '请先停止拍摄', icon: 'none' });
      return;
    }
    setMode(newMode);
  };

  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    if (!voiceControlActive) {
      setLastCommandResult({ text: command.text, success: false, msg: '语音控制已关闭，指令未生效' });
      setTimeout(() => setLastCommandResult(null), 2000);
      return;
    }
    setVoiceState('recognized');
    setRecognizedText(command.text);

    if (command.action === 'noise') {
      setLastCommandResult({ text: command.text, success: false, msg: '非拍摄指令，已忽略' });
      setTimeout(() => {
        setVoiceState(voiceControlActive ? 'listening' : 'idle');
        setRecognizedText('');
        setLastCommandResult(null);
      }, 2000);
      return;
    }

    if (command.action === 'start') {
      if (isRecording) {
        setLastCommandResult({ text: command.text, success: false, msg: '已经在拍摄中了，无需重复开始' });
      } else {
        setLastCommandResult({ text: command.text, success: true, msg: '✅ 已开始拍摄' });
        startRecording();
      }
    }
    if (command.action === 'stop') {
      if (!isRecording) {
        setLastCommandResult({ text: command.text, success: false, msg: '当前未在拍摄' });
      } else {
        setLastCommandResult({ text: command.text, success: true, msg: '✅ 已停止拍摄，准备剪辑' });
        stopRecording();
      }
    }

    setTimeout(() => {
      if (command.action === 'start' && isRecording) {
        setVoiceState('listening');
      }
      if (command.action !== 'stop') {
        setVoiceState(voiceControlActive ? 'listening' : 'idle');
      }
      setRecognizedText('');
      setLastCommandResult(null);
    }, 2500);
  }, [voiceControlActive, isRecording, startRecording, stopRecording]);

  const toggleVoiceControl = () => {
    const next = !voiceControlActive;
    console.log('[CapturePage] 语音控制:', next);
    setVoiceControlActive(next);
    if (next) {
      setVoiceState('listening');
      Taro.showToast({ title: '语音已开启，说"开始拍摄"', icon: 'none' });
    } else {
      setVoiceState('idle');
      setRecognizedText('');
      setLastCommandResult({ text: '', success: false, msg: '语音控制已关闭' });
      setTimeout(() => setLastCommandResult(null), 1500);
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
            {voiceControlActive ? '🎤 语音识别中，说"开始拍摄"或"停止拍摄"' : '也可以使用语音控制拍摄'}
          </Text>
        </View>

        {isRecording && (
          <View className={styles.timerBar}>
            <Text className={styles.recordingDot}></Text>
            <Text className={styles.timerText}>{formatTime(recordTime)}</Text>
          </View>
        )}

        {voiceState === 'listening' && (
          <View className={classnames(styles.voiceStatusBar, styles.voiceStatusListening)}>
            <Text className={styles.voiceStatusWave}>〰️</Text>
            <Text className={styles.voiceStatusText}>🎤 正在聆听...</Text>
          </View>
        )}

        {voiceState === 'recognized' && recognizedText && (
          <View className={classnames(styles.voiceStatusBar, styles.voiceStatusRecognized)}>
            <Text className={styles.voiceStatusText}>💬 "{recognizedText}"</Text>
          </View>
        )}

        {lastCommandResult && (
          <View
            className={classnames(
              styles.commandResult,
              lastCommandResult.success ? styles.commandSuccess : styles.commandFail
            )}
          >
            <Text className={styles.commandResultText}>
              {lastCommandResult.success ? '✅ ' : '⚠️ '}
              {lastCommandResult.msg}
            </Text>
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

          <View className={styles.voiceTestPanel}>
            <Text className={styles.voiceTestTitle}>
              {voiceControlActive ? '🎤 测试语音口令（点击说话）' : '🔇 请先开启语音控制'}
            </Text>
            <View className={styles.voiceTestBtns}>
              <Button
                className={classnames(styles.voiceTestBtn, !voiceControlActive && styles.voiceTestBtnDisabled)}
                onClick={() => handleVoiceCommand({ text: '开始拍摄', action: 'start' })}
              >
                🎬 说"开始拍摄"
              </Button>
              <Button
                className={classnames(styles.voiceTestBtn, !voiceControlActive && styles.voiceTestBtnDisabled)}
                onClick={() => handleVoiceCommand({ text: '停止拍摄', action: 'stop' })}
              >
                ⏹️ 说"停止拍摄"
              </Button>
              <Button
                className={classnames(styles.voiceTestBtn, styles.voiceTestBtnNoise, !voiceControlActive && styles.voiceTestBtnDisabled)}
                onClick={() => handleVoiceCommand({ text: '今天天气真好', action: 'noise' })}
              >
                💬 误说
              </Button>
            </View>
          </View>
        </View>

        <View className={styles.voiceBtnRow}>
          <Button
            className={classnames(styles.voiceBtn, voiceControlActive && styles.voiceBtnActive)}
            onClick={toggleVoiceControl}
          >
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
