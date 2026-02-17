export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="dashboard-header"]',
    title: 'Welcome to Your Dashboard',
    content:
      'This is your supervisor dashboard where you can manage fellows and review therapy sessions. Start by adding your first fellow.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="add-fellow"]',
    title: 'Add Fellows',
    content:
      'Add new fellows to your supervision. Each fellow will conduct therapy sessions that you can review and analyze.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="sessions-table"]',
    title: 'Session Reviews',
    content:
      'View all therapy sessions conducted by your fellows. Click on any session to view detailed AI analysis and validation tools.',
    placement: 'top'
  },
  {
    target: '[data-tour="add-session"]',
    title: 'Create Sessions',
    content:
      'Create new therapy sessions by uploading transcripts or entering them manually. The AI will analyze each session automatically.',
    placement: 'left'
  },
  {
    target: '[data-tour="filters"]',
    title: 'Filter & Search',
    content:
      'Filter sessions by fellow, status, or date range to find specific sessions quickly. Use the search to find sessions by group ID.',
    placement: 'bottom'
  }
];

export const SESSION_DETAIL_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="session-info"]',
    title: 'Session Overview',
    content:
      'View the session details including the fellow name, group ID, status, and transcript download link.',
    placement: 'bottom'
  },
  {
    target: '[data-tour="ai-analysis"]',
    title: 'AI Analysis Results',
    content:
      'Review the AI-generated analysis including content coverage, facilitation quality, protocol safety, and risk detection.',
    placement: 'top'
  },
  {
    target: '[data-tour="fellow-metrics"]',
    title: 'Fellow Performance',
    content:
      "View the fellow's performance metrics across all sessions using our interactive radar chart.",
    placement: 'top'
  },
  {
    target: '[data-tour="validation"]',
    title: 'Validate Analysis',
    content:
      'Review and validate the AI analysis. You can approve it as accurate, reject if issues are found, or override risk flags.',
    placement: 'left'
  }
];
