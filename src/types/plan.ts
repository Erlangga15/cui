/**
 * Type definitions for plan mode functionality
 * These types ensure type safety for plan data processing
 */

/**
 * Supported plan content formats
 */
export type PlanFormat = 'markdown' | 'text' | 'json' | 'structured';

/**
 * Metadata associated with plan content
 */
export interface PlanMetadata {
  version?: string;
  timestamp?: string;
  source?: 'claude' | 'user' | 'system';
  contentType?: string;
  processingVersion?: string;
}

/**
 * Structured plan data interface
 * Represents the various ways plan data can be structured
 */
export interface PlanData {
  /** Main plan content as a string */
  plan?: string;
  /** Alternative content field */
  content?: string;
  /** Text representation */
  text?: string;
  /** Message content (common in Claude responses) */
  message?: string;
  /** Description field */
  description?: string;
  /** Content format indicator */
  format?: PlanFormat;
  /** Associated metadata */
  metadata?: PlanMetadata;
  /** Structured steps or tasks */
  steps?: PlanStep[];
  /** Plan title */
  title?: string;
  /** Plan name */
  name?: string;
}

/**
 * Individual step within a structured plan
 */
export interface PlanStep {
  /** Step description */
  description: string;
  /** Step title or name */
  title?: string;
  /** Step number/order */
  order?: number;
  /** Step status */
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
  /** Estimated duration */
  estimatedDuration?: string;
  /** Step priority */
  priority?: 'low' | 'medium' | 'high' | 'critical';
  /** Sub-steps */
  subSteps?: string[];
  /** Associated metadata */
  metadata?: Record<string, any>;
}

/**
 * Props for PlanTool component
 */
export interface PlanToolProps {
  /** Input data that may contain plan information */
  input: PlanToolInput;
  /** Fallback result string */
  result: string;
  /** Working directory context */
  workingDirectory?: string;
  /** Additional tool context */
  toolContext?: Record<string, any>;
}

/**
 * Input data structure for PlanTool
 * Covers various possible input formats
 */
export interface PlanToolInput {
  /** Direct plan content */
  plan?: string | PlanData | any;
  /** Alternative input fields */
  content?: string;
  text?: string;
  message?: string;
  /** Tool-specific data */
  toolData?: Record<string, any>;
  /** Raw input for fallback processing */
  [key: string]: any;
}

/**
 * Result of plan content processing
 */
export interface PlanProcessingResult {
  /** Processed content ready for display */
  content: string;
  /** Whether the content is valid */
  isValid: boolean;
  /** Original format detected */
  originalFormat: PlanFormat;
  /** Processing metadata */
  metadata: {
    processingTime: number;
    inputType: string;
    hasErrors: boolean;
    errorMessage?: string;
  };
}

/**
 * Configuration for plan processing
 */
export interface PlanProcessingConfig {
  /** Maximum content length to process */
  maxContentLength?: number;
  /** Whether to include debug information */
  includeDebugInfo?: boolean;
  /** Fallback content for invalid data */
  fallbackContent?: string;
  /** Content sanitization options */
  sanitize?: {
    removeHtml?: boolean;
    trimWhitespace?: boolean;
    normalizeNewlines?: boolean;
  };
}

/**
 * Error types that can occur during plan processing
 */
export interface PlanProcessingError {
  /** Error code */
  code: 'INVALID_INPUT' | 'PROCESSING_FAILED' | 'FORMAT_UNSUPPORTED' | 'CONTENT_TOO_LARGE';
  /** Human-readable error message */
  message: string;
  /** Original input that caused the error */
  originalInput?: any;
  /** Additional error details */
  details?: Record<string, any>;
}

/**
 * Type guard to check if input is PlanData
 */
export function isPlanData(input: any): input is PlanData {
  return (
    input &&
    typeof input === 'object' &&
    (typeof input.plan === 'string' ||
     typeof input.content === 'string' ||
     typeof input.text === 'string' ||
     typeof input.message === 'string' ||
     Array.isArray(input.steps))
  );
}

/**
 * Type guard to check if input is PlanStep
 */
export function isPlanStep(input: any): input is PlanStep {
  return (
    input &&
    typeof input === 'object' &&
    typeof input.description === 'string'
  );
}

/**
 * Utility type for extracting plan content from various sources
 */
export type PlanContentSource = string | PlanData | PlanStep[] | Record<string, any>;

/**
 * Exit plan mode tool specific types
 */
export interface ExitPlanModeInput {
  plan: string | PlanData;
  metadata?: PlanMetadata;
  context?: Record<string, any>;
}

/**
 * Exit plan mode tool result
 */
export interface ExitPlanModeResult {
  success: boolean;
  content: string;
  format: PlanFormat;
  processingTime: number;
  error?: PlanProcessingError;
}