import React from 'react'
import { Form, InputNumber, Input, Slider, Space, Card } from 'antd'
import { ProgressBarStyle } from '../types'
import { DEFAULT_PROGRESS_BAR_STYLE } from '../utils/constants'
import styled from 'styled-components'

interface StyleSettingsProps {
  style: ProgressBarStyle
  onChange: (style: ProgressBarStyle) => void
}

const ColorInput = styled(Input)`
  width: 100px;
`

const OpacitySlider = styled(Slider)`
  width: 200px;
`

export const StyleSettings: React.FC<StyleSettingsProps> = ({
  style = DEFAULT_PROGRESS_BAR_STYLE,
  onChange
}) => {
  const [form] = Form.useForm()

  const handleValuesChange = (_: any, values: ProgressBarStyle) => {
    onChange(values)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={style}
      onValuesChange={handleValuesChange}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small" title="尺寸设置">
          <Space>
            <Form.Item label="进度条高度" name="height">
              <InputNumber min={20} max={100} />
            </Form.Item>
            <Form.Item label="顶部边距" name="topMargin">
              <InputNumber min={0} max={100} />
            </Form.Item>
            <Form.Item label="字体大小" name="fontSize">
              <InputNumber min={12} max={48} />
            </Form.Item>
          </Space>
        </Card>

        <Card size="small" title="颜色设置">
          <Space>
            <Form.Item label="背景颜色" name="backgroundColor">
              <ColorInput type="color" />
            </Form.Item>
            <Form.Item label="激活颜色" name="activeColor">
              <ColorInput type="color" />
            </Form.Item>
            <Form.Item label="文字颜色" name="textColor">
              <ColorInput type="color" />
            </Form.Item>
            <Form.Item label="背景透明度" name="backgroundOpacity">
              <OpacitySlider
                min={0}
                max={1}
                step={0.1}
                marks={{
                  0: '0',
                  1: '1'
                }}
              />
            </Form.Item>
          </Space>
        </Card>

        <Card size="small" title="字体设置">
          <Form.Item label="字体" name="fontFamily">
            <Input />
          </Form.Item>
        </Card>
      </Space>
    </Form>
  )
} 