import { FFmpeg } from '@ffmpeg/ffmpeg'
import { Chapter, ProgressBarStyle, VideoMetadata } from '../types'
import { DEFAULT_VIDEO_METADATA } from './constants'

interface ExtendedFFmpeg extends FFmpeg {
  fs: {
    writeFile: (filename: string, data: Uint8Array) => Promise<void>
    readFile: (filename: string) => Promise<Uint8Array>
  }
}

let ffmpeg: ExtendedFFmpeg | null = null
let isLoading = false

// 初始化 FFmpeg
const initFFmpeg = async (): Promise<ExtendedFFmpeg> => {
  if (ffmpeg) return ffmpeg
  if (isLoading) {
    throw new Error('FFmpeg 正在加载中，请稍后重试')
  }

  try {
    isLoading = true
    console.log('开始初始化 FFmpeg...')
    
    // 创建 FFmpeg 实例
    ffmpeg = new FFmpeg() as ExtendedFFmpeg
    
    try {
      // 加载 FFmpeg
      await ffmpeg.load()
      console.log('FFmpeg 初始化成功')
      return ffmpeg
    } catch (error) {
      console.error('FFmpeg 加载失败:', error)
      throw new Error('FFmpeg 文件加载失败，请检查文件是否存在')
    }
  } catch (error) {
    console.error('FFmpeg 初始化错误:', error)
    throw new Error(
      `FFmpeg 初始化失败: ${(error as Error).message || '未知错误'}`
    )
  } finally {
    isLoading = false
  }
}

// 生成视频主函数
export const generateVideo = async ({
  chapters,
  totalDuration,
  style,
  onProgress
}: {
  chapters: Chapter[]
  totalDuration: number
  style: ProgressBarStyle
  onProgress?: (progress: number) => void
}): Promise<Blob> => {
  const ffmpeg = await initFFmpeg()
  const metadata: VideoMetadata = DEFAULT_VIDEO_METADATA
  const frameCount = Math.ceil(totalDuration * 60 * metadata.fps)
  
  try {
    // 创建空白画布
    const canvas = document.createElement('canvas')
    canvas.width = metadata.width
    canvas.height = metadata.height
    const ctx = canvas.getContext('2d')!

    // 生成帧图片
    for (let i = 0; i < frameCount; i++) {
      const currentTime = i / metadata.fps
      renderFrame(ctx, currentTime, totalDuration, chapters, style)
      
      const frameData = canvas.toDataURL('image/png').split(',')[1]
      await ffmpeg.fs.writeFile(`frame-${i.toString().padStart(6, '0')}.png`, 
        Uint8Array.from(atob(frameData), c => c.charCodeAt(0)))
      
      onProgress?.(Math.round((i / frameCount) * 100))
    }

    // 生成视频
    await ffmpeg.exec([
      '-framerate', metadata.fps.toString(),
      '-i', 'frame-%06d.png',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-y',
      'output.mp4'
    ])

    // 获取生成的视频文件
    const data = await ffmpeg.fs.readFile('output.mp4')
    return new Blob([data], { type: 'video/mp4' })
  } finally {
    // 清理临时文件
    for (let i = 0; i < frameCount; i++) {
      await ffmpeg.fs.writeFile(`frame-${i.toString().padStart(6, '0')}.png`, new Uint8Array())
    }
    await ffmpeg.fs.writeFile('output.mp4', new Uint8Array())
  }
}

// 帧渲染函数（实现进度条绘制逻辑）
const renderFrame = (
  ctx: CanvasRenderingContext2D,
  currentTime: number,
  totalDuration: number,
  chapters: Chapter[],
  style: ProgressBarStyle
) => {
  // 清空画布
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // 绘制背景
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // 绘制进度条背景
  ctx.fillStyle = `rgba(51, 51, 51, 0.8)`
  ctx.fillRect(0, 20, ctx.canvas.width, 40)

  // 计算进度条进度
  const progressWidth = (currentTime / totalDuration) * ctx.canvas.width
  ctx.fillStyle = '#4A90E2'
  ctx.fillRect(0, 20, progressWidth, 40)

  // 绘制章节标记
  chapters.forEach(chapter => {
    const chapterPosition = (chapter.startTime / totalDuration) * ctx.canvas.width
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(chapterPosition, 20)
    ctx.lineTo(chapterPosition, 60)
    ctx.stroke()
  })

  // 绘制时间文字
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '24px Microsoft YaHei'
  ctx.textBaseline = 'top'
  ctx.fillText(
    formatTime(currentTime),
    20,
    70
  )
}

// 时间格式化工具
const formatTime = (minutes: number): string => {
  const totalSeconds = Math.floor(minutes * 60)
  const hours = Math.floor(totalSeconds / 3600)
  const remainingSeconds = totalSeconds % 3600
  const mins = Math.floor(remainingSeconds / 60)
  const secs = remainingSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}