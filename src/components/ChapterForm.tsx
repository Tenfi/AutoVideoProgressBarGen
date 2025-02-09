import React from 'react'
import { Form, Input, InputNumber, Button, Space } from 'antd'
import { Chapter } from '../types'
import { MAX_CHAPTER_TITLE_LENGTH, MIN_DURATION, MAX_DURATION } from '../utils/constants'

interface ChapterFormProps {
  onSubmit: (chapter: Omit<Chapter, 'id'>) => void
  initialValues?: Omit<Chapter, 'id'>
  totalDuration: number
}

export const ChapterForm: React.FC<ChapterFormProps> = ({
  onSubmit,
  initialValues,
  totalDuration
}) => {
  const [form] = Form.useForm()

  const handleSubmit = (values: Omit<Chapter, 'id'>) => {
    onSubmit(values)
    if (!initialValues) {
      form.resetFields()
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <Form.Item
        name="title"
        label="章节标题"
        rules={[
          { required: true, message: '请输入章节标题' },
          { max: MAX_CHAPTER_TITLE_LENGTH, message: `标题最多${MAX_CHAPTER_TITLE_LENGTH}个字符` }
        ]}
      >
        <Input placeholder="请输入章节标题" />
      </Form.Item>

      <Space>
        <Form.Item
          name="startTime"
          label="开始时间（分钟）"
          rules={[
            { required: true, message: '请输入开始时间' },
            { type: 'number', min: 0, max: totalDuration, message: `时间必须在0-${totalDuration}分钟之间` }
          ]}
        >
          <InputNumber
            min={MIN_DURATION}
            max={MAX_DURATION}
            step={0.1}
            precision={1}
            placeholder="开始时间"
            style={{ width: 120 }}
          />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="结束时间（分钟）"
          rules={[
            { required: true, message: '请输入结束时间' },
            { type: 'number', min: 0, max: totalDuration, message: `时间必须在0-${totalDuration}分钟之间` },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('startTime') < value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('结束时间必须大于开始时间'))
              }
            })
          ]}
        >
          <InputNumber
            min={MIN_DURATION}
            max={MAX_DURATION}
            step={0.1}
            precision={1}
            placeholder="结束时间"
            style={{ width: 120 }}
          />
        </Form.Item>
      </Space>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {initialValues ? '更新章节' : '添加章节'}
        </Button>
      </Form.Item>
    </Form>
  )
} 