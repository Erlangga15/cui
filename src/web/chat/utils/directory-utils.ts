import type { ConversationSummaryWithLiveStatus } from '../types';

export interface DirectoryOption {
  path: string;
  shortname: string;
  count: number;
}

export interface RecentDirectory {
  lastDate: string;
  shortname: string;
}

export interface WorkingDirectoryData {
  path: string;
  shortname: string;
  lastDate: string;
  conversationCount: number;
  taskCount: number;
  historyCount: number;
  archiveCount: number;
}

/**
 * Calculate directory options with task counts from conversations
 */
export function calculateDirectoryOptions(
  conversations: ConversationSummaryWithLiveStatus[],
  recentDirectories: Record<string, RecentDirectory>
): DirectoryOption[] {
  // Group conversations by projectPath
  const directoryGroups = new Map<string, number>();
  
  conversations.forEach(conversation => {
    const projectPath = conversation.projectPath || 'no-project';
    directoryGroups.set(projectPath, (directoryGroups.get(projectPath) || 0) + 1);
  });
  
  // Convert to DirectoryOption array
  const options: DirectoryOption[] = [];
  
  directoryGroups.forEach((count, path) => {
    if (path === 'no-project') {
      // Handle conversations without projectPath
      options.push({
        path: 'no-project',
        shortname: 'No Project',
        count
      });
    } else {
      // Use shortname from recentDirectories, fallback to last path segment
      const shortname = recentDirectories[path]?.shortname || 
                       path.split('/').pop() || 
                       path;
      
      options.push({
        path,
        shortname,
        count
      });
    }
  });
  
  // Sort by count (descending), then by shortname (ascending)
  return options.sort((a, b) => {
    if (a.count !== b.count) {
      return b.count - a.count; // Higher count first
    }
    return a.shortname.localeCompare(b.shortname); // Alphabetical
  });
}

/**
 * Calculate directory options from working directories data (accurate counts)
 */
export function calculateDirectoryOptionsFromWorkingDirs(
  workingDirectories: WorkingDirectoryData[],
  activeTab: 'tasks' | 'history' | 'archive' = 'tasks'
): DirectoryOption[] {
  const options: DirectoryOption[] = workingDirectories.map(dir => {
    // Select appropriate count based on active tab
    let count: number;
    switch (activeTab) {
      case 'tasks':
        count = dir.taskCount;
        break;
      case 'history':
        count = dir.historyCount;
        break;
      case 'archive':
        count = dir.archiveCount;
        break;
      default:
        count = dir.conversationCount; // Fallback to total
    }

    return {
      path: dir.path,
      shortname: createTruncatedDisplayName(dir.path, dir.shortname),
      count
    };
  });
  
  // Filter out directories with 0 count for the active tab
  const filteredOptions = options.filter(option => option.count > 0);
  
  // Sort by count (descending), then by shortname (ascending)
  return filteredOptions.sort((a, b) => {
    if (a.count !== b.count) {
      return b.count - a.count; // Higher count first
    }
    return a.shortname.localeCompare(b.shortname); // Alphabetical
  });
}

/**
 * Calculate total count for a specific tab
 */
export function calculateTotalCountForTab(
  workingDirectories: WorkingDirectoryData[],
  activeTab: 'tasks' | 'history' | 'archive' = 'tasks'
): number {
  return workingDirectories.reduce((total, dir) => {
    switch (activeTab) {
      case 'tasks':
        return total + dir.taskCount;
      case 'history':
        return total + dir.historyCount;
      case 'archive':
        return total + dir.archiveCount;
      default:
        return total + dir.conversationCount;
    }
  }, 0);
}

/**
 * Create smart truncated display name for long paths
 */
export function createTruncatedDisplayName(
  path: string,
  shortname: string,
  maxLength: number = 40
): string {
  if (shortname.length <= maxLength) {
    return shortname;
  }
  
  // For very long paths, prioritize showing the end (project name) more
  const startLength = Math.floor(maxLength * 0.3); // 30% for start
  const endLength = Math.floor(maxLength * 0.6); // 60% for end
  const start = shortname.substring(0, startLength);
  const end = shortname.substring(shortname.length - endLength);
  return `${start}...${end}`;
}

/**
 * Get display name for a directory path with smart truncation
 */
export function getDirectoryDisplayName(
  path: string,
  recentDirectories: Record<string, RecentDirectory>,
  maxLength: number = 35
): string {
  if (path === 'no-project') {
    return 'No Project';
  }
  
  const shortname = recentDirectories[path]?.shortname || 
                   path.split(/[/\\]/).pop() || 
                   path;
  
  return createTruncatedDisplayName(path, shortname, maxLength);
}