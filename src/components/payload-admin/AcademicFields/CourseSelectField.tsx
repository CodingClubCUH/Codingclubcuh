'use client'

import React, { useState } from 'react'
import type { TextFieldClientProps } from 'payload'
import { useField, FieldLabel, useForm } from '@payloadcms/ui'
import {
  COURSES,
  ACADEMIC_PROGRAMS,
  getCoursesByDepartment,
  getDepartmentByCourse,
  getLevelByCourse,
} from '@/lib/academicPrograms'

export const CourseSelectField: React.FC<TextFieldClientProps> = ({
  field,
  path,
  readOnly,
}) => {
  const { value, setValue } = useField<string>({ path: path || field.name })
  const { getDataByPath, dispatchFields } = useForm()
  const [isCustom, setIsCustom] = useState<boolean>(() => {
    return Boolean(value && !COURSES.includes(value))
  })
  const [showAllCourses, setShowAllCourses] = useState<boolean>(false)

  const currentDepartment = (getDataByPath('department') as string) || ''
  const filteredPrograms = !showAllCourses && currentDepartment
    ? getCoursesByDepartment(currentDepartment)
    : ACADEMIC_PROGRAMS

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === '__custom__') {
      setIsCustom(true)
    } else {
      setIsCustom(false)
      setValue(val)

      // Auto-set department if not currently set or if filtering is not locked
      const matchingDept = getDepartmentByCourse(val)
      if (matchingDept && (!currentDepartment || matchingDept !== currentDepartment)) {
        dispatchFields({
          type: 'UPDATE',
          path: 'department',
          value: matchingDept,
        })
      }
    }
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const hasCustomValue = Boolean(value && !COURSES.includes(value))
  const courseLevel = value ? getLevelByCourse(value) : null
  const courseDept = value ? getDepartmentByCourse(value) : null

  return (
    <div className="field-type text academic-field" style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FieldLabel htmlFor={`field-${path || field.name}`} label={field.label || 'Course / Degree'} />
          {courseLevel && (
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: courseLevel === 'Undergraduate' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                color: courseLevel === 'Undergraduate' ? '#38bdf8' : '#c084fc',
                fontWeight: 600,
              }}
            >
              {courseLevel}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
          {currentDepartment && (
            <button
              type="button"
              onClick={() => setShowAllCourses((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              {showAllCourses ? `Filter by ${currentDepartment}` : 'Show all university courses'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCustom((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            {isCustom ? 'Pick from dropdown list' : 'Type custom course'}
          </button>
        </div>
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
          <option value="">
            {currentDepartment && !showAllCourses
              ? `-- Select Course (${filteredPrograms.length} courses in ${currentDepartment}) --`
              : '-- Select University Course --'}
          </option>
          {hasCustomValue && (
            <option value={value}>{value} (Current / Custom)</option>
          )}
          {filteredPrograms.map((p) => (
            <option key={p.courseName} value={p.courseName}>
              {p.courseName} {(!currentDepartment || showAllCourses) ? `(${p.department} • ${p.level === 'Undergraduate' ? 'UG' : 'PG'})` : `(${p.level === 'Undergraduate' ? 'UG' : 'PG'})`}
            </option>
          ))}
          <option value="__custom__">+ Enter Other / Custom Course...</option>
        </select>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            id={`field-${path || field.name}`}
            value={value || ''}
            onChange={handleCustomChange}
            placeholder="Enter course name"
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

      {courseDept && (
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
          Associated Department: <strong style={{ color: '#94a3b8' }}>{courseDept}</strong>
        </div>
      )}
    </div>
  )
}

export default CourseSelectField
