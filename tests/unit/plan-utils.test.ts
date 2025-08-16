import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  extractPlanContent,
  formatObjectAsMarkdown,
  validatePlanData,
  formatPlanForDisplay,
  PlanData
} from '@/web/chat/utils/plan-utils';

describe('Plan Utils', () => {
  describe('extractPlanContent', () => {
    it('should return string input directly', () => {
      const input = 'This is a simple plan';
      const result = extractPlanContent(input);
      expect(result).toBe('This is a simple plan');
    });

    it('should trim whitespace from string input', () => {
      const input = '   This is a plan with whitespace   ';
      const result = extractPlanContent(input);
      expect(result).toBe('This is a plan with whitespace');
    });

    it('should return fallback for empty string', () => {
      const input = '';
      const fallback = 'Default plan';
      const result = extractPlanContent(input, fallback);
      expect(result).toBe('Default plan');
    });

    it('should extract plan from object with plan property', () => {
      const input = { plan: 'Plan from object property' };
      const result = extractPlanContent(input);
      expect(result).toBe('Plan from object property');
    });

    it('should extract content from object with content property', () => {
      const input = { content: 'Content from object property' };
      const result = extractPlanContent(input);
      expect(result).toBe('Content from object property');
    });

    it('should extract text from object with text property', () => {
      const input = { text: 'Text from object property' };
      const result = extractPlanContent(input);
      expect(result).toBe('Text from object property');
    });

    it('should extract message from object with message property', () => {
      const input = { message: 'Message from object property' };
      const result = extractPlanContent(input);
      expect(result).toBe('Message from object property');
    });

    it('should handle nested plan object', () => {
      const input = { 
        plan: { 
          plan: 'Nested plan content',
          metadata: { version: '1.0' }
        } 
      };
      const result = extractPlanContent(input);
      expect(result).toBe('Nested plan content');
    });

    it('should prioritize plan property over other properties', () => {
      const input = {
        plan: 'Plan content',
        content: 'Content text',
        text: 'Text content',
        message: 'Message content'
      };
      const result = extractPlanContent(input);
      expect(result).toBe('Plan content');
    });

    it('should return fallback for null input', () => {
      const result = extractPlanContent(null, 'fallback');
      expect(result).toBe('fallback');
    });

    it('should return fallback for undefined input', () => {
      const result = extractPlanContent(undefined, 'fallback');
      expect(result).toBe('fallback');
    });

    it('should return default message when no fallback provided', () => {
      const result = extractPlanContent(null);
      expect(result).toBe('No plan provided');
    });

    it('should format complex object when no direct content found', () => {
      const input = { 
        title: 'Test Plan',
        description: 'A test plan description',
        priority: 'high'
      };
      const result = extractPlanContent(input);
      expect(result).toContain('Test Plan');
      expect(result).toContain('A test plan description');
    });
  });

  describe('formatObjectAsMarkdown', () => {
    it('should handle simple string values', () => {
      const result = formatObjectAsMarkdown('simple string');
      expect(result).toBe('simple string');
    });

    it('should handle null/undefined values', () => {
      expect(formatObjectAsMarkdown(null)).toBe('No content available');
      expect(formatObjectAsMarkdown(undefined)).toBe('No content available');
    });

    it('should format simple object with key-value pairs', () => {
      const input = {
        name: 'Test Plan',
        description: 'A simple test plan'
      };
      const result = formatObjectAsMarkdown(input);
      expect(result).toContain('**Name**: Test Plan');
      expect(result).toContain('**Description**: A simple test plan');
    });

    it('should format camelCase keys to human-readable format', () => {
      const input = {
        projectName: 'My Project',
        taskCount: 5,
        isCompleted: false
      };
      const result = formatObjectAsMarkdown(input);
      expect(result).toContain('**Project Name**: My Project');
      expect(result).toContain('**Task Count**: 5');
      expect(result).toContain('**Is Completed**: false');
    });

    it('should format snake_case keys to human-readable format', () => {
      const input = {
        project_name: 'My Project',
        task_count: 5,
        is_completed: false
      };
      const result = formatObjectAsMarkdown(input);
      expect(result).toContain('**Project Name**: My Project');
      expect(result).toContain('**Task Count**: 5');
      expect(result).toContain('**Is Completed**: false');
    });

    it('should handle arrays as numbered lists', () => {
      const input = ['First item', 'Second item', 'Third item'];
      const result = formatObjectAsMarkdown(input);
      expect(result).toContain('1. First item');
      expect(result).toContain('2. Second item');
      expect(result).toContain('3. Third item');
    });

    it('should handle empty arrays', () => {
      const result = formatObjectAsMarkdown([]);
      expect(result).toBe('Empty list');
    });

    it('should handle objects with steps array', () => {
      const input = {
        title: 'Implementation Plan',
        steps: [
          'Analyze requirements',
          'Design solution',
          'Implement features'
        ]
      };
      const result = formatObjectAsMarkdown(input);
      expect(result).toContain('## Implementation Plan');
      expect(result).toContain('1. Analyze requirements');
      expect(result).toContain('2. Design solution');
      expect(result).toContain('3. Implement features');
    });

    it('should handle objects with complex step objects', () => {
      const input = {
        title: 'Complex Plan',
        steps: [
          { description: 'First step' },
          { description: 'Second step' },
          'Simple step string'
        ]
      };
      const result = formatObjectAsMarkdown(input);
      expect(result).toContain('## Complex Plan');
      expect(result).toContain('1. First step');
      expect(result).toContain('2. Second step');
      expect(result).toContain('3. Simple step string');
    });

    it('should format all object properties as markdown', () => {
      const input = {
        plan: 'Direct plan content',
        otherData: 'Should be included'
      };
      const result = formatObjectAsMarkdown(input);
      expect(result).toContain('**Plan**: Direct plan content');
      expect(result).toContain('**Other Data**: Should be included');
    });

    it('should handle nested objects', () => {
      const input = {
        project: {
          name: 'Test Project',
          version: '1.0.0'
        },
        description: 'Main description'
      };
      const result = formatObjectAsMarkdown(input);
      expect(result).toContain('**Project**:');
      expect(result).toContain('**Name**: Test Project');
      expect(result).toContain('**Description**: Main description');
    });

    it('should fallback to JSON.stringify for problematic objects', () => {
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj; // Create circular reference
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = formatObjectAsMarkdown(circularObj);
      
      expect(consoleSpy).toHaveBeenCalledWith('Error formatting object as markdown:', expect.any(Error));
      expect(typeof result).toBe('string');
      consoleSpy.mockRestore();
    });
  });

  describe('validatePlanData', () => {
    it('should return false for null/undefined', () => {
      expect(validatePlanData(null)).toBe(false);
      expect(validatePlanData(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validatePlanData('')).toBe(false);
      expect(validatePlanData('   ')).toBe(false);
    });

    it('should return true for non-empty string', () => {
      expect(validatePlanData('Valid plan content')).toBe(true);
      expect(validatePlanData('  Valid plan with spaces  ')).toBe(true);
    });

    it('should return true for object with valid plan property', () => {
      expect(validatePlanData({ plan: 'Valid plan' })).toBe(true);
    });

    it('should return true for object with valid content property', () => {
      expect(validatePlanData({ content: 'Valid content' })).toBe(true);
    });

    it('should return true for object with valid text property', () => {
      expect(validatePlanData({ text: 'Valid text' })).toBe(true);
    });

    it('should return true for object with valid message property', () => {
      expect(validatePlanData({ message: 'Valid message' })).toBe(true);
    });

    it('should return true for object with steps array', () => {
      expect(validatePlanData({ steps: ['step1', 'step2'] })).toBe(true);
      expect(validatePlanData({ steps: [] })).toBe(true); // Even empty array is considered valid structure
    });

    it('should return false for object without valid content', () => {
      expect(validatePlanData({ randomProperty: 'value' })).toBe(false);
      expect(validatePlanData({ plan: null })).toBe(false);
      expect(validatePlanData({ content: '' })).toBe(false);
    });

    it('should return false for invalid types', () => {
      expect(validatePlanData(123)).toBe(false);
      expect(validatePlanData(true)).toBe(false);
      expect(validatePlanData([])).toBe(false);
    });
  });

  describe('formatPlanForDisplay', () => {
    it('should format valid plan content', () => {
      const input = { plan: 'Test plan content' };
      const result = formatPlanForDisplay(input);
      expect(result).toBe('Test plan content');
    });

    it('should use fallback result when input is invalid', () => {
      const input = null;
      const fallback = 'Fallback content';
      const result = formatPlanForDisplay(input, fallback);
      expect(result).toBe('Fallback content');
    });

    it('should clean up excessive whitespace', () => {
      const input = { plan: '   Content with lots   \n\n\n\n   of whitespace   \n\n' };
      const result = formatPlanForDisplay(input);
      expect(result).toBe('Content with lots   \n\n   of whitespace');
    });

    it('should handle processing errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create an object that will cause processing to fail
      const problematicInput = {
        get plan() {
          throw new Error('Access error');
        }
      };
      
      const result = formatPlanForDisplay(problematicInput, 'fallback');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error formatting plan for display:', expect.any(Error));
      expect(result).toBe('fallback');
      
      consoleSpy.mockRestore();
    });

    it('should return default message when no content and no fallback', () => {
      const result = formatPlanForDisplay(null);
      expect(result).toBe('No plan provided');
    });

    it('should return error message when processing fails and no fallback', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const problematicInput = {
        get plan() {
          throw new Error('Access error');
        }
      };
      
      const result = formatPlanForDisplay(problematicInput);
      
      expect(result).toBe('Error processing plan content');
      consoleSpy.mockRestore();
    });

    it('should handle complex plan objects', () => {
      const input = {
        plan: {
          title: 'Complex Plan',
          steps: ['Step 1', 'Step 2']
        }
      };
      const result = formatPlanForDisplay(input);
      expect(result).toContain('Complex Plan');
      expect(result).toContain('Step 1');
      expect(result).toContain('Step 2');
    });
  });

  describe('edge cases and integration', () => {
    it('should handle deeply nested plan objects', () => {
      const input = {
        plan: {
          plan: {
            content: 'Deeply nested content'
          }
        }
      };
      const result = extractPlanContent(input);
      expect(result).toBe('Deeply nested content');
    });

    it('should handle mixed content types in single object', () => {
      const input = {
        plan: 'Main plan',
        content: 'Additional content',
        steps: ['Step 1', 'Step 2']
      };
      const result = extractPlanContent(input);
      expect(result).toBe('Main plan'); // Should prioritize plan property
    });

    it('should handle objects with non-string plan properties', () => {
      const input = {
        plan: 123,
        content: 'Valid content'
      };
      const result = extractPlanContent(input);
      expect(result).toBe('Valid content'); // Should fall through to content
    });

    it('should handle very large content appropriately', () => {
      const largeContent = 'a'.repeat(10000);
      const input = { plan: largeContent };
      const result = formatPlanForDisplay(input);
      expect(result).toBe(largeContent);
      expect(result.length).toBe(10000);
    });

    it('should handle unicode and special characters', () => {
      const input = { plan: 'Plan with unicode: 🚀 and special chars: <>&"' };
      const result = extractPlanContent(input);
      expect(result).toBe('Plan with unicode: 🚀 and special chars: <>&"');
    });
  });
});