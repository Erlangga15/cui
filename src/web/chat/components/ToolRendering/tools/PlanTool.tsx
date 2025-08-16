import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatPlanForDisplay, validatePlanData } from '../../../utils/plan-utils';

interface PlanToolProps {
  input: any;
  result: string;
}

export function PlanTool({ input, result }: PlanToolProps) {
  // Process plan content using enhanced utilities to handle various data formats
  const planContent = formatPlanForDisplay(input, result);
  
  // Validate the processed content
  const isValidContent = validatePlanData(input) || (result && result.trim().length > 0);
  
  // Add debug logging in development mode
  if (process.env.NODE_ENV === 'development') {
    console.debug('PlanTool - Input:', input);
    console.debug('PlanTool - Result:', result);
    console.debug('PlanTool - Processed content:', planContent);
    console.debug('PlanTool - Is valid:', isValidContent);
  }

  // Handle error state for invalid content
  if (!isValidContent && !planContent) {
    return (
      <div className="flex flex-col gap-1 -mt-0.5">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mt-1 text-destructive">
          <p className="text-sm">Unable to process plan content. The data format may be invalid.</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs">Debug Info</summary>
              <pre className="text-xs mt-1 overflow-auto">
                {JSON.stringify({ input, result }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 -mt-0.5">
      <div className="bg-secondary rounded-xl p-4 mt-1 border-l-3 border-accent prose prose-sm prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="my-2 pl-6 first:mt-0 last:mb-0">{children}</ul>,
            ol: ({ children }) => <ol className="my-2 pl-6 first:mt-0 last:mb-0">{children}</ol>,
            li: ({ children }) => <li className="my-1">{children}</li>,
            h1: ({ children }) => <h1 className="mt-4 mb-2 first:mt-0 font-semibold">{children}</h1>,
            h2: ({ children }) => <h2 className="mt-4 mb-2 first:mt-0 font-semibold">{children}</h2>,
            h3: ({ children }) => <h3 className="mt-4 mb-2 first:mt-0 font-semibold">{children}</h3>,
            h4: ({ children }) => <h4 className="mt-4 mb-2 first:mt-0 font-semibold">{children}</h4>,
            h5: ({ children }) => <h5 className="mt-4 mb-2 first:mt-0 font-semibold">{children}</h5>,
            h6: ({ children }) => <h6 className="mt-4 mb-2 first:mt-0 font-semibold">{children}</h6>,
          }}
        >
          {planContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}