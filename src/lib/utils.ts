import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
/**
 *
 * @param inputs
 * @returns
 * https://www.youtube.com/shorts/1Hgc6EU9PSg
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
