/**
 * Utilities for processing plan data in various formats
 * Handles conversion of JSON objects to human-readable content
 */

interface PlanData {
  plan?: string;
  content?: string;
  text?: string;
  format?: 'markdown' | 'text' | 'json';
  metadata?: {
    version?: string;
    timestamp?: string;
  };
}

/**
 * Extracts plan content from various input formats
 * @param input - The input data that could be string, object, or complex structure
 * @param fallbackResult - Fallback result if input is not processable
 * @returns Human-readable plan content
 */
export function extractPlanContent(input: any, fallbackResult?: string): string {
  // Handle null/undefined input
  if (!input) {
    return fallbackResult || 'No plan provided';
  }

  // Handle string input directly
  if (typeof input === 'string') {
    return input.trim() || fallbackResult || 'No plan provided';
  }

  // Handle object input
  if (typeof input === 'object') {
    // Check for nested plan property
    if (input.plan) {
      if (typeof input.plan === 'string') {
        return input.plan.trim();
      }
      if (typeof input.plan === 'object') {
        return extractPlanContent(input.plan, fallbackResult);
      }
    }

    // Check for content property
    if (input.content && typeof input.content === 'string') {
      return input.content.trim();
    }

    // Check for text property
    if (input.text && typeof input.text === 'string') {
      return input.text.trim();
    }

    // Check for message property (common in Claude responses)
    if (input.message && typeof input.message === 'string') {
      return input.message.trim();
    }

    // Try to format object as readable content
    return formatObjectAsMarkdown(input);
  }

  // Fallback for other types
  return fallbackResult || 'No plan provided';
}

/**
 * Converts a JSON object to markdown format for better readability
 * @param obj - The object to convert
 * @returns Markdown formatted string
 */
export function formatObjectAsMarkdown(obj: any): string {
  if (!obj || typeof obj !== 'object') {
    return String(obj || 'No content available');
  }

  try {
    // Handle arrays
    if (Array.isArray(obj)) {
      if (obj.length === 0) return 'Empty list';
      
      return obj.map((item, index) => {
        if (typeof item === 'string') {
          return `${index + 1}. ${item}`;
        }
        return `${index + 1}. ${formatObjectAsMarkdown(item)}`;
      }).join('\n');
    }

    // Note: formatObjectAsMarkdown should not do plan extraction
    // Plan extraction is handled by extractPlanContent function

    // Handle objects with steps/tasks
    if (obj.steps && Array.isArray(obj.steps)) {
      const stepsText = obj.steps.map((step: any, index: number) => {
        if (typeof step === 'string') {
          return `${index + 1}. ${step}`;
        }
        if (typeof step === 'object' && step.description) {
          return `${index + 1}. ${step.description}`;
        }
        return `${index + 1}. ${JSON.stringify(step)}`;
      }).join('\n');
      
      const title = obj.title || obj.name || 'Plan';
      return `## ${title}\n\n${stepsText}`;
    }

    // Handle generic object formatting
    const entries = Object.entries(obj)
      .filter(([key, value]) => value != null)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `**${formatKey(key)}**: ${value}`;
        }
        if (typeof value === 'object') {
          return `**${formatKey(key)}**:\n${formatObjectAsMarkdown(value)}`;
        }
        return `**${formatKey(key)}**: ${String(value)}`;
      });

    return entries.length > 0 ? entries.join('\n\n') : 'No readable content available';

  } catch (error) {
    console.warn('Error formatting object as markdown:', error);
    // Avoid JSON.stringify for circular objects
    if (error instanceof Error && error.message.includes('circular')) {
      return 'Complex object with circular references';
    }
    try {
      return JSON.stringify(obj, null, 2);
    } catch (jsonError) {
      return 'Unable to process object structure';
    }
  }
}

/**
 * Formats a camelCase or snake_case key to human-readable format
 * @param key - The key to format
 * @returns Human-readable key
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, char => char.toUpperCase()) // Capitalize first letter of each word
    .trim();
}

/**
 * Validates if the input contains valid plan data
 * @param input - The input to validate
 * @returns boolean indicating if input is valid
 */
export function validatePlanData(input: any): boolean {
  if (!input) return false;
  
  if (typeof input === 'string') {
    return input.trim().length > 0;
  }
  
  if (typeof input === 'object') {
    // Arrays are objects in JS, but not valid plan data unless they have content
    if (Array.isArray(input)) {
      return false;
    }
    
    // Check for common plan properties
    const hasValidContent = 
      (input.plan && typeof input.plan === 'string' && input.plan.trim().length > 0) ||
      (input.content && typeof input.content === 'string' && input.content.trim().length > 0) ||
      (input.text && typeof input.text === 'string' && input.text.trim().length > 0) ||
      (input.message && typeof input.message === 'string' && input.message.trim().length > 0) ||
      (input.steps && Array.isArray(input.steps));
    
    return !!hasValidContent; // Ensure boolean return
  }
  
  return false;
}

/**
 * Formats plan data for display with consistent structure
 * @param input - The plan input data
 * @param result - Fallback result string
 * @returns Formatted plan content ready for display
 */
export function formatPlanForDisplay(input: any, result?: string): string {
  try {
    const content = extractPlanContent(input, result);
    
    // Ensure content is not empty
    if (!content || content.trim().length === 0) {
      return result || 'No plan provided';
    }
    
    // Clean up the content
    return content
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/^\n+|\n+$/g, ''); // Remove leading/trailing newlines
      
  } catch (error) {
    console.error('Error formatting plan for display:', error);
    return result || 'Error processing plan content';
  }
}