import { formatEther } from 'ethers';

/**
 * Utility functions for formatting blockchain values using ethers.js
 */

/**
 * Converts a wei value (18 decimals) to ether string using ethers.js
 * @param value - String representation of wei value (e.g., "1000000000000000000")
 * @returns String representation of ether value (e.g., "1.0")
 */
export function formatFromWei(value: string): string {
  if (!value || value === '0') return '0';

  try {
    return formatEther(value);
  } catch (error) {
    console.error('Error formatting wei value:', error);
    return '0';
  }
}

/**
 * Formats a wei value to display with specified decimal places
 * @param value - String representation of wei value
 * @param decimals - Number of decimal places to show (default: 0 for integer)
 * @returns Formatted string
 */
export function formatTokenAmount(value: string, maxDecimals: number = 18): string {
  const formatted = formatFromWei(value);
  const num = parseFloat(formatted);

  if (Number.isNaN(num)) return "0";
  return num.toFixed(maxDecimals).replace(/\.?0+$/, '');
}