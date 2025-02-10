import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Chapter, ProgressBarStyle } from '../types'
import { formatTime } from '../utils/helpers'
import { DEFAULT_PROGRESS_BAR_STYLE } from '../utils/constants'

interface ProgressBarPreviewProps {
  chapters: Chapter[]
  totalDuration: number
  currentTime?: number
  style?: Partial<ProgressBarStyle>
}

const PreviewContainer = styled.div`
  width: 100%;
  overflow: hidden;
  background: #f0f0f0;
  border-radius: 4px;
  margin: 20px 0;
`

const Canvas = styled.canvas`
  width: 100%;
  height: 60px;
`

export const ProgressBarPreview: React.FC<ProgressBarPreviewProps> = ({
  chapters,
  totalDuration,
  currentTime = 0,
  style = DEFAULT_PROGRESS_BAR_STYLE
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawProgressBar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布尺寸
    canvas.width = 1920
    canvas.height = 60

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制背景
    ctx.fillStyle = `rgba(51, 51, 51, ${style.backgroundOpacity})`
    ctx.fillRect(0, style.topMargin, canvas.width, style.height)

    // 绘制进度
    const progress = (currentTime / totalDuration) * canvas.width
    if (progress > 0) {
      ctx.fillStyle = style.activeColor
      ctx.fillRect(0, style.topMargin, progress, style.height)
    }

    // 绘制章节分隔线和标题
    ctx.fillStyle = style.textColor
    ctx.font = `${style.fontSize}px ${style.fontFamily}`
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    chapters.forEach(chapter => {
      const startX = (chapter.startTime / totalDuration) * canvas.width
      const endX = (chapter.endTime / totalDuration) * canvas.width

      // 绘制分隔线
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(startX - 1, style.topMargin, 2, style.height)

      // 绘制标题
      const centerX = startX + (endX - startX) / 2
      ctx.fillStyle = style.textColor
      ctx.textAlign = 'center'
      ctx.fillText(chapter.title, centerX, style.topMargin + style.height / 2)
    })

    // 绘制当前时间
    ctx.textAlign = 'right'
    ctx.fillText(formatTime(currentTime), canvas.width - 10, style.topMargin / 2)
  }

  useEffect(() => {
    drawProgressBar()
  }, [chapters, totalDuration, currentTime, style])

  return (
    <PreviewContainer>
      <Canvas ref={canvasRef} />
    </PreviewContainer>
  )
} 