import { useState, useCallback } from 'react'
import { Chapter } from '../types'
import { MAX_CHAPTER_COUNT } from '../utils/constants'
import { validateChapters } from '../utils/helpers'

export const useChapters = (totalDuration: number) => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const addChapter = useCallback((chapter: Omit<Chapter, 'id'>) => {
    if (chapters.length >= MAX_CHAPTER_COUNT) {
      setErrors(['已达到最大章节数限制'])
      return
    }

    const newChapter = {
      ...chapter,
      id: Date.now().toString()
    }

    const newChapters = [...chapters, newChapter]
    const validationErrors = validateChapters(newChapters, totalDuration)

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setChapters(newChapters)
    setErrors([])
  }, [chapters, totalDuration])

  const updateChapter = useCallback((id: string, updates: Partial<Omit<Chapter, 'id'>>) => {
    const newChapters = chapters.map(chapter =>
      chapter.id === id ? { ...chapter, ...updates } : chapter
    )

    const validationErrors = validateChapters(newChapters, totalDuration)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setChapters(newChapters)
    setErrors([])
  }, [chapters, totalDuration])

  const removeChapter = useCallback((id: string) => {
    setChapters(chapters => chapters.filter(chapter => chapter.id !== id))
    setErrors([])
  }, [])

  return {
    chapters,
    errors,
    addChapter,
    updateChapter,
    removeChapter
  }
} 