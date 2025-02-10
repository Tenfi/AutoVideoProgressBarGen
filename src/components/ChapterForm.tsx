import React from 'react'
import { Form, Input, InputNumber, Button, Space } from 'antd'
import { Chapter } from '../types/chapter'
import styled from 'styled-components'

const FormContainer = styled.div`
  margin-bottom: 24px;
`

interface ChapterFormProps {
  onSubmit: (chapter: Omit<Chapter, 'id'>) => void
  initialValues?: Chapter
  totalDuration: number
  previousEndTime?: number
}

export const ChapterForm: React.FC<ChapterFormProps> = ({
  onSubmit,
  initialValues,
  totalDuration,
  previousEndTime = 0
}) => {
  const [form] = Form.useForm()

  const handleSubmit = (values: { title: string; endTime: number }) => {
    onSubmit({
      title: values.title,
      endTime: values.endTime
    })
    form.resetFields()
  }

  return (
    <FormContainer>
      <Form
        form={form}
        onFinish={handleSubmit}
        initialValues={initialValues}
        layout="inline"
      >
        <Form.Item
          name="title"
          rules={[
            { required: true, message: '请输入章节标题' },
            { max: 20, message: '标题最多20个字符' }
          ]}
          style={{ flex: 1 }}
        >
          <Input placeholder="请输入章节标题" maxLength={20} />
        </Form.Item>

        <Form.Item
          name="endTime"
          rules={[
            { required: true, message: '请输入结束时间' },
            {
              type: 'number',
              min: previousEndTime,
              message: `结束时间必须大于 ${previousEndTime.toFixed(1)}`
            },
            {
              type: 'number',
              max: totalDuration,
              message: `结束时间不能超过总时长 ${totalDuration.toFixed(1)}`
            }
          ]}
        >
          <InputNumber
            placeholder="结束时间"
            step={0.1}
            precision={1}
            min={previousEndTime}
            max={totalDuration}
            addonAfter="分钟"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {initialValues ? '更新章节' : '添加章节'}
            </Button>
            {initialValues && (
              <Button onClick={() => form.resetFields()}>
                取消
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </FormContainer>
  )
} 