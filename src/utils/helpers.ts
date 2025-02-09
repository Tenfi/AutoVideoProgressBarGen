import { Chapter } from '../types'

export const formatTime = (minutes: number): string => {
  const totalSeconds = Math.floor(minutes * 60)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const validateChapters = (chapters: Chapter[], totalDuration: number): string[] => {
  const errors: string[] = []

  // 检查时间是否在总时长范围内
  chapters.forEach(chapter => {
    if (chapter.startTime > totalDuration || chapter.endTime > totalDuration) {
      errors.push(`章节"${chapter.title}"的时间超出了总时长`)
    }
  })

  // 检查时间段是否有重叠
  for (let i = 0; i < chapters.length; i++) {
    for (let j = i + 1; j < chapters.length; j++) {
      if (
        (chapters[i].startTime <= chapters[j].startTime && chapters[i].endTime > chapters[j].startTime) ||
        (chapters[j].startTime <= chapters[i].startTime && chapters[j].endTime > chapters[i].startTime)
      ) {
        errors.push(`章节"${chapters[i].title}"和"${chapters[j].title}"的时间有重叠`)
      }
    }
  }

  // 检查开始时间是否小于结束时间
  chapters.forEach(chapter => {
    if (chapter.startTime >= chapter.endTime) {
      errors.push(`章节"${chapter.title}"的开始时间必须小于结束时间`)
    }
  })

  return errors
}

export const generateFileName = (): string => {
  const now = new Date()
  const timestamp = now.toISOString()
    .replace(/[-:]/g, '')
    .replace(/[T.]/g, '_')
    .slice(0, 15)
  return `progressbar_${timestamp}.mp4`
} 