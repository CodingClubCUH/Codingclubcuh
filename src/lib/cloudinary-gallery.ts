export interface CloudinaryPhoto {
  id: string
  title: string
  caption: string
  category: 'events' | 'workshops' | 'team' | 'classes' | 'gallery'
  folder: string
  url: string
  width: number
  height: number
}

export const CLOUDINARY_GALLERY_PHOTOS: CloudinaryPhoto[] = [
  {
    id: 'media_coverage_dainik_bhaskar',
    title: 'Dainik Bhaskar Media Feature',
    caption: 'State newspaper coverage of Coding Club CUH achievements and innovations.',
    category: 'events',
    folder: 'codingclub/gallery/2026',
    url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927156/codingclub/gallery/2026/media_coverage_dainik_bhaskar.jpg',
    width: 742,
    height: 760,
  },
  {
    id: 'club_group_photo',
    title: 'Coding Club Community',
    caption: 'Faculty coordinators and student members at Coding Club CUH annual meetup.',
    category: 'team',
    folder: 'codingclub/gallery/2026',
    url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927155/codingclub/gallery/2026/club_group_photo.jpg',
    width: 1265,
    height: 581,
  },
  {
    id: 'cuh_team_2026',
    title: 'Core Student Team',
    caption: 'Student leadership and technical organizers behind club activities.',
    category: 'team',
    folder: 'codingclub/teams/members',
    url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg',
    width: 3990,
    height: 2314,
  },
]

export const CLOUDINARY_CAROUSEL_SLIDES = [
  {
    href: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927151/codingclub/teams/coordinators/dr_sunil_kumar.jpg',
    title: 'Dr. Sunil Kumar — Faculty Coordinator',
  },
  {
    href: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927151/codingclub/teams/coordinators/vice_chancellor.jpg',
    title: 'University Leadership Support',
  },
  {
    href: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927155/codingclub/gallery/2026/club_group_photo.jpg',
    title: 'Coding Club Members & Community',
  },
  {
    href: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927156/codingclub/gallery/2026/media_coverage_dainik_bhaskar.jpg',
    title: 'Press & Media Recognition',
  },
]
