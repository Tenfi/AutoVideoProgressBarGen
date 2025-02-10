import React, { useState } from 'react'
import { Card, InputNumber, Alert, Space } from 'antd'
import styled from 'styled-components'
import { useChapters } from '../hooks/useChapters'
import { ChapterForm } from './ChapterForm'
import { ChapterList } from './ChapterList'
import { ProgressBarPreview } from './ProgressBarPreview'
import { Chapter } from '../types/chapter'
import { MIN_DURATION, MAX_DURATION } from '../utils/constants'
import { VideoGenerator } from './VideoGenerator'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`

export const MainPage: React.FC = () => {
  const [totalDuration, setTotalDuration] = useState<number>(5)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)

  const {
    chapters,
    errors,
    addChapter,
    updateChapter,
    removeChapter
  } = useChapters(totalDuration)

  const handleTotalDurationChange = (value: number | null) => {
    if (value) {
      setTotalDuration(value)
      setCurrentTime(Math.min(currentTime, value))
    }
  }

  const handleChapterSubmit = (chapter: Omit<Chapter, 'id'>) => {
    if (editingChapter) {
      if (updateChapter(editingChapter.id, chapter)) {
        setEditingChapter(null)
      }
    } else {
      addChapter(chapter)
    }
  }

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter)
  }

  const handleDeleteChapter = (id: string) => {
    removeChapter(id)
    if (editingChapter?.id === id) {
      setEditingChapter(null)
    }
  }

  const getPreviousEndTime = () => {
    if (!editingChapter) {
      return chapters.length > 0 ? chapters[chapters.length - 1].endTime : 0
    }
    const index = chapters.findIndex(c => c.id === editingChapter.id)
    return index > 0 ? chapters[index - 1].endTime : 0
  }

  const getVideoChapters = () => {
    return chapters.map((chapter, index) => {
      const startTime = index === 0 ? 0 : chapters[index - 1].endTime;
      return {
        title: chapter.title,
        startTime: startTime * 60, // 转换为秒
        endTime: chapter.endTime * 60 // 转换为秒
      };
    });
  }

  return (
    <Container>
      <StyledCard title="基本设置">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label style={{ marginRight: 8 }}>总时长（分钟）：</label>
            <InputNumber
              value={totalDuration}
              onChange={handleTotalDurationChange}
              min={MIN_DURATION}
              max={MAX_DURATION}
              step={0.1}
              precision={1}
            />
          </div>
          {errors.length > 0 && (
            <Alert
              type="error"
              message="验证错误"
              description={errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            />
          )}
        </Space>
      </StyledCard>

      <StyledCard title="章节管理">
        <ChapterForm
          onSubmit={handleChapterSubmit}
          initialValues={editingChapter || undefined}
          totalDuration={totalDuration}
          previousEndTime={getPreviousEndTime()}
        />
        <ChapterList
          chapters={chapters}
          onEdit={handleEditChapter}
          onDelete={handleDeleteChapter}
          totalDuration={totalDuration}
        />
      </StyledCard>

      <StyledCard title="预览">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label style={{ marginRight: 8 }}>当前时间（分钟）：</label>
            <InputNumber
              value={currentTime}
              onChange={(value) => setCurrentTime(value || 0)}
              min={0}
              max={totalDuration}
              step={0.1}
              precision={1}
            />
          </div>
          <ProgressBarPreview
            chapters={getVideoChapters()}
            totalDuration={totalDuration}
            currentTime={currentTime}
          />
          <VideoGenerator
            totalDuration={Math.round(totalDuration * 60)}
            chapters={getVideoChapters()}
          />
        </Space>
      </StyledCard>
    </Container>
  )
} 