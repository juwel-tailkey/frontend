import React from 'react';

interface Goal {
  goal_id: string;
  goal_name: string;
  goal_event_name: string;
  is_active: boolean;
}

interface GoalSelectorProps {
  goals: Goal[];
  selectedGoalId: string | null;
  onGoalChange: (goalId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
}

/**
 * Goal selector component for multi-goal support.
 * Allows switching between different conversion goals.
 */
export const GoalSelector: React.FC<GoalSelectorProps> = ({
  goals,
  selectedGoalId,
  onGoalChange,
  isLoading = false,
  disabled = false,
  label = 'Select Goal',
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const activeGoals = goals.filter(g => g.is_active);

  if (activeGoals.length === 0) {
    return (
      <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
        No active goals configured
      </div>
    );
  }

  if (activeGoals.length === 1 && !selectedGoalId) {
    // Auto-select if only one goal
    const singleGoal = activeGoals[0];
    onGoalChange(singleGoal.goal_id);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">{label}:</label>
      <select
        value={selectedGoalId || ''}
        onChange={(e) => onGoalChange(e.target.value)}
        disabled={disabled}
        className="block w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="">Select a goal...</option>
        {activeGoals.map(goal => (
          <option key={goal.goal_id} value={goal.goal_id}>
            {goal.goal_name} ({goal.goal_event_name})
          </option>
        ))}
      </select>
    </div>
  );
};

export default GoalSelector;
