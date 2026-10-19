export interface AcademicProgram {
  department: string;
  courseName: string;
  level: 'Undergraduate' | 'Postgraduate';
}

export const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  // Undergraduate
  { department: 'Chemistry', courseName: 'Integrated B.Sc.–M.Sc. in Chemistry', level: 'Undergraduate' },
  { department: 'Civil Engineering', courseName: 'B.Tech. in Civil Engineering', level: 'Undergraduate' },
  { department: 'Computer Science & Engineering', courseName: 'B.Tech. in Computer Science & Engineering', level: 'Undergraduate' },
  { department: 'Electrical Engineering', courseName: 'B.Tech. in Electrical Engineering', level: 'Undergraduate' },
  { department: 'Management Studies', courseName: 'Bachelor of Business Administration (B.B.A.)', level: 'Undergraduate' },
  { department: 'Mathematics', courseName: 'Integrated B.Sc.–M.Sc. in Mathematics', level: 'Undergraduate' },
  { department: 'Physics & Astrophysics', courseName: 'Integrated B.Sc.–M.Sc. in Physics', level: 'Undergraduate' },
  { department: 'Printing and Packaging Technology', courseName: 'B.Tech. in Printing & Packaging Technology', level: 'Undergraduate' },
  { department: 'Psychology', courseName: 'B.Sc. (Hons) in Psychology', level: 'Undergraduate' },
  { department: 'Teacher Education', courseName: 'Integrated Teacher Education Programme (ITEP / B.A. B.Ed.)', level: 'Undergraduate' },
  { department: 'Vocational Studies and Skill Development', courseName: 'B.Voc. in Biomedical Sciences', level: 'Undergraduate' },
  { department: 'Vocational Studies and Skill Development', courseName: 'B.Voc. in Industrial Waste Management', level: 'Undergraduate' },
  { department: 'Vocational Studies and Skill Development', courseName: 'B.Voc. in Retail and Logistics Management', level: 'Undergraduate' },

  // Postgraduate
  { department: 'Biochemistry', courseName: 'M.Sc. in Biochemistry', level: 'Postgraduate' },
  { department: 'Biotechnology', courseName: 'M.Sc. in Biotechnology', level: 'Postgraduate' },
  { department: 'Chemistry', courseName: 'M.Sc. in Chemistry', level: 'Postgraduate' },
  { department: 'Civil Engineering', courseName: 'M.Tech. in Structural Engineering', level: 'Postgraduate' },
  { department: 'Commerce', courseName: 'Master of Commerce (M.Com.)', level: 'Postgraduate' },
  { department: 'Computer Science & Engineering', courseName: 'M.Tech. in Computer Science & Engineering', level: 'Postgraduate' },
  { department: 'Computer Sciences & Information Technology', courseName: 'M.Sc. in Data Science', level: 'Postgraduate' },
  { department: 'Computer Sciences & Information Technology', courseName: 'Master of Computer Applications (M.C.A.)', level: 'Postgraduate' },
  { department: 'Economics', courseName: 'M.A. in Economics', level: 'Postgraduate' },
  { department: 'Energy Systems and Management', courseName: 'M.Tech. in Energy Systems and Management', level: 'Postgraduate' },
  { department: 'English & Foreign Languages', courseName: 'M.A. in English', level: 'Postgraduate' },
  { department: 'Environmental Studies', courseName: 'M.Sc. in Environmental Science', level: 'Postgraduate' },
  { department: 'Geography', courseName: 'M.Sc. / M.A. in Geography', level: 'Postgraduate' },
  { department: 'Geography', courseName: 'M.Sc. in Geoinformatics', level: 'Postgraduate' },
  { department: 'Hindi', courseName: 'M.A. in Hindi', level: 'Postgraduate' },
  { department: 'Hindi', courseName: 'M.A. in Hindi Translation', level: 'Postgraduate' },
  { department: 'Hindu Studies', courseName: 'M.A. in Hindu Studies', level: 'Postgraduate' },
  { department: 'History & Archaeology', courseName: 'M.A. in History & Archaeology', level: 'Postgraduate' },
  { department: 'Journalism & Mass Communication', courseName: 'M.A. in Journalism & Mass Communication', level: 'Postgraduate' },
  { department: 'Law', courseName: 'Bachelor of Laws (LL.B.)', level: 'Postgraduate' },
  { department: 'Law', courseName: 'Master of Laws (LL.M.)', level: 'Postgraduate' },
  { department: 'Library & Information Science', courseName: 'Master of Library & Information Science (M.Lib.I.Sc.)', level: 'Postgraduate' },
  { department: 'Management Studies', courseName: 'M.B.A. (Executive)', level: 'Postgraduate' },
  { department: 'Management Studies', courseName: 'Master of Business Administration (M.B.A.)', level: 'Postgraduate' },
  { department: 'Mathematics', courseName: 'M.Sc. in Mathematics', level: 'Postgraduate' },
  { department: 'Microbiology', courseName: 'M.Sc. in Microbiology', level: 'Postgraduate' },
  { department: 'Nutrition Biology', courseName: 'M.Sc. in Nutrition Biology', level: 'Postgraduate' },
  { department: 'Pharmaceutical Sciences', courseName: 'Master of Pharmacy (M.Pharm.) in Pharmaceutics', level: 'Postgraduate' },
  { department: 'Pharmaceutical Sciences', courseName: 'Master of Pharmacy (M.Pharm.) in Pharmacognosy', level: 'Postgraduate' },
  { department: 'Pharmaceutical Sciences', courseName: 'Master of Pharmacy (M.Pharm.) in Pharmacology', level: 'Postgraduate' },
  { department: 'Physical Education & Sports', courseName: 'Master of Physical Education & Sports (M.P.Ed. / M.P.E.S.)', level: 'Postgraduate' },
  { department: 'Physics & Astrophysics', courseName: 'M.Sc. in Physics', level: 'Postgraduate' },
  { department: 'Political Science', courseName: 'M.A. in Political Science', level: 'Postgraduate' },
  { department: 'Psychology', courseName: 'M.A. in Psychology', level: 'Postgraduate' },
  { department: 'Sanskrit', courseName: 'M.A. in Sanskrit', level: 'Postgraduate' },
  { department: 'Sociology', courseName: 'M.A. in Sociology', level: 'Postgraduate' },
  { department: 'Statistics', courseName: 'M.Sc. in Statistics', level: 'Postgraduate' },
  { department: 'Teacher Education', courseName: 'Bachelor of Education (B.Ed.)', level: 'Postgraduate' },
  { department: 'Teacher Education', courseName: 'Master of Education (M.Ed.)', level: 'Postgraduate' },
  { department: 'Tourism & Hotel Management', courseName: 'M.B.A. in Tourism & Travel Management', level: 'Postgraduate' },
  { department: 'Tourism & Hotel Management', courseName: 'Master of Hotel Management & Catering Technology (M.H.M.C.T.)', level: 'Postgraduate' },
  { department: 'Yoga', courseName: 'M.Sc. in Yoga', level: 'Postgraduate' },
];

// Unique sorted list of departments
export const DEPARTMENTS: string[] = Array.from(
  new Set(ACADEMIC_PROGRAMS.map((p) => p.department))
).sort((a, b) => a.localeCompare(b));

// Unique sorted list of courses
export const COURSES: string[] = Array.from(
  new Set(ACADEMIC_PROGRAMS.map((p) => p.courseName))
).sort((a, b) => a.localeCompare(b));

export const SEMESTERS: string[] = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
  'Passed Out / Alumni',
];

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({
  label: d,
  value: d,
}));

export const COURSE_OPTIONS = COURSES.map((c) => ({
  label: c,
  value: c,
}));

export const SEMESTER_OPTIONS = SEMESTERS.map((s) => ({
  label: s,
  value: s,
}));

export function getCoursesByDepartment(department?: string): AcademicProgram[] {
  if (!department) return ACADEMIC_PROGRAMS;
  return ACADEMIC_PROGRAMS.filter(
    (p) => p.department.trim().toLowerCase() === department.trim().toLowerCase()
  );
}

export function getDepartmentByCourse(courseName?: string): string | null {
  if (!courseName) return null;
  const match = ACADEMIC_PROGRAMS.find(
    (p) => p.courseName.trim().toLowerCase() === courseName.trim().toLowerCase()
  );
  return match ? match.department : null;
}

export function getLevelByCourse(courseName?: string): 'Undergraduate' | 'Postgraduate' | null {
  if (!courseName) return null;
  const match = ACADEMIC_PROGRAMS.find(
    (p) => p.courseName.trim().toLowerCase() === courseName.trim().toLowerCase()
  );
  return match ? match.level : null;
}
