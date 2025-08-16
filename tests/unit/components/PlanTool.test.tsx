import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanTool } from '@/web/chat/components/ToolRendering/tools/PlanTool';

// Mock the plan utilities to test component behavior in isolation
vi.mock('@/web/chat/utils/plan-utils', () => ({
  formatPlanForDisplay: vi.fn(),
  validatePlanData: vi.fn(),
}));

// Import the mocked functions for use in tests
import { formatPlanForDisplay, validatePlanData } from '@/web/chat/utils/plan-utils';

describe('PlanTool Component', () => {
  const mockFormatPlanForDisplay = formatPlanForDisplay as any;
  const mockValidatePlanData = validatePlanData as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering with valid content', () => {
    it('should render plan content when valid data is provided', () => {
      const mockInput = { plan: 'Test plan content' };
      const mockResult = 'Fallback result';
      
      mockFormatPlanForDisplay.mockReturnValue('Formatted plan content');
      mockValidatePlanData.mockReturnValue(true);

      render(<PlanTool input={mockInput} result={mockResult} />);

      expect(mockFormatPlanForDisplay).toHaveBeenCalledWith(mockInput, mockResult);
      expect(screen.getByText('Formatted plan content')).toBeInTheDocument();
    });

    it('should render markdown formatted content', () => {
      const mockInput = { plan: '# Plan Title\n\n- Item 1\n- Item 2' };
      const mockResult = '';
      
      mockFormatPlanForDisplay.mockReturnValue('# Plan Title\n\n- Item 1\n- Item 2');
      mockValidatePlanData.mockReturnValue(true);

      render(<PlanTool input={mockInput} result={mockResult} />);

      // Check that ReactMarkdown is rendering the content
      const container = screen.getByRole('heading', { level: 1 });
      expect(container).toHaveTextContent('Plan Title');
    });

    it('should apply correct CSS classes for styling', () => {
      const mockInput = { plan: 'Test content' };
      
      mockFormatPlanForDisplay.mockReturnValue('Test content');
      mockValidatePlanData.mockReturnValue(true);

      const { container } = render(<PlanTool input={mockInput} result="" />);

      const planContainer = container.querySelector('.bg-secondary');
      expect(planContainer).toBeInTheDocument();
      expect(planContainer).toHaveClass('rounded-xl', 'p-4', 'border-l-3', 'border-accent');
      
      const proseContainer = container.querySelector('.prose');
      expect(proseContainer).toBeInTheDocument();
      expect(proseContainer).toHaveClass('prose-sm', 'prose-neutral', 'dark:prose-invert');
    });
  });

  describe('error handling', () => {
    it('should render error state for invalid content', () => {
      const mockInput = { invalidProperty: 'value' };
      const mockResult = '';
      
      mockFormatPlanForDisplay.mockReturnValue('');
      mockValidatePlanData.mockReturnValue(false);

      render(<PlanTool input={mockInput} result={mockResult} />);

      expect(screen.getByText('Unable to process plan content. The data format may be invalid.')).toBeInTheDocument();
    });

    it('should show error styling for invalid content', () => {
      const mockInput = null;
      const mockResult = '';
      
      mockFormatPlanForDisplay.mockReturnValue('');
      mockValidatePlanData.mockReturnValue(false);

      const { container } = render(<PlanTool input={mockInput} result={mockResult} />);

      const errorContainer = container.querySelector('.bg-destructive\\/10');
      expect(errorContainer).toBeInTheDocument();
      expect(errorContainer).toHaveClass('border-destructive/20', 'text-destructive');
    });

    it('should show debug info in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockInput = { invalidData: true };
      const mockResult = 'test result';
      
      mockFormatPlanForDisplay.mockReturnValue('');
      mockValidatePlanData.mockReturnValue(false);

      render(<PlanTool input={mockInput} result={mockResult} />);

      const debugToggle = screen.getByText('Debug Info');
      expect(debugToggle).toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not show debug info in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockInput = { invalidData: true };
      const mockResult = 'test result';
      
      mockFormatPlanForDisplay.mockReturnValue('');
      mockValidatePlanData.mockReturnValue(false);

      render(<PlanTool input={mockInput} result={mockResult} />);

      expect(screen.queryByText('Debug Info')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('debug logging', () => {
    it('should log debug information in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'debug');
      const mockInput = { plan: 'Test plan' };
      const mockResult = 'Test result';
      
      mockFormatPlanForDisplay.mockReturnValue('Processed content');
      mockValidatePlanData.mockReturnValue(true);

      render(<PlanTool input={mockInput} result={mockResult} />);

      expect(consoleSpy).toHaveBeenCalledWith('PlanTool - Input:', mockInput);
      expect(consoleSpy).toHaveBeenCalledWith('PlanTool - Result:', mockResult);
      expect(consoleSpy).toHaveBeenCalledWith('PlanTool - Processed content:', 'Processed content');
      expect(consoleSpy).toHaveBeenCalledWith('PlanTool - Is valid:', true);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not log debug information in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const consoleSpy = vi.spyOn(console, 'debug');
      const mockInput = { plan: 'Test plan' };
      const mockResult = 'Test result';
      
      mockFormatPlanForDisplay.mockReturnValue('Processed content');
      mockValidatePlanData.mockReturnValue(true);

      render(<PlanTool input={mockInput} result={mockResult} />);

      expect(consoleSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('prop handling', () => {
    it('should handle different input types correctly', () => {
      const testCases = [
        { input: { plan: 'String plan' }, result: 'fallback' },
        { input: { content: 'Content field' }, result: 'fallback' },
        { input: 'Direct string', result: 'fallback' },
        { input: null, result: 'fallback' },
      ];

      testCases.forEach(({ input, result }) => {
        mockFormatPlanForDisplay.mockReturnValue('Mock content');
        mockValidatePlanData.mockReturnValue(true);

        render(<PlanTool input={input} result={result} />);

        expect(mockFormatPlanForDisplay).toHaveBeenCalledWith(input, result);
      });
    });

    it('should handle empty result gracefully', () => {
      const mockInput = { plan: 'Test plan' };
      
      mockFormatPlanForDisplay.mockReturnValue('Test plan');
      mockValidatePlanData.mockReturnValue(true);

      render(<PlanTool input={mockInput} result="" />);

      expect(mockFormatPlanForDisplay).toHaveBeenCalledWith(mockInput, "");
      expect(screen.getByText('Test plan')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000);
      const mockInput = { plan: longContent };
      
      mockFormatPlanForDisplay.mockReturnValue(longContent);
      mockValidatePlanData.mockReturnValue(true);

      render(<PlanTool input={mockInput} result="" />);

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should handle special characters and unicode', () => {
      const specialContent = 'Plan with 🚀 unicode and <special> chars & "quotes"';
      const mockInput = { plan: specialContent };
      
      mockFormatPlanForDisplay.mockReturnValue(specialContent);
      mockValidatePlanData.mockReturnValue(true);

      render(<PlanTool input={mockInput} result="" />);

      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });

    it('should gracefully handle rendering errors', () => {
      const mockInput = { plan: 'Test plan' };
      
      // Mock formatPlanForDisplay to throw an error
      mockFormatPlanForDisplay.mockImplementation(() => {
        throw new Error('Processing error');
      });
      mockValidatePlanData.mockReturnValue(false);

      // This should not crash the component
      expect(() => {
        render(<PlanTool input={mockInput} result="fallback" />);
      }).not.toThrow();
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      const mockInput = { plan: '# Main Title\n\nSome content' };
      
      mockFormatPlanForDisplay.mockReturnValue('# Main Title\n\nSome content');
      mockValidatePlanData.mockReturnValue(true);

      render(<PlanTool input={mockInput} result="" />);

      // Check that headings are properly rendered
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Main Title');
    });

    it('should be keyboard accessible for debug toggle', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockInput = null;
      
      mockFormatPlanForDisplay.mockReturnValue('');
      mockValidatePlanData.mockReturnValue(false);

      render(<PlanTool input={mockInput} result="" />);

      const debugToggle = screen.getByText('Debug Info');
      expect(debugToggle.closest('details')).toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});