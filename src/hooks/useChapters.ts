import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Chapter } from '../types/chapter'
import { MAX_CHAPTER_COUNT } from '../utils/constants'

export function useChapters(totalDuration: number) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [errors, setErrors] = useState<string[]>([])

  // 验证章节
  const validateChapters = (chaptersToValidate: Chapter[]) => {
    const newErrors: string[] = []

    // 检查章节时间是否按顺序排列
    for (let i = 0; i < chaptersToValidate.length; i++) {
      const currentChapter = chaptersToValidate[i]
      const previousChapter = i > 0 ? chaptersToValidate[i - 1] : null
      const startTime = previousChapter ? previousChapter.endTime : 0

      if (currentChapter.endTime <= startTime) {
        newErrors.push(`第 ${i + 1} 个章节的结束时间必须大于开始时间`)
      }
    }

    // 检查最后一个章节是否超出总时长
    if (chaptersToValidate.length > 0) {
      const lastChapter = chaptersToValidate[chaptersToValidate.length - 1]
      if (lastChapter.endTime > totalDuration) {
        newErrors.push('章节结束时间不能超过视频总时长')
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // 添加章节
  const addChapter = (chapter: Omit<Chapter, 'id'>) => {
    if (chapters.length >= MAX_CHAPTER_COUNT) {
      setErrors(['已达到最大章节数限制'])
      return false
    }

    const newChapter: Chapter = {
      ...chapter,
      id: uuidv4(),
    }

    const newChapters = [...chapters, newChapter]
    if (validateChapters(newChapters)) {
      setChapters(newChapters)
      setErrors([])
      return true
    }
    return false
  }

  // 更新章节
  const updateChapter = (id: string, updatedChapter: Omit<Chapter, 'id'>) => {
    const newChapters = chapters.map(chapter =>
      chapter.id === id ? { ...updatedChapter, id } : chapter
    )

    if (validateChapters(newChapters)) {
      setChapters(newChapters)
      setErrors([])
      return true
    }
    return false
  }

  // 删除章节
  const removeChapter = (id: string) => {
    const newChapters = chapters.filter(chapter => chapter.id !== id)
    validateChapters(newChapters)
    setChapters(newChapters)
  }

  // 当总时长改变时重新验证
  useEffect(() => {
    validateChapters(chapters)
  }, [totalDuration])

  return {
    chapters,
    errors,
    addChapter,
    updateChapter,
    removeChapter
  }
} 