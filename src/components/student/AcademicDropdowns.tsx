"use client";

import React, { useState, useId } from "react";
import { Label } from "@/components/ui/label";
import { Building2, GraduationCap, Layers, Filter } from "lucide-react";
import {
  DEPARTMENTS,
  COURSES,
  SEMESTERS,
  ACADEMIC_PROGRAMS,
  getCoursesByDepartment,
  getDepartmentByCourse,
  getLevelByCourse,
} from "@/lib/academicPrograms";

interface AcademicDropdownsProps {
  department: string;
  setDepartment: (dept: string) => void;
  course: string;
  setCourse: (course: string) => void;
  semester: string;
  setSemester: (sem: string) => void;
  disabled?: boolean;
  required?: boolean;
  compact?: boolean;
}

export function AcademicDropdowns({
  department,
  setDepartment,
  course,
  setCourse,
  semester,
  setSemester,
  disabled = false,
  required = true,
  compact = false,
}: AcademicDropdownsProps) {
  const deptId = useId();
  const courseId = useId();
  const semId = useId();

  const [customDept, setCustomDept] = useState(
    () => Boolean(department && !DEPARTMENTS.includes(department))
  );
  const [customCourse, setCustomCourse] = useState(
    () => Boolean(course && !COURSES.includes(course))
  );
  const [customSemester, setCustomSemester] = useState(
    () => Boolean(semester && !SEMESTERS.includes(semester))
  );
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Available courses based on selected department
  const filteredPrograms =
    department && !showAllCourses && !customDept
      ? getCoursesByDepartment(department)
      : ACADEMIC_PROGRAMS;

  const currentLevel = course ? getLevelByCourse(course) : null;
  const isCustomDeptValue = Boolean(department && !DEPARTMENTS.includes(department));
  const isCustomCourseValue = Boolean(course && !COURSES.includes(course));
  const isCustomSemValue = Boolean(semester && !SEMESTERS.includes(semester));

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setCustomDept(true);
      return;
    }
    setCustomDept(false);
    setDepartment(val);

    // If current course is not offered by the newly selected department, reset or re-evaluate
    if (val && course && !customCourse) {
      const deptCourses = getCoursesByDepartment(val).map((p) => p.courseName);
      if (!deptCourses.includes(course)) {
        // Automatically set to the first course of this department if single course, or clear
        if (deptCourses.length === 1) {
          setCourse(deptCourses[0]);
        }
      }
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setCustomCourse(true);
      return;
    }
    setCustomCourse(false);
    setCourse(val);

    // Auto-select department if course belongs to a known department
    const matchedDept = getDepartmentByCourse(val);
    if (matchedDept && (!department || matchedDept !== department)) {
      setDepartment(matchedDept);
      setCustomDept(false);
    }
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setCustomSemester(true);
      return;
    }
    setCustomSemester(false);
    setSemester(val);
  };

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {/* 1. Academic Department Dropdown */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={deptId}
            className="text-sm text-foreground flex items-center gap-1.5 font-medium"
          >
            <Building2 size={15} className="text-primary shrink-0" />
            <span>Academic Department</span>
            {required && <span className="text-red-500">*</span>}
          </Label>
          <button
            type="button"
            onClick={() => setCustomDept((prev) => !prev)}
            className="text-[11px] text-primary hover:underline transition-colors"
          >
            {customDept ? "Select from list" : "Other / Custom"}
          </button>
        </div>

        {!customDept ? (
          <div className="relative">
            <select
              id={deptId}
              required={required}
              disabled={disabled}
              value={department || ""}
              onChange={handleDepartmentChange}
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="" disabled>
                -- Select University Department --
              </option>
              {isCustomDeptValue && (
                <option value={department}>{department} (Custom / Current)</option>
              )}
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
              <option value="__custom__">+ Enter Other / Custom Department...</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              id={deptId}
              required={required}
              disabled={disabled}
              placeholder="e.g. Department of Computer Science & IT"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="flex-1 h-10 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setCustomDept(false)}
              className="px-3 h-10 text-xs bg-muted text-muted-foreground hover:text-foreground rounded-lg border border-border"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* 2. Course / Degree Program Dropdown */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <Label
              htmlFor={courseId}
              className="text-sm text-foreground flex items-center gap-1.5 font-medium"
            >
              <GraduationCap size={15} className="text-primary shrink-0" />
              <span>Course / Degree Program</span>
              {required && <span className="text-red-500">*</span>}
            </Label>
            {currentLevel && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  currentLevel === "Undergraduate"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                }`}
              >
                {currentLevel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            {department && !customDept && (
              <button
                type="button"
                onClick={() => setShowAllCourses((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <Filter size={11} />
                <span>
                  {showAllCourses
                    ? `Filter by ${department}`
                    : `Show all (${ACADEMIC_PROGRAMS.length} courses)`}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setCustomCourse((prev) => !prev)}
              className="text-primary hover:underline transition-colors"
            >
              {customCourse ? "Select from list" : "Other / Custom"}
            </button>
          </div>
        </div>

        {!customCourse ? (
          <div className="relative">
            <select
              id={courseId}
              required={required}
              disabled={disabled}
              value={course || ""}
              onChange={handleCourseChange}
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="" disabled>
                {department && !showAllCourses
                  ? `-- Select Course (${filteredPrograms.length} in ${department}) --`
                  : "-- Select Course / Degree Program --"}
              </option>
              {isCustomCourseValue && (
                <option value={course}>{course} (Custom / Current)</option>
              )}

              {department && !showAllCourses && !customDept ? (
                // Filtered by department
                filteredPrograms.map((p) => (
                  <option key={p.courseName} value={p.courseName}>
                    {p.courseName} ({p.level === "Undergraduate" ? "UG" : "PG"})
                  </option>
                ))
              ) : (
                // All university courses grouped by Level
                <>
                  <optgroup label="Undergraduate Programs (UG)">
                    {ACADEMIC_PROGRAMS.filter((p) => p.level === "Undergraduate").map((p) => (
                      <option key={p.courseName} value={p.courseName}>
                        {p.courseName} &bull; {p.department}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Postgraduate Programs (PG)">
                    {ACADEMIC_PROGRAMS.filter((p) => p.level === "Postgraduate").map((p) => (
                      <option key={p.courseName} value={p.courseName}>
                        {p.courseName} &bull; {p.department}
                      </option>
                    ))}
                  </optgroup>
                </>
              )}
              <option value="__custom__">+ Enter Other / Custom Course...</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              id={courseId}
              required={required}
              disabled={disabled}
              placeholder="e.g. B.Tech. in Computer Science & Engineering"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="flex-1 h-10 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setCustomCourse(false)}
              className="px-3 h-10 text-xs bg-muted text-muted-foreground hover:text-foreground rounded-lg border border-border"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* 3. Semester / Academic Standing Dropdown */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={semId}
            className="text-sm text-foreground flex items-center gap-1.5 font-medium"
          >
            <Layers size={15} className="text-primary shrink-0" />
            <span>Semester / Academic Standing</span>
            {required && <span className="text-red-500">*</span>}
          </Label>
          <button
            type="button"
            onClick={() => setCustomSemester((prev) => !prev)}
            className="text-[11px] text-primary hover:underline transition-colors"
          >
            {customSemester ? "Select from list" : "Other / Custom"}
          </button>
        </div>

        {!customSemester ? (
          <div className="relative">
            <select
              id={semId}
              required={required}
              disabled={disabled}
              value={semester || ""}
              onChange={handleSemesterChange}
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="" disabled>
                -- Select Semester / Year --
              </option>
              {isCustomSemValue && (
                <option value={semester}>{semester} (Custom / Current)</option>
              )}
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="__custom__">+ Enter Other / Custom Standing...</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              id={semId}
              required={required}
              disabled={disabled}
              placeholder="e.g. 1st Semester, 2nd Year, Alumni, etc."
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="flex-1 h-10 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setCustomSemester(false)}
              className="px-3 h-10 text-xs bg-muted text-muted-foreground hover:text-foreground rounded-lg border border-border"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AcademicDropdowns;
