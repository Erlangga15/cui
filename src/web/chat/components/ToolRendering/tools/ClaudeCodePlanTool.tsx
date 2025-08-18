import React from 'react';

interface ClaudeCodePlanToolProps {
  input: any;
  result: string;
}

interface ParsedSection {
  title: string;
  content: string;
  level: number;
}

export function ClaudeCodePlanTool({ input, result }: ClaudeCodePlanToolProps) {
  const planContent = input.plan || result || 'No plan provided';

  // Parse markdown sections for syntax highlighting
  const parseMarkdownSections = (content: string): ParsedSection[] => {
    const sections: ParsedSection[] = [];
    const lines = content.split('\n');
    let currentSection: ParsedSection | null = null;

    for (const line of lines) {
      if (line.startsWith('#')) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        const level = line.match(/^#+/)?.[0].length || 1;
        const title = line.replace(/^#+\s*/, '').trim();
        currentSection = {
          title,
          content: '',
          level
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      } else {
        // Content before first header
        if (!currentSection) {
          currentSection = {
            title: '',
            content: line + '\n',
            level: 0
          };
        } else {
          currentSection.content += line + '\n';
        }
      }
    }

    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  // Get section color based on title
  const getSectionColor = (title: string): string => {
    const titleUpper = title.toUpperCase();
    
    if (titleUpper.includes('OBJECTIVE') || titleUpper.includes('🎯')) {
      return 'text-red-400';
    }
    if (titleUpper.includes('PROBLEM') || titleUpper.includes('ANALYSIS') || titleUpper.includes('🔍')) {
      return 'text-blue-400';
    }
    if (titleUpper.includes('TECHNICAL') || titleUpper.includes('IMPLEMENTATION') || titleUpper.includes('🛠️')) {
      return 'text-yellow-400';
    }
    if (titleUpper.includes('TESTING') || titleUpper.includes('TEST') || titleUpper.includes('🧪')) {
      return 'text-green-400';
    }
    if (titleUpper.includes('SUCCESS') || titleUpper.includes('CONCLUSION') || titleUpper.includes('✅') || titleUpper.includes('🎉')) {
      return 'text-green-300';
    }
    if (titleUpper.includes('RISK') || titleUpper.includes('WARNING') || titleUpper.includes('⚠️')) {
      return 'text-orange-400';
    }
    if (titleUpper.includes('ROLLBACK') || titleUpper.includes('🔄')) {
      return 'text-purple-400';
    }
    
    return 'text-white';
  };

  // Format content for terminal display with intelligent wrapping
  const formatTerminalContent = (content: string): JSX.Element[] => {
    const lines = content.trim().split('\n');
    return lines.map((line, index) => {
      let className = 'block break-words';
      let displayLine = line;
      
      // Handle section headers that weren't caught as main titles
      if (line.trim().match(/^###?\s+/) && !line.includes('#')) {
        className += ' text-cyan-400 font-semibold';
      }
      // Handle bullet points with different indentations
      else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const indentLevel = Math.floor(line.search(/\S/) / 2); // Calculate indent level
        const indentClass = indentLevel > 0 ? `pl-${Math.min(indentLevel * 4, 12)}` : '';
        className += ` text-gray-300 ${indentClass}`;
        
        // Color specific bullet content
        if (line.includes('✅')) {
          className += ' text-green-400';
        } else if (line.includes('❌') || line.includes('⚠️')) {
          className += ' text-red-400';
        }
      }
      // Handle numbered lists
      else if (line.trim().match(/^\d+\./)) {
        className += ' text-gray-300 pl-4';
      }
      // Handle code blocks
      else if (line.trim().startsWith('```')) {
        className += ' text-gray-600 text-xs';
        return null; // Skip code block markers
      }
      // Handle inline code and technical terms
      else if (line.includes('`')) {
        className += ' text-yellow-300';
        // Highlight code within backticks - allow wrapping
        displayLine = line.replace(/`([^`]+)`/g, '<span class="bg-gray-800 px-1 rounded text-yellow-400 break-all">$1</span>');
      }
      // Handle file paths and technical terms - allow breaking at slashes
      else if (line.includes('.tsx') || line.includes('.ts') || line.includes('.js') || line.includes('src/')) {
        className += ' text-cyan-300 break-all';
      }
      // Handle Location: and Line: prefixes (from plan)
      else if (line.trim().startsWith('Location:') || line.trim().startsWith('Line:')) {
        className += ' text-blue-300 break-all';
      }
      // Handle case statements and code - preserve formatting but allow wrapping
      else if (line.trim().startsWith('case ') || line.includes('return (')) {
        className += ' text-green-300 font-mono break-all';
      }
      // Handle empty lines
      else if (line.trim() === '') {
        return <br key={index} />;
      }
      // Handle impact/assessment lines
      else if (line.includes('User Experience:') || line.includes('Functionality:') || line.includes('Scope:')) {
        className += ' text-orange-300';
      }
      // Handle URLs - allow breaking at appropriate points
      else if (line.includes('http') || line.includes('www.')) {
        className += ' text-blue-400 break-all';
      }
      // Regular content
      else {
        className += ' text-gray-100';
      }

      return (
        <span 
          key={index} 
          className={className}
          dangerouslySetInnerHTML={{ __html: displayLine }}
        />
      );
    }).filter(Boolean); // Remove null entries
  };

  const parsedSections = parseMarkdownSections(planContent);

  return (
    <div className="flex flex-col gap-1 -mt-0.5">
      {/* Terminal Container with responsive design */}
      <div className="bg-black rounded-lg border border-gray-700 font-mono text-sm md:text-base overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-gray-900 px-3 md:px-4 py-2 border-b border-gray-700">
          <div className="text-green-400 text-xs md:text-sm mb-1 font-semibold">Ready to code?</div>
          <div className="text-gray-300 text-sm md:text-base font-medium">Here is Claude's plan:</div>
        </div>

        {/* Terminal Content */}
        <div className="p-3 md:p-4 lg:p-6 max-h-[70vh] md:max-h-[80vh] overflow-y-auto">
          <div className="w-full whitespace-pre-wrap break-words">
            {parsedSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-3 md:mb-4">
                {section.title && (
                  <div className={`font-bold mb-2 text-sm md:text-base lg:text-lg ${getSectionColor(section.title)} break-words`}>
                    {section.title}
                  </div>
                )}
                <div className="ml-0 text-xs md:text-sm lg:text-base leading-relaxed whitespace-pre-wrap break-words">
                  {formatTerminalContent(section.content)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}