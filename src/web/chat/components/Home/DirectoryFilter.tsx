import React from 'react';
import { FolderIcon, FolderOpenIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/web/chat/components/ui/select';
import type { DirectoryOption } from '../../utils/directory-utils';
import { getDirectoryDisplayName } from '../../utils/directory-utils';

interface DirectoryFilterProps {
  directories: DirectoryOption[];
  selectedDirectory: string;
  onDirectoryChange: (directory: string) => void;
  totalCount: number;
  activeTab: 'tasks' | 'history' | 'archive';
  isLoading?: boolean;
}

export function DirectoryFilter({
  directories,
  selectedDirectory,
  onDirectoryChange,
  totalCount,
  activeTab,
  isLoading = false
}: DirectoryFilterProps) {
  // Calculate display name for selected value
  const getDisplayName = (value: string) => {
    if (value === 'all') {
      return `All Directories (${totalCount})`;
    }
    
    const directory = directories.find(dir => dir.path === value);
    if (directory) {
      return `${directory.shortname} (${directory.count})`;
    }
    
    return 'Select Directory';
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <Select value={selectedDirectory} onValueChange={onDirectoryChange} disabled={isLoading}>
        <SelectTrigger className="w-72 min-w-64 max-w-80">
          <FolderIcon size={16} className="text-muted-foreground flex-shrink-0" />
          <SelectValue placeholder="Select Directory" className="truncate flex-1 min-w-0 text-left">
            <span className="truncate block" title={getDisplayName(selectedDirectory)}>
              {getDisplayName(selectedDirectory)}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpenIcon size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="truncate">All Directories ({totalCount})</span>
            </div>
          </SelectItem>
          
          {directories.length > 0 && (
            <>
              {/* Separator */}
              <div className="border-t border-border my-1" />
              
              {directories.map((directory) => (
                <SelectItem key={directory.path} value={directory.path}>
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderIcon size={16} className="text-muted-foreground flex-shrink-0" />
                    <span className="truncate flex-1" title={directory.shortname}>
                      {directory.shortname}
                    </span>
                    <span className="text-muted-foreground text-xs flex-shrink-0">
                      ({directory.count})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}