// Google Analytics helper functions

export const GA_MEASUREMENT_ID = 'G-0PD4HYYNTP';

/**
 * Track a page view with an explicit title.
 *
 * Why we pass page_title explicitly: GA4's auto-page_view (from gtag config or
 * Enhanced Measurement on history changes) reads document.title at the moment
 * it fires. On direct entries (search results, deep links) GA4 fires BEFORE
 * Seo.tsx's useEffect runs, so it captures the static index.html fallback
 * title instead of the route-specific title. Passing page_title here gives
 * us the correct title regardless of when document.title finishes updating.
 *
 * Called from Seo.tsx on every route change AFTER document.title is set.
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: url,
      page_title: title ?? document.title,
      page_location: window.location.href,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track user role selection
export const trackUserRole = (role: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'select_role', {
      event_category: 'user_onboarding',
      event_label: role,
      user_role: role,
    });
    
    // Also set as user property for future tracking
    (window as any).gtag('set', 'user_properties', {
      user_role: role,
    });
  }
};

// Track calculator usage
export const trackCalculatorUsed = (
  calculatorName: string,
  resultValue?: string | number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'calculator_used', {
      event_category: 'calculators',
      calculator_name: calculatorName,
      result_value: resultValue,
    });
  }
};

// Track search queries
export const trackSearch = (
  searchTerm: string,
  resultsCount?: number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'search', {
      event_category: 'engagement',
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }
};

// Track quick tool clicks
export const trackQuickToolClick = (toolName: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'quick_tool_click', {
      event_category: 'navigation',
      tool_name: toolName,
    });
  }
};

// =============================================================================
// Custom events added 2026-05-18 — fills tracking gaps surfaced by the first
// GA4 weekly report. Each fires when a clinician takes a specific bedside
// action so we can measure not just "did they visit" but "did the page work."
// =============================================================================

/** Fired when a clinician copies a calculator's EMR text to clipboard. */
export const trackCalculatorCopied = (calculatorName: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'calculator_copied', {
      event_category: 'calculators',
      calculator_name: calculatorName,
    });
  }
};

/** Fired when the share button on a calculator/pathway resolves successfully. */
export const trackCalculatorShared = (
  calculatorName: string,
  method: 'shared' | 'copied'
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'calculator_shared', {
      event_category: 'calculators',
      calculator_name: calculatorName,
      share_method: method,
    });
  }
};

/** Fired when a trial card is clicked from the trials index/hub. */
export const trackTrialCardClicked = (trialId: string, fromPage: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'trial_card_clicked', {
      event_category: 'trials',
      trial_id: trialId,
      from_page: fromPage,
    });
  }
};

/** Fired when a multi-step pathway advances (e.g., Stroke Code Step 1 → 2). */
export const trackPathwayStepAdvanced = (
  pathway: string,
  fromStep: number,
  toStep: number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'pathway_step_advanced', {
      event_category: 'pathways',
      pathway_name: pathway,
      from_step: fromStep,
      to_step: toStep,
    });
  }
};

/** Fired when a Deep Learning pearl is expanded to detail view. */
export const trackDeepLearningOpened = (pearlId: string, pearlTitle?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'deep_learning_opened', {
      event_category: 'education',
      pearl_id: pearlId,
      pearl_title: pearlTitle,
    });
  }
};

/** Fired when a clinician follows an external citation (DOI / PMID / URL). */
export const trackExternalCitationClicked = (
  citationType: 'doi' | 'pmid' | 'url',
  citationId: string,
  context?: string
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'external_citation_clicked', {
      event_category: 'evidence',
      citation_type: citationType,
      citation_id: citationId,
      context,
    });
  }
};

/** Fired when a feedback form is submitted (success — before API response). */
export const trackFeedbackSubmitted = (
  feedbackType: string,
  hasEmail: boolean
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'feedback_submitted', {
      event_category: 'engagement',
      feedback_type: feedbackType,
      has_email: hasEmail,
    });
  }
};

/** Fired when the global medical disclaimer modal is acknowledged. */
export const trackDisclaimerAcknowledged = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'disclaimer_acknowledged', {
      event_category: 'compliance',
    });
  }
};

/** Fired when the global medical disclaimer modal is displayed to a user. */
export const trackDisclaimerShown = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'disclaimer_shown', {
      event_category: 'compliance',
    });
  }
};

