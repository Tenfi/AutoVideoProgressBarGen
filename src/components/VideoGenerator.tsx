import React, { useState, useRef } from 'react';
import { Button, message, Modal, Space, Slider } from 'antd';
import { generateProgressBarVideo } from '../utils/videoGenerator';
import { ChapterInfo } from '../types/chapter';
import styled from 'styled-components';

const PreviewContainer = styled.div`
  position: relative;
  width: 100%;
`;

const PreviewCanvas = styled.canvas`
  width: 100%;
  height: auto;
  background: #000;
  cursor: pointer;
`;

const Controls = styled.div`
  margin-top: 16px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SliderContainer = styled.div`
  flex: 1;
`;

interface VideoGeneratorProps {
  totalDuration: number;
  chapters: ChapterInfo[];
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ totalDuration, chapters }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPreviewTime, setCurrentPreviewTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const drawPreview = (currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = 1920;
    canvas.height = 1080;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const progressBarHeight = 40;
    const progressBarTopMargin = 20;
    const progress = currentTime / totalDuration;

    // 绘制背景进度条
    ctx.fillStyle = 'rgba(51, 51, 51, 0.8)';
    ctx.fillRect(0, progressBarTopMargin, canvas.width, progressBarHeight);

    // 绘制进度
    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(0, progressBarTopMargin, Math.round(canvas.width * progress), progressBarHeight);

    // 绘制章节分隔线
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    chapters.forEach(chapter => {
      const x = Math.round((chapter.startTime / totalDuration) * canvas.width);
      ctx.moveTo(x, progressBarTopMargin);
      ctx.lineTo(x, progressBarTopMargin + progressBarHeight);
    });
    ctx.stroke();

    // 绘制文本
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Microsoft YaHei';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // 绘制当前时间（右对齐）
    ctx.textAlign = 'right';
    const timeText = formatTime(currentTime);
    ctx.fillText(timeText, canvas.width - 20, progressBarTopMargin + progressBarHeight - 10);

    // 查找并绘制当前章节标题（左对齐）
    const currentChapter = chapters.length > 0 ? chapters.find(chapter => {
      if (currentTime < chapters[0].startTime) {
        return true;
      }
      return currentTime >= chapter.startTime;
    }) || chapters[0] : null;

    if (currentChapter) {
      ctx.textAlign = 'left';
      ctx.fillText(currentChapter.title, 20, progressBarTopMargin + progressBarHeight - 10);
    }

    // 更新当前时间状态
    setCurrentPreviewTime(currentTime);
  };

  const startPreviewAnimation = (startFromTime = 0) => {
    startTimeRef.current = performance.now() - (startFromTime * 1000);
    const animate = (currentTime: number) => {
      if (isPaused) {
        pausedTimeRef.current = (currentTime - startTimeRef.current) / 1000;
        return;
      }

      const elapsed = (currentTime - startTimeRef.current) / 1000;
      if (elapsed >= totalDuration) {
        startTimeRef.current = currentTime;
        drawPreview(0);
      } else {
        drawPreview(elapsed);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopPreviewAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handlePreview = () => {
    setIsPreviewVisible(true);
    setIsPaused(false);
    setTimeout(() => startPreviewAnimation(0), 100);
  };

  const handlePreviewClose = () => {
    stopPreviewAnimation();
    setIsPreviewVisible(false);
    setCurrentPreviewTime(0);
    setIsPaused(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    const newTime = progress * totalDuration;
    
    startPreviewAnimation(newTime);
  };

  const handlePlayPause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      startTimeRef.current = performance.now() - (pausedTimeRef.current * 1000);
      startPreviewAnimation(pausedTimeRef.current);
    }
  };

  const handleSliderChange = (value: number) => {
    const newTime = (value / 100) * totalDuration;
    startPreviewAnimation(newTime);
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const messageKey = 'videoGeneration';
      message.loading({ content: '正在生成视频...0%', key: messageKey, duration: 0 });

      const blob = await generateProgressBarVideo({
        totalDuration,
        chapters,
        onProgress: (progress) => {
          message.loading({
            content: `正在生成视频...${progress}%`,
            key: messageKey,
            duration: 0
          });
        }
      });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `progressbar_${timestamp}.webm`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.success({ content: '视频生成成功！', key: messageKey });
    } catch (error) {
      message.error('视频生成失败：' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Space>
      <Button 
        onClick={handlePreview}
        size="large"
      >
        预览效果
      </Button>
      <Button 
        type="primary" 
        onClick={handleGenerate}
        loading={isGenerating}
        size="large"
      >
        生成视频
      </Button>
      <Modal
        title="预览效果"
        open={isPreviewVisible}
        onCancel={handlePreviewClose}
        width={1200}
        footer={[
          <Button key="close" onClick={handlePreviewClose}>
            关闭
          </Button>,
          <Button key="generate" type="primary" onClick={() => {
            handlePreviewClose();
            handleGenerate();
          }}>
            生成视频
          </Button>
        ]}
      >
        <PreviewContainer>
          <PreviewCanvas 
            ref={canvasRef} 
            onClick={handleCanvasClick}
          />
          <Controls>
            <Button onClick={handlePlayPause}>
              {isPaused ? '播放' : '暂停'}
            </Button>
            <SliderContainer>
              <Slider
                min={0}
                max={100}
                value={(currentPreviewTime / totalDuration) * 100}
                onChange={handleSliderChange}
                tooltip={{
                  formatter: (value) => formatTime((value! / 100) * totalDuration)
                }}
              />
            </SliderContainer>
            <div style={{ minWidth: 80, textAlign: 'right' }}>
              {formatTime(currentPreviewTime)} / {formatTime(totalDuration)}
            </div>
          </Controls>
        </PreviewContainer>
      </Modal>
    </Space>
  );
};

function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
} 