export const PRIORITIES = [
  { value: 'high',   label: '🔴 High Priority' },
  { value: 'medium', label: '🟡 Medium Priority' },
  { value: 'low',    label: '🟢 Low Priority' },
];

export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export const priorityText = (value) =>
  ({ high: 'High', medium: 'Medium', low: 'Low' })[value] ?? 'Medium';