// =============================================================================
// AI-traffic detection — added 2026-05-21
// Measures clinicians arriving from AI tools (ChatGPT, Perplexity, Claude,
// Gemini, etc.) vs organic / direct / referral. Sets a session-level GA4
// custom dimension so every subsequent event carries the traffic-source tag.
//
// IMPORTANT: AI CRAWLERS (Googlebot-Extended, OAI-SearchBot, ClaudeBot, etc.)
// do not execute JavaScript and will never fire GA4 events. This signal
// captures REAL BROWSER sessions whose user-agent or referrer indicates an
// AI origin — i.e., humans who clicked a NeuroWiki link from inside an AI tool.
//
// GA4 setup required (manual, done once in the GA4 Admin UI):
//   Custom Dimensions → Event scope:
//     - name: traffic_source_type   param: traffic_source_type
//     - name: ai_agent              param: ai_agent
// =============================================================================

const AI_UA_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /ChatGPT-User/i,      label: 'chatgpt-user' },
  { pattern: /OAI-SearchBot/i,     label: 'oai-searchbot' },
  { pattern: /PerplexityBot/i,     label: 'perplexitybot' },
  { pattern: /ClaudeBot/i,         label: 'claudebot' },
  { pattern: /anthropic-ai/i,      label: 'anthropic-ai' },
  { pattern: /Google-Extended/i,   label: 'google-extended' },
  { pattern: /Bytespider/i,        label: 'bytespider' },
  { pattern: /cohere-ai/i,         label: 'cohere-ai' },
  { pattern: /Meta-ExternalAgent/i, label: 'meta-externalagent' },
  { pattern: /DuckAssistBot/i,     label: 'duckassistbot' },
  { pattern: /YouBot/i,            label: 'youbot' },
];

const AI_REFERRER_DOMAINS: Array<{ domain: string; label: string }> = [
  { domain: 'chat.openai.com',    label: 'chatgpt' },
  { domain: 'chatgpt.com',        label: 'chatgpt' },
  { domain: 'perplexity.ai',      label: 'perplexity' },
  { domain: 'claude.ai',          label: 'claude' },
  { domain: 'gemini.google.com',  label: 'gemini' },
  { domain: 'you.com',            label: 'you' },
  { domain: 'copilot.microsoft.com', label: 'copilot' },
];

export type AiTrafficSignal =
  | { type: 'ai_crawler'; agent: string }
  | { type: 'ai_referral'; agent: string }
  | { type: 'none'; agent: '' };

/**
 * Detect whether the current page-load originated from an AI tool — either as
 * a crawler with an AI user-agent, or as a real browser session with an AI
 * referrer. Returns { type: 'none', agent: '' } when neither match.
 */
export function detectAiTrafficSignal(): AiTrafficSignal {
  if (typeof window === 'undefined') return { type: 'none', agent: '' };
  const ua = navigator.userAgent || '';
  for (const { pattern, label } of AI_UA_PATTERNS) {
    if (pattern.test(ua)) return { type: 'ai_crawler', agent: label };
  }
  const ref = document.referrer || '';
  if (ref) {
    for (const { domain, label } of AI_REFERRER_DOMAINS) {
      if (ref.includes(domain)) return { type: 'ai_referral', agent: label };
    }
  }
  return { type: 'none', agent: '' };
}

/**
 * If the current session has an AI signal, fire a one-shot event and set
 * session-level dimensions so every subsequent GA4 event carries the tag.
 * Safe to call multiple times — gtag('set', ...) is idempotent and the
 * one-shot event is gated on the signal being non-none.
 */
export function reportAiTrafficToGA(): void {
  const signal = detectAiTrafficSignal();
  if (signal.type === 'none') return;
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ai_traffic_detected', {
      traffic_source_type: signal.type,
      ai_agent: signal.agent,
    });
    (window as any).gtag('set', {
      traffic_source_type: signal.type,
      ai_agent: signal.agent,
    });
  }
}

export const CONSENT_STORAGE_KEY = 'neurowiki-analytics-consent';

export const loadGA = (): void => {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.__gaLoaded) return;
  w.__gaLoaded = true;

  w.dataLayer = w.dataLayer || [];
  // GA4 gtag API requires the arguments object, not a rest-param array
  w.gtag = function() { w.dataLayer.push(arguments); }; // eslint-disable-line prefer-rest-params
  w.gtag('js', new Date());
  // send_page_view:false — we fire page_view manually from Seo.tsx after
  // document.title is set, so GA4 captures the correct route-specific title
  // instead of the static index.html fallback. Closes the title-capture
  // bug surfaced by 2026-05-18 weekly report.
  w.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};
