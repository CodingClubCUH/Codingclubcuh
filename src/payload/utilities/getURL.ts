import canUseDOM from './canUseDOM'

export const getServerSideURL = (): string => {
  let url = process.env.NEXT_PUBLIC_SERVER_URL

  if (!url && process.env.URL) {
    return process.env.URL
  }

  if (!url) {
    const port = process.env.PORT || '3001'
    url = process.env.NODE_ENV === 'production' ? 'https://codingclubcuh.online' : `http://localhost:${port}`
  }

  return url
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  return getServerSideURL()
}
