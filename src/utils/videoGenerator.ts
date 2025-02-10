import { ChapterInfo } from '../types/chapter';

interface VideoGeneratorOptions {
  totalDuration: number;
  chapters: ChapterInfo[];
  width?: number;
  backgroundColor?: string;
  progressColor?: string;
  textColor?: string;
  fps?: number;
  onProgress?: (progress: number) => void;
}

export async function generateProgressBarVideo({
  totalDuration,
  chapters,
  width = 1920,
  backgroundColor = 'rgba(51, 51, 51, 0.8)',
  progressColor = '#4A90E2',
  textColor = '#FFFFFF',
  fps = 30,
  onProgress,
}: VideoGeneratorOptions): Promise<Blob> {
  // 创建离屏Canvas，固定分辨率为1920x40
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = 40;
  const ctx = canvas.getContext('2d')!;

  // 创建MediaRecorder，使用较低的比特率以适应较小的分辨率
  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 1000000 // 降低比特率以适应较小的分辨率
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  return new Promise((resolve) => {
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    // 每秒记录数据
    mediaRecorder.start(1000);

    let currentFrame = 0;
    const totalFrames = Math.round(totalDuration * fps);
    let lastFrameTime = performance.now();
    let lastProgressUpdate = 0;
    
    function drawFrame() {
      const now = performance.now();
      const elapsed = now - lastFrameTime;
      
      // 控制帧率
      if (elapsed < (1000 / fps)) {
        requestAnimationFrame(drawFrame);
        return;
      }

      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        onProgress?.(100);
        return;
      }

      // 更新进度（每1%更新一次）
      const currentProgress = Math.round((currentFrame / totalFrames) * 100);
      if (currentProgress > lastProgressUpdate) {
        lastProgressUpdate = currentProgress;
        onProgress?.(currentProgress);
      }

      const currentTime = (currentFrame / fps);
      const progress = currentTime / totalDuration;

      // 清空画布
      ctx.clearRect(0, 0, width, 40);

      // 绘制背景进度条
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, 40);

      // 绘制进度
      ctx.fillStyle = progressColor;
      ctx.fillRect(0, 0, Math.round(width * progress), 40);

      // 绘制章节分隔线
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      chapters.forEach(chapter => {
        const x = Math.round((chapter.startTime / totalDuration) * width);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 40);
      });
      ctx.stroke();

      // 绘制文本
      ctx.fillStyle = textColor;
      ctx.font = '24px Microsoft YaHei';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // 绘制当前时间（右对齐）
      ctx.textAlign = 'right';
      const timeText = formatTime(currentTime);
      ctx.fillText(timeText, width - 20, 28);

      // 绘制所有章节标题（在章节分段中居中显示）
      ctx.textAlign = 'center';
      chapters.forEach((chapter, index) => {
        const startX = Math.round((chapter.startTime / totalDuration) * width);
        const endX = index < chapters.length - 1
          ? Math.round((chapters[index + 1].startTime / totalDuration) * width)
          : width;
        
        // 计算标题位置（在章节中间）
        const centerX = startX + (endX - startX) / 2;
        
        // 在进度条内部居中显示标题
        ctx.fillText(chapter.title, centerX, 28);
      });

      currentFrame++;
      lastFrameTime = now;

      // 使用setTimeout代替requestAnimationFrame来控制帧率
      setTimeout(drawFrame, 1000 / fps);
    }

    drawFrame();
  });
}

function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}