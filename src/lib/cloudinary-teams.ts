export interface CloudinaryTeamMember {
  id: string
  name: string
  position: string
  category: 'faculty' | 'core' | 'technical' | 'design' | 'outreach' | 'teachers'
  courseYear: string
  order?: number
  isTeacher?: boolean
  teachingSubject?: string
  photo: {
    url: string
    width?: number
    height?: number
  }
  folder: string
  linkedin?: string
  github?: string
}

export const CLOUDINARY_TEAM_MEMBERS: CloudinaryTeamMember[] = [
  {
    id: 'prof_tankeshwar',
    name: 'Prof. Tankeshwar Kumar',
    position: 'Chief Patron & Vice Chancellor',
    category: 'faculty',
    order: 1,
    courseYear: 'Central University of Haryana',
    folder: 'codingclub/teams/coordinators',
    photo: {
      url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927151/codingclub/teams/coordinators/vice_chancellor.jpg',
      width: 1205,
      height: 904,
    },
    linkedin: 'https://www.linkedin.com/school/central-university-of-haryana/',
  },
  {
    id: 'dr_sunil_kumar',
    name: 'Dr. Sunil Kumar',
    position: 'Faculty Coordinator',
    category: 'faculty',
    order: 2,
    courseYear: 'Department of Computer Science & Engineering',
    folder: 'codingclub/teams/coordinators',
    photo: {
      url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927151/codingclub/teams/coordinators/dr_sunil_kumar.jpg',
      width: 1068,
      height: 611,
    },
    linkedin: 'https://www.linkedin.com/school/central-university-of-haryana/',
  },
  {
    id: 'cuh_core_team',
    name: 'Coding Club Core Committee',
    position: 'Core Lead & Organizing Committee',
    category: 'core',
    courseYear: 'B.Tech Computer Science & Engineering',
    folder: 'codingclub/teams/members',
    photo: {
      url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg',
      width: 3990,
      height: 2314,
    },
    github: 'https://github.com/itsmeaj27/codingclub',
    linkedin: 'https://www.linkedin.com/school/central-university-of-haryana/',
  },
  {
    id: 'cuh_technical_leads',
    name: 'Technical & Event Coordinators',
    position: 'Workshop & Hackathon Leads',
    category: 'technical',
    courseYear: 'Department of CSE, CUH',
    folder: 'codingclub/teams/members',
    photo: {
      url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927155/codingclub/gallery/2026/club_group_photo.jpg',
      width: 1265,
      height: 581,
    },
    github: 'https://github.com/itsmeaj27/codingclub',
  },
]
