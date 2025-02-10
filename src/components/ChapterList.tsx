import React from 'react'
import { Table, Button, Space } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Chapter } from '../types/chapter'
import styled from 'styled-components'

const TableContainer = styled.div`
  margin-top: 16px;
`

interface ChapterListProps {
  chapters: Chapter[]
  onEdit: (chapter: Chapter) => void
  onDelete: (id: string) => void
  totalDuration: number
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  onEdit,
  onDelete,
  totalDuration
}) => {
  const columns = [
    {
      title: '章节标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '开始时间',
      key: 'startTime',
      render: (_: any, record: Chapter, index: number) => {
        const startTime = index === 0 ? 0 : chapters[index - 1].endTime;
        return `${startTime.toFixed(1)} 分钟`;
      }
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (endTime: number) => `${endTime.toFixed(1)} 分钟`
    },
    {
      title: '时长',
      key: 'duration',
      render: (_: any, record: Chapter, index: number) => {
        const startTime = index === 0 ? 0 : chapters[index - 1].endTime;
        const duration = record.endTime - startTime;
        return `${duration.toFixed(1)} 分钟`;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Chapter) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => onDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <TableContainer>
      <Table
        columns={columns}
        dataSource={chapters}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </TableContainer>
  )
} 