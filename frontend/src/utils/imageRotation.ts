/**
 * Image rotation utilities for timecard processing
 */

export type RotationDegrees = 0 | 90 | 180 | 270;

/**
 * Rotates an image file by the specified degrees
 * @param file - The image file to rotate
 * @param degrees - Rotation degrees (0, 90, 180, 270)
 * @returns Promise that resolves to the rotated image file
 */
export const rotateImage = async (file: File, degrees: RotationDegrees): Promise<File> => {
  if (degrees === 0) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions based on rotation
      const isRotated90or270 = degrees === 90 || degrees === 270;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Move to center and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);

      // Draw the image
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Convert canvas to blob and then to file
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const rotatedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(rotatedFile);
        },
        file.type,
        0.95 // High quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Gets the next rotation degree in clockwise direction
 */
export const getNextRotation = (currentRotation: RotationDegrees): RotationDegrees => {
  const rotations: RotationDegrees[] = [0, 90, 180, 270];
  const currentIndex = rotations.indexOf(currentRotation);
  return rotations[(currentIndex + 1) % 4];
};

/**
 * Gets the previous rotation degree in counterclockwise direction
 */
export const getPreviousRotation = (currentRotation: RotationDegrees): RotationDegrees => {
  const rotations: RotationDegrees[] = [0, 90, 180, 270];
  const currentIndex = rotations.indexOf(currentRotation);
  return rotations[(currentIndex + 3) % 4];
};

/**
 * Creates an object URL for file preview
 */
export const createImagePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};