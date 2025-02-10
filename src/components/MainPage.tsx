import React, { useState } from 'react'
import { Card, InputNumber, Alert, Button, Space, message } from 'antd'
import styled from 'styled-components'
import { useChapters } from '../hooks/useChapters'
import { ChapterForm } from './ChapterForm'
import { ChapterList } from './ChapterList'
import { ProgressBarPreview } from './ProgressBarPreview'
import { Chapter } from '../types'
import { MIN_DURATION, MAX_DURATION } from '../utils/constants'

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
      updateChapter(editingChapter.id, chapter)
      setEditingChapter(null)
    } else {
      addChapter(chapter)
    }
  }

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter)
  }

  const handleDeleteChapter = (id: string) => {
    removeChapter(id)
  }

  const handleGenerateVideo = () => {
    // TODO: 实现视频生成功能
    message.info('视频生成功能即将推出')
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
        />
        <ChapterList
          chapters={chapters}
          onEdit={handleEditChapter}
          onDelete={handleDeleteChapter}
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
            chapters={chapters}
            totalDuration={totalDuration}
            currentTime={currentTime}
          />
          <Button type="primary" onClick={handleGenerateVideo} disabled={chapters.length === 0}>
            生成视频
          </Button>
        </Space>
      </StyledCard>
    </Container>
  )
} 