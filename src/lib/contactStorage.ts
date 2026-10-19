import fs from 'fs'
import path from 'path'

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  channel?: 'website' | 'email' | 'telegram' | 'other'
  status: 'unread' | 'read' | 'replied'
  adminNotes?: string
  replyMessage?: string
  repliedAt?: string
  createdAt: string
  updatedAt: string
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data')
const FILE_PATH = path.join(DATA_DIR, 'contact-messages.json')

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(FILE_PATH)) {
    const seedData: ContactMessage[] = [
      {
        id: 'msg-seed-1',
        name: 'Rahul Verma',
        email: 'rahul.verma@cuh.ac.in',
        subject: 'Inquiry regarding Upcoming Web Development Bootcamp',
        message: 'Hello Coding Club team, I am a 2nd year B.Tech CSE student. I would like to know if students from other departments can also join the weekend full-stack bootcamps and how the selection works.',
        channel: 'website',
        status: 'unread',
        createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      },
      {
        id: 'msg-seed-2',
        name: 'Priya Sharma',
        email: 'priyasharma.mca@gmail.com',
        subject: 'Certificate verification query for Git & GitHub Masterclass',
        message: 'Hi, I completed the Git workshop last month but had an issue with the spelling in my name on the certificate. Could someone please help me get it corrected?',
        channel: 'website',
        status: 'read',
        createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
      },
      {
        id: 'msg-seed-3',
        name: 'Amit Kumar',
        email: 'amit.maths@cuh.ac.in',
        subject: 'Speaker / Workshop Collaboration Proposal',
        message: 'Greetings! I am writing on behalf of the Department of Mathematics. We are organizing a National Seminar on Mathematical Computing and would love to collaborate with Coding Club CUH for a hands-on Python workshop.',
        channel: 'website',
        status: 'replied',
        replyMessage: 'Dear Amit, Thank you for reaching out. We would be delighted to collaborate. Our student instructors have prepared a curriculum on NumPy & SciPy. Let us connect over a short meeting.',
        repliedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
      },
    ]
    fs.writeFileSync(FILE_PATH, JSON.stringify(seedData, null, 2), 'utf-8')
  }
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  try {
    ensureFileExists()
    const content = fs.readFileSync(FILE_PATH, 'utf-8')
    const messages: ContactMessage[] = JSON.parse(content || '[]')
    return messages.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (err) {
    console.error('[CONTACT STORAGE ERROR] Failed to read contact messages:', err)
    return []
  }
}

export async function getContactMessageById(id: string): Promise<ContactMessage | null> {
  const all = await getAllContactMessages()
  return all.find((m) => m.id === id) || null
}

export async function createContactMessage(
  data: Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<ContactMessage> {
  ensureFileExists()
  const all = await getAllContactMessages()

  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    channel: data.channel || 'website',
    status: 'unread',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  all.unshift(newMessage)
  fs.writeFileSync(FILE_PATH, JSON.stringify(all, null, 2), 'utf-8')
  return newMessage
}

export async function updateContactMessage(
  id: string,
  updates: Partial<Omit<ContactMessage, 'id' | 'createdAt'>>
): Promise<ContactMessage | null> {
  ensureFileExists()
  const all = await getAllContactMessages()
  const index = all.findIndex((m) => m.id === id)
  if (index === -1) return null

  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  fs.writeFileSync(FILE_PATH, JSON.stringify(all, null, 2), 'utf-8')
  return all[index]
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  ensureFileExists()
  const all = await getAllContactMessages()
  const filtered = all.filter((m) => m.id !== id)
  if (filtered.length === all.length) return false

  fs.writeFileSync(FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8')
  return true
}

export async function getContactStats(): Promise<{
  total: number
  unread: number
  read: number
  replied: number
}> {
  const all = await getAllContactMessages()
  return {
    total: all.length,
    unread: all.filter((m) => m.status === 'unread').length,
    read: all.filter((m) => m.status === 'read').length,
    replied: all.filter((m) => m.status === 'replied').length,
  }
}
