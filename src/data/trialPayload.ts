import type { GuideTopic } from './guideContent';
import type { TrialMetadata } from './trialData';
import type { TrialVisualization } from './trialVisualizations';

export interface TrialPayload {
  slug: string;
  trialId: string;
  trial?: GuideTopic;
  metadata?: TrialMetadata;
  visualizations: TrialVisualization[];
}

export function normalizeTrialSlug(slug?: string | null): string {
  if (!slug) return '';
  return slug === 'wake-up' ? 'wake-up-trial' : slug;
}

export async function loadTrialPayload(slug?: string | null): Promise<TrialPayload> {
  const trialId = normalizeTrialSlug(slug);

  const [{ GUIDE_CONTENT }, { TRIAL_DATA }, { TRIAL_VISUALIZATIONS }] = await Promise.all([
    import('./guideContent'),
    import('./trialData'),
    import('./trialVisualizations'),
  ]);

  const metadata = TRIAL_DATA[trialId];
  const trial = GUIDE_CONTENT[trialId] ?? (
    metadata
      ? {
          id: trialId,
          title: metadata.title,
          category: metadata.category,
          content: '',
        }
      : undefined
  );

  return {
    slug: slug ?? '',
    trialId,
    trial,
    metadata,
    visualizations: TRIAL_VISUALIZATIONS[trialId] ?? [],
  };
}
