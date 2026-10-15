export function backupFilename(date = new Date(), workspaceName?: string): string {
  const p = (n: number) => String(n).padStart(2, '0')
  const stamp = `${p(date.getFullYear() % 100)}-${p(date.getMonth() + 1)}-${p(date.getDate())}_${p(date.getHours())}-${p(date.getMinutes())}`
  const suffix = workspaceName ? `_${workspaceName.replace(/[\\/:*?"<>|\s]+/g, '-')}` : ''
  return `${stamp}_BrowserStarter${suffix}.json`
}
export function downloadTextFile(filename: string, content: string, mimeType = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function readTextFile(file: File): Promise<string> {
  return file.text()
}
