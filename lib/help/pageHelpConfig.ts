/**
 * Page Help Configuration
 * Defines contextual help for each key page in the CatchBarrels app
 */

export type HelpPageId =
  | 'dashboard'
  | 'video-upload'
  | 'video-detail'
  | 'admin-dashboard'
  | 'admin-session';

export interface PageHelpConfig {
  id: HelpPageId;
  routePattern: string; // e.g. '/dashboard', '/video/upload', '/video/:id', '/admin', '/admin/session/:id'
  title: string;
  shortDescription: string;
  primaryAudience: 'athlete' | 'coach';
  keyQuestions: string[]; // common questions user might ask
  keyActions: string[];   // things they should know how to do on this page
}

export const PAGE_HELP_CONFIG: PageHelpConfig[] = [
  // Dashboard
  {
    id: 'dashboard',
    routePattern: '/dashboard',
    title: 'Player Dashboard',
    primaryAudience: 'athlete',
    shortDescription:
      'This page is your home base. It shows your latest sessions, your momentum transfer trends, and a big button to start a new swing session.',
    keyQuestions: [
      'What does my momentum score mean?',
      'Where do I start a new session?',
      'How often should I hit each week?'
    ],
    keyActions: [
      'Start a new session',
      'Review your last session',
      'Check your momentum trend over the last 30 days'
    ]
  },
  // Video Upload
  {
    id: 'video-upload',
    routePattern: '/video/upload',
    title: 'Upload a Swing',
    primaryAudience: 'athlete',
    shortDescription:
      'This page is where you upload your swing video so Coach Rick can analyze your momentum transfer.',
    keyQuestions: [
      'What angles work best for video?',
      'How many swings should I upload?',
      'What should I do if the upload fails?'
    ],
    keyActions: [
      'Pick the correct video',
      'Wait for the processing to complete',
      'Go to the analysis page when it finishes'
    ]
  },
  // Video Detail
  {
    id: 'video-detail',
    routePattern: '/video/:id',
    title: 'Session Analysis',
    primaryAudience: 'athlete',
    shortDescription:
      'This page shows your momentum transfer score, breakdown, motion overlay, and recommended drills for a single session.',
    keyQuestions: [
      'How do I read my momentum card?',
      'What do my timing, sequence, and stability scores mean?',
      'Which drills should I do first?'
    ],
    keyActions: [
      'Review the momentum transfer card',
      'Toggle through tabs (Overview, Motion, Breakdown, Drills, History)',
      'Pick 1–2 drills to work on today'
    ]
  },
  // Admin Dashboard
  {
    id: 'admin-dashboard',
    routePattern: '/admin',
    title: 'Coach Control Room',
    primaryAudience: 'coach',
    shortDescription:
      'This page gives you a high-level view of your roster, recent sessions, and who needs attention.',
    keyQuestions: [
      'Which hitters are trending up or down?',
      'Who needs a check-in this week?',
      'How should I prioritize cage time?'
    ],
    keyActions: [
      'Scan roster trends',
      'Open recent flagged sessions',
      'Decide which athletes need follow-up'
    ]
  },
  // Admin Session Detail
  {
    id: 'admin-session',
    routePattern: '/admin/session/:id',
    title: 'Coach Session Detail',
    primaryAudience: 'coach',
    shortDescription:
      'This page shows a deep breakdown of one hitter\'s session for you as a coach, including flags and strengths.',
    keyQuestions: [
      'What\'s the story this session is telling me?',
      'What should I watch for on video?',
      'What do I need to track in the next session?'
    ],
    keyActions: [
      'Review momentum transfer categories',
      'Check biggest strength and biggest leak',
      'Plan your coaching emphasis for the next cage session'
    ]
  }
];

/**
 * Get page help config by ID
 */
export function getPageHelpConfigById(id: HelpPageId): PageHelpConfig | undefined {
  return PAGE_HELP_CONFIG.find((p) => p.id === id);
}

/**
 * Get page help config by route pattern
 */
export function getPageHelpConfigByRoute(route: string): PageHelpConfig | undefined {
  // Simple pattern matching - could be enhanced with regex
  if (route.startsWith('/admin/session/')) {
    return getPageHelpConfigById('admin-session');
  }
  if (route === '/admin') {
    return getPageHelpConfigById('admin-dashboard');
  }
  if (route.startsWith('/video/') && route !== '/video/upload') {
    return getPageHelpConfigById('video-detail');
  }
  if (route === '/video/upload') {
    return getPageHelpConfigById('video-upload');
  }
  if (route === '/dashboard') {
    return getPageHelpConfigById('dashboard');
  }
  return undefined;
}
