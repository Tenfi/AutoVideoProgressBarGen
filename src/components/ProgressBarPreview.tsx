import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ChapterInfo } from '../types/chapter'

interface ProgressBarPreviewProps {
  chapters: ChapterInfo[]
  totalDuration: number
  currentTime: number
}

const PreviewContainer = styled.div`
  width: 100%;
  overflow: hidden;
  background: #000;
  border-radius: 4px;
  margin: 20px 0;
  height: 40px;
`

const Canvas = styled.canvas`
  width: 100%;
  height: 40px;
`

export const ProgressBarPreview: React.FC<ProgressBarPreviewProps> = ({
  chapters,
  totalDuration,
  currentTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const drawProgressBar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布尺寸
    canvas.width = 1920
    canvas.height = 40

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const progressBarHeight = 40
    const progressBarTopMargin = 0
    const progress = currentTime / totalDuration

    // 绘制背景进度条
    ctx.fillStyle = 'rgba(51, 51, 51, 0.8)'
    ctx.fillRect(0, progressBarTopMargin, canvas.width, progressBarHeight)

    // 绘制进度
    ctx.fillStyle = '#4A90E2'
    ctx.fillRect(0, progressBarTopMargin, Math.round(canvas.width * progress), progressBarHeight)

    // 绘制章节分隔线
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.beginPath()
    chapters.forEach(chapter => {
      const x = Math.round((chapter.startTime / totalDuration) * canvas.width)
      ctx.moveTo(x, progressBarTopMargin)
      ctx.lineTo(x, progressBarTopMargin + progressBarHeight)
    })
    ctx.stroke()

    // 绘制文本
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '24px Microsoft YaHei'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // 绘制当前时间（右对齐）
    ctx.textAlign = 'right'
    const timeText = formatTime(currentTime)
    ctx.fillText(timeText, canvas.width - 20, progressBarTopMargin + progressBarHeight / 2 + 8)

    // 绘制所有章节标题（在章节分段中居中显示）
    ctx.textAlign = 'center'
    chapters.forEach((chapter, index) => {
      const startX = Math.round((chapter.startTime / totalDuration) * canvas.width)
      const endX = index < chapters.length - 1
        ? Math.round((chapters[index + 1].startTime / totalDuration) * canvas.width)
        : canvas.width
      
      // 计算标题位置（在章节中间）
      const centerX = startX + (endX - startX) / 2
      
      // 在进度条内部居中显示标题
      ctx.fillText(chapter.title, centerX, progressBarTopMargin + progressBarHeight / 2 + 8)
    })
  }

  useEffect(() => {
    drawProgressBar()
  }, [chapters, totalDuration, currentTime])

  return (
    <PreviewContainer>
      <Canvas ref={canvasRef} />
    </PreviewContainer>
  )
} 