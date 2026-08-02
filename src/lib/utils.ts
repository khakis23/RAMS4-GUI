import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes, resolving conflicts optimally.
 * This is widely used across shadcn/ui components.
 * 
 * @param inputs - Array of class values or conditional class objects.
 * @returns A merged string of Tailwind utility classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
