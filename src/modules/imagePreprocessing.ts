/**
 * Image preprocessing for ErgoSnap Analytics.
 * Decodes, validates, reads dimensions, extracts EXIF orientation,
 * and maintains coordinate mapping without destructive changes.
 */

export interface ProcessedImage {
  originalFile: File;
  displayUrl: string;
  imageElement: HTMLImageElement;
  width: number;
  height: number;
  exifOrientation: number;
  transformApplied: string | null;
  coordinateScale: { x: number; y: number };
}

export interface PreprocessingError {
  code: 'DECODE_FAILED' | 'TOO_LARGE' | 'UNSUPPORTED_TYPE' | 'CORRUPT';
  message: string;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validate and preprocess an uploaded photograph.
 */
export async function preprocessImage(file: File): Promise<ProcessedImage | PreprocessingError> {
  // 1. Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      code: 'TOO_LARGE',
      message: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 20 MB limit.`,
    };
  }

  // 2. Validate MIME type
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return {
      code: 'UNSUPPORTED_TYPE',
      message: `Unsupported file type "${file.type || 'unknown'}". Please upload a JPEG, PNG, or WebP photograph.`,
    };
  }

  // 3. Read EXIF orientation
  let exifOrientation = 1;
  try {
    exifOrientation = await readExifOrientation(file);
  } catch {
    exifOrientation = 1;
  }

  // 4. Decode image
  const displayUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(displayUrl);
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      URL.revokeObjectURL(displayUrl);
      return {
        code: 'CORRUPT',
        message: 'Image has invalid or zero dimensions. The file may be corrupted.',
      };
    }

    const transformApplied = exifOrientation !== 1 ? `EXIF Orientation ${exifOrientation}` : null;

    return {
      originalFile: file,
      displayUrl,
      imageElement: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      exifOrientation,
      transformApplied,
      coordinateScale: { x: 1, y: 1 },
    };
  } catch {
    URL.revokeObjectURL(displayUrl);
    return {
      code: 'DECODE_FAILED',
      message: 'Failed to decode image data. The file appears to be corrupted or unreadable.',
    };
  }
}

/**
 * Helper to load an HTMLImageElement asynchronously
 */
function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = url;
  });
}

/**
 * Free memory by revoking object URL
 */
export function revokeImageUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Read EXIF orientation from JPEG buffer without external dependencies.
 */
async function readExifOrientation(file: File): Promise<number> {
  if (file.type !== 'image/jpeg') return 1;

  const buffer = await file.slice(0, 64 * 1024).arrayBuffer();
  const view = new DataView(buffer);

  // Check SOI marker 0xFFD8
  if (view.getUint16(0, false) !== 0xffd8) return 1;

  let offset = 2;
  const length = view.byteLength;

  while (offset < length - 2) {
    const marker = view.getUint16(offset, false);
    offset += 2;

    if (marker === 0xffe1) {
      // APP1 marker
      const app1Length = view.getUint16(offset, false);
      offset += 2;
      // Check for 'Exif\0\0'
      if (
        view.getUint32(offset, false) === 0x45786966 &&
        view.getUint16(offset + 4, false) === 0x0000
      ) {
        const tiffOffset = offset + 6;
        const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
        const firstIFDOffset = view.getUint32(tiffOffset + 4, littleEndian);
        let ifdOffset = tiffOffset + firstIFDOffset;

        if (ifdOffset + 2 > length) return 1;
        const numEntries = view.getUint16(ifdOffset, littleEndian);
        ifdOffset += 2;

        for (let i = 0; i < numEntries; i++) {
          const entryOffset = ifdOffset + i * 12;
          if (entryOffset + 12 > length) break;
          const tag = view.getUint16(entryOffset, littleEndian);
          if (tag === 0x0112) {
            // Orientation tag
            return view.getUint16(entryOffset + 8, littleEndian);
          }
        }
      }
      break;
    } else if ((marker & 0xff00) !== 0xff00) {
      break;
    } else {
      offset += view.getUint16(offset, false);
    }
  }

  return 1;
}

/**
 * CSS transform string corresponding to EXIF orientation
 */
export function exifOrientationTransform(orientation: number): string {
  switch (orientation) {
    case 2:
      return 'scaleX(-1)';
    case 3:
      return 'rotate(180deg)';
    case 4:
      return 'scaleY(-1)';
    case 5:
      return 'rotate(90deg) scaleX(-1)';
    case 6:
      return 'rotate(90deg)';
    case 7:
      return 'rotate(270deg) scaleX(-1)';
    case 8:
      return 'rotate(270deg)';
    default:
      return 'none';
  }
}
