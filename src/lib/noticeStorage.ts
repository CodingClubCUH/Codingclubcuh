import fs from 'fs'
import path from 'path'

export interface SentNotice {
  id: string
  subject: string
  message: string
  category: string
  recipientsCount: number
  recipients: string[]
  sentBy?: string
  status: 'sent' | 'partially_sent' | 'failed' | 'simulated'
  sentAt: string
  failedCount?: number
  errors?: string[]
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data')
const FILE_PATH = path.join(DATA_DIR, 'sent-notices.json')

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf-8')
  }
}

export async function getAllSentNotices(): Promise<SentNotice[]> {
  try {
    ensureFileExists()
    const content = fs.readFileSync(FILE_PATH, 'utf-8')
    const notices: SentNotice[] = JSON.parse(content || '[]')
    return notices.sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    )
  } catch (err) {
    console.error('[NOTICE STORAGE ERROR] Failed to read sent notices:', err)
    return []
  }
}

export async function saveSentNotice(
  data: Omit<SentNotice, 'id' | 'sentAt'>
): Promise<SentNotice> {
  ensureFileExists()
  const all = await getAllSentNotices()

  const newNotice: SentNotice = {
    id: `notice-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    sentAt: new Date().toISOString(),
  }

  all.unshift(newNotice)
  fs.writeFileSync(FILE_PATH, JSON.stringify(all, null, 2), 'utf-8')
  return newNotice
}
