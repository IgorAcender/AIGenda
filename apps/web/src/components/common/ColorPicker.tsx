'use client'

import React from 'react'
import { Input, Space } from 'antd'

interface ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#000000',
  onChange,
  disabled = false,
}) => {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      if (onChange) {
        onChange(color)
      }
    }
  }

  return (
    <Space.Compact style={{ width: '100%' }}>
      <input
        type="color"
        value={value || '#000000'}
        onChange={handleColorChange}
        disabled={disabled}
        style={{
          width: 50,
          height: 38,
          border: '1px solid #d9d9d9',
          borderRadius: '2px 0 0 2px',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      />
      <Input
        value={value || '#000000'}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder="#000000"
        style={{
          fontFamily: 'monospace',
          borderRadius: '0 2px 2px 0',
        }}
      />
    </Space.Compact>
  )
}

export default ColorPicker
