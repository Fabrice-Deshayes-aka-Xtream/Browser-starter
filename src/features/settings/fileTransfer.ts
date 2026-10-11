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
