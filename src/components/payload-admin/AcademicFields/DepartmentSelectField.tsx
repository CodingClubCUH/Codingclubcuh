'use client'

import React, { useState } from 'react'
import type { TextFieldClientProps } from 'payload'
import { useField, FieldLabel } from '@payloadcms/ui'
import { DEPARTMENTS } from '@/lib/academicPrograms'

export const DepartmentSelectField: React.FC<TextFieldClientProps> = ({
  field,
  path,
  readOnly,
}) => {
  const { value, setValue } = useField<string>({ path: path || field.name })
  const [isCustom, setIsCustom] = useState<boolean>(() => {
    return Boolean(value && !DEPARTMENTS.includes(value))
  })

  const { label } = field

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === '__custom__') {
      setIsCustom(true)
    } else {
      setIsCustom(false)
      setValue(val)
    }
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const hasCustomValue = Boolean(value && !DEPARTMENTS.includes(value))

  return (
    <div className="field-type text academic-field" style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FieldLabel htmlFor={`field-${path || field.name}`} label={label || 'Department'} />
        <button
          type="button"
          onClick={() => setIsCustom((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            fontSize: '11px',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          {isCustom ? 'Pick from dropdown list' : 'Type custom department'}
        </button>
      </div>

      {!isCustom ? (
        <select
          id={`field-${path || field.name}`}
          value={value || ''}
          onChange={handleSelectChange}
          disabled={Boolean(readOnly)}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '6px',
            border: '1px solid #334155',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">-- Select Academic Department --</option>
          {hasCustomValue && (
            <option value={value}>{value} (Current / Custom)</option>
          )}
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
          <option value="__custom__">+ Enter Other / Custom Department...</option>
        </select>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            id={`field-${path || field.name}`}
            value={value || ''}
            onChange={handleCustomChange}
            placeholder="Enter department name"
            disabled={Boolean(readOnly)}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '6px',
              border: '1px solid #334155',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => setIsCustom(false)}
            style={{
              padding: '0 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1e293b',
              color: '#e2e8f0',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {field.admin && 'description' in field.admin && field.admin.description && (
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
          {String(field.admin.description)}
        </div>
      )}
    </div>
  )
}

export default DepartmentSelectField
