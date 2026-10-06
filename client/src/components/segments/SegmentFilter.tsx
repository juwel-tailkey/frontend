import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SegmentOption {
  value: string;
  label: string;
  count?: number;
}

interface SegmentFamily {
  name: string;
  label: string;
  description: string;
  segments: SegmentOption[];
}

interface SegmentFilterProps {
  generalSegments: SegmentOption[];
  attributionSegments: SegmentOption[];
  selectedSegments: string[];
  onSegmentToggle: (segmentValue: string) => void;
  onClearAll: () => void;
  isLoading?: boolean;
}

/**
 * Unified segment filter component.
 * Separates General Segments (always available) from Attribution Segments (goal-specific).
 */
export const SegmentFilter: React.FC<SegmentFilterProps> = ({
  generalSegments,
  attributionSegments,
  selectedSegments,
  onSegmentToggle,
  onClearAll,
  isLoading = false,
}) => {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set(['general', 'attribution']));

  const toggleFamily = (family: string) => {
    setExpandedFamilies(prev => {
      const next = new Set(prev);
      if (next.has(family)) {
        next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  };

  const families: SegmentFamily[] = [
    {
      name: 'general',
      label: 'General Segments',
      description: 'Based on raw event data (acquisition, technology, behavior)',
      segments: generalSegments,
    },
    {
      name: 'attribution',
      label: 'Attribution Segments',
      description: 'Based on attribution engine (assembly scores, journey strength)',
      segments: attributionSegments,
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedCount = selectedSegments.length;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Segment Filter</h3>
            <p className="text-xs text-gray-500 mt-1">
              Filter data by user segments
            </p>
          </div>
          {selectedCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all ({selectedCount})
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {families.map(family => (
          <div key={family.name} className="border-b border-gray-100 last:border-0">
            <button
              onClick={() => toggleFamily(family.name)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{family.label}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {family.segments.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{family.description}</p>
              </div>
              {expandedFamilies.has(family.name) ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedFamilies.has(family.name) && (
              <div className="px-4 pb-3">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {family.segments.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">
                      No segments available
                    </p>
                  ) : (
                    family.segments.map(segment => (
                      <label
                        key={segment.value}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSegments.includes(segment.value)}
                          onChange={() => onSegmentToggle(segment.value)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">
                          {segment.label}
                        </span>
                        {segment.count !== undefined && (
                          <span className="text-xs text-gray-400">
                            {segment.count.toLocaleString()}
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCount > 0 && (
        <div className="p-3 bg-blue-50 border-t border-blue-100">
          <p className="text-xs text-blue-700">
            <span className="font-medium">{selectedCount}</span> segment{selectedCount !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};

export default SegmentFilter;
