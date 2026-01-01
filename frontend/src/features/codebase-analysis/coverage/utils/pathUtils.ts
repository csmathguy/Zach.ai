/**
 * Path utilities for displaying file paths in coverage reports
 */

/**
 * Convert absolute path to project-relative path
 * Strips the workspace root and normalizes slashes
 */
export const getRelativePath = (absolutePath: string): string => {
  // Common workspace markers to strip
  const markers = [
    'Zach.ai\\frontend\\',
    'Zach.ai/frontend/',
    'Zach.ai\\backend\\',
    'Zach.ai/backend/',
    'frontend\\src\\',
    'frontend/src/',
    'backend\\src\\',
    'backend/src/',
  ];

  let path = absolutePath;

  // Try to find and strip the workspace marker
  for (const marker of markers) {
    const index = path.indexOf(marker);
    if (index !== -1) {
      path = path.substring(index + marker.length);
      break;
    }
  }

  // If no marker found, try to extract everything after the last occurrence of 'src'
  if (path === absolutePath) {
    const srcIndex = path.lastIndexOf('src\\');
    const srcIndexForward = path.lastIndexOf('src/');
    const lastSrcIndex = Math.max(srcIndex, srcIndexForward);
    
    if (lastSrcIndex !== -1) {
      path = path.substring(lastSrcIndex);
    }
  }

  // Normalize to forward slashes
  return path.replace(/\\/g, '/');
};

/**
 * Extract just the filename from a path (with extension)
 */
export const getFileName = (path: string): string => {
  // Handle both forward and backward slashes
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || path;
};
