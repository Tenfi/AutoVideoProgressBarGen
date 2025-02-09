import React from 'react'
import { List, Button, Space } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Chapter } from '../types'
import { formatTime } from '../utils/helpers'

interface ChapterListProps {
  chapters: Chapter[]
  onEdit: (chapter: Chapter) => void
  onDelete: (id: string) => void
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  onEdit,
  onDelete
}) => {
  return (
    <List
      dataSource={chapters}
      renderItem={(chapter) => (
        <List.Item
          actions={[
            <Button
              key="edit"
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(chapter)}
            >
              编辑
            </Button>,
            <Button
              key="delete"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(chapter.id)}
            >
              删除
            </Button>
          ]}
        >
          <List.Item.Meta
            title={chapter.title}
            description={
              <Space>
                <span>开始时间：{formatTime(chapter.startTime)}</span>
                <span>结束时间：{formatTime(chapter.endTime)}</span>
                <span>时长：{formatTime(chapter.endTime - chapter.startTime)}</span>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  )
} 