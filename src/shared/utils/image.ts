const ICON_SIZE = 64

/** Downscales an image blob (any browser-supported format, including SVG) to a square PNG data URL. */
export async function blobToIconDataUrl(blob: Blob, size = ICON_SIZE): Promise<string> {
  const objectUrl = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.src = objectUrl
    await image.decode()

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ratio = Math.min(size / image.naturalWidth, size / image.naturalHeight)
    const width = image.naturalWidth * ratio
    const height = image.naturalHeight * ratio
    canvas
      .getContext('2d')!
      .drawImage(image, (size - width) / 2, (size - height) / 2, width, height)
    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
