export interface VisualizationSource {
  reference: string;
  endpoint?: string;
  note?: string;
}

export interface DistributionSegment {
  key: string;
  label: string;
  description: string;
  color: string;
  textColor?: string;
}

export interface VisualizationBase {
  title: string;
  subtitle?: string;
  interpretation?: string;
  source: VisualizationSource;
}

export interface GrottaBarVisualization extends VisualizationBase {
  type: 'grotta-bar';
  treatmentName: string;
  controlName: string;
  treatmentData: number[];
  controlData: number[];
  segments?: DistributionSegment[];
}

export interface ForestPlotRow {
  label: string;
  treatmentText?: string;
  controlText?: string;
  sampleSize?: number;
  pointEstimate: number;
  ciLower: number;
  ciUpper: number;
}

export interface SubgroupForestPlotVisualization extends VisualizationBase {
  type: 'forest-plot';
  estimateType: 'OR' | 'RR' | 'HR';
  treatmentName: string;
  controlName: string;
  axisMin?: number;
  axisMax?: number;
  favorsLeftLabel?: string;
  favorsRightLabel?: string;
  rows: ForestPlotRow[];
}

export interface TICIBarRow {
  label: string;
  data: number[];
}

export interface TICIBarVisualization extends VisualizationBase {
  type: 'tici-bar';
  rows: TICIBarRow[];
}

export interface KaplanMeierPoint {
  time: number;
  probability: number;
}

export interface KaplanMeierVisualization extends VisualizationBase {
  type: 'kaplan-meier';
  treatmentName: string;
  controlName: string;
  treatmentSeries: KaplanMeierPoint[];
  controlSeries: KaplanMeierPoint[];
  treatmentCensored?: KaplanMeierPoint[];
  controlCensored?: KaplanMeierPoint[];
  xLabel: string;
  hazardRatioText?: string;
  logRankPValueText?: string;
}

export interface BoxPlotSummary {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface LongitudinalBoxPoint {
  label: string;
  treatment: BoxPlotSummary;
  control: BoxPlotSummary;
}

export interface LongitudinalBoxPlotVisualization extends VisualizationBase {
  type: 'longitudinal-box-plot';
  treatmentName: string;
  controlName: string;
  yLabel: string;
  yMin?: number;
  yMax?: number;
  points: LongitudinalBoxPoint[];
}

export type TrialVisualization =
  | GrottaBarVisualization
  | SubgroupForestPlotVisualization
  | TICIBarVisualization
  | KaplanMeierVisualization
  | LongitudinalBoxPlotVisualization;

export const MRS_SEGMENTS: DistributionSegment[] = [
  { key: 'mrs-0', label: 'mRS 0', description: 'No symptoms', color: '#f8fafc', textColor: '#0f172a' },
  { key: 'mrs-1', label: 'mRS 1', description: 'No significant disability', color: '#dbeafe', textColor: '#0f172a' },
  { key: 'mrs-2', label: 'mRS 2', description: 'Slight disability', color: '#93c5fd' },
  { key: 'mrs-3', label: 'mRS 3', description: 'Moderate disability', color: '#60a5fa' },
  { key: 'mrs-4', label: 'mRS 4', description: 'Moderately severe disability', color: '#3b82f6' },
  { key: 'mrs-5', label: 'mRS 5', description: 'Severe disability', color: '#1d4ed8' },
  { key: 'mrs-6', label: 'mRS 6', description: 'Death', color: '#7f1d1d' },
];

export const MRS_COLLAPSED_SEGMENTS: DistributionSegment[] = [
  {
    key: 'mrs-0-3',
    label: 'mRS 0-3 / Home',
    description: 'Independent to moderate disability or living at home',
    color: '#dbeafe',
    textColor: '#0f172a',
  },
  {
    key: 'mrs-4-5',
    label: 'mRS 4-5 / Nursing Care',
    description: 'Moderately severe to severe disability or institutional care',
    color: '#60a5fa',
  },
  {
    key: 'mrs-6',
    label: 'Death',
    description: 'All-cause mortality',
    color: '#7f1d1d',
  },
];

export const CHOICE_SEGMENTS: DistributionSegment[] = [
  { key: 'mrs-0', label: 'mRS 0', description: 'No symptoms', color: '#f8fafc', textColor: '#0f172a' },
  { key: 'mrs-1', label: 'mRS 1', description: 'No significant disability', color: '#dbeafe', textColor: '#0f172a' },
  { key: 'mrs-2', label: 'mRS 2', description: 'Slight disability', color: '#93c5fd' },
  { key: 'mrs-3', label: 'mRS 3', description: 'Moderate disability', color: '#60a5fa' },
  { key: 'mrs-4', label: 'mRS 4', description: 'Moderately severe disability', color: '#3b82f6' },
  { key: 'mrs-5-6', label: 'mRS 5-6', description: 'Severe disability or death', color: '#7f1d1d' },
];

export const TICI_SEGMENTS: DistributionSegment[] = [
  { key: 'tici-0', label: 'TICI 0', description: 'No perfusion', color: '#991b1b' },
  { key: 'tici-1', label: 'TICI 1', description: 'Minimal perfusion', color: '#dc2626' },
  { key: 'tici-2a', label: 'TICI 2a', description: 'Partial perfusion under 50%', color: '#f97316', textColor: '#0f172a' },
  { key: 'tici-2b', label: 'TICI 2b', description: 'Substantial perfusion', color: '#84cc16', textColor: '#0f172a' },
  { key: 'tici-2c', label: 'TICI 2c', description: 'Near-complete perfusion', color: '#14b8a6' },
  { key: 'tici-3', label: 'TICI 3', description: 'Complete reperfusion', color: '#0f766e' },
];

export const TRIAL_VISUALIZATIONS: Record<string, TrialVisualization[]> = {
  'b-proud-trial': [
    {
      type: 'grotta-bar',
      title: 'Functional Outcome Distribution',
      subtitle: 'Collapsed 90-day disability categories from the published primary outcomes table',
      interpretation: 'MSU dispatch slightly shifted patients toward better functional status and lower mortality, driven by faster imaging and earlier thrombolysis.',
      source: {
        reference: 'B_PROUD, JAMA 2021, Table 2',
        endpoint: 'Coprimary efficacy outcomes at 3 months',
        note: 'The publication reports collapsed categories rather than the full 7-level mRS distribution.',
      },
      treatmentName: 'Mobile Stroke Unit',
      controlName: 'Conventional EMS',
      treatmentData: [80.3, 12.6, 7.1],
      controlData: [78.0, 13.3, 8.8],
      segments: MRS_COLLAPSED_SEGMENTS,
    },
  ],
  'trace-iii-trial': [
    {
      type: 'grotta-bar',
      title: '90-Day mRS Shift',
      subtitle: 'Full modified Rankin scale distribution in the intention-to-treat population',
      interpretation: 'Late-window tenecteplase increased the share of patients with excellent outcomes and reduced severe disability compared with standard medical treatment alone.',
      source: {
        reference: 'TRACE-III, NEJM 2024, Figure 1',
        endpoint: 'Modified Rankin scale distribution at day 90',
        note: 'Percentages are taken directly from the labeled figure text extracted from the publication.',
      },
      treatmentName: 'Tenecteplase',
      controlName: 'Standard Medical Treatment',
      treatmentData: [9.9, 23.1, 10.6, 17.4, 21.6, 4.2, 13.3],
      controlData: [6.8, 17.5, 9.1, 23.4, 22.6, 7.5, 13.1],
      segments: MRS_SEGMENTS,
    },
  ],
  'choice-trial': [
    {
      type: 'grotta-bar',
      title: '90-Day Functional Distribution',
      subtitle: 'Intra-arterial alteplase versus placebo after successful thrombectomy',
      interpretation: 'Adjunct intra-arterial alteplase shifted outcomes toward the mild end of the disability scale, especially mRS 0-1.',
      source: {
        reference: 'CHOICE, JAMA 2022, Table 2 and Figure 2',
        endpoint: 'Modified Rankin scale score at 90 days',
        note: 'The publication combines mRS 5 and 6 in the reported distribution.',
      },
      treatmentName: 'Intra-arterial Alteplase',
      controlName: 'Intra-arterial Placebo',
      treatmentData: [34.4, 24.6, 8.2, 6.6, 13.1, 13.1],
      controlData: [23.1, 17.3, 23.1, 9.6, 11.5, 15.4],
      segments: CHOICE_SEGMENTS,
    },
  ],
  'charm-trial': [
    {
      type: 'grotta-bar',
      title: '90-Day mRS Shift',
      subtitle: 'Full disability distribution in CHARM primary-efficacy population',
      interpretation: 'The overall disability distribution was broadly similar between glibenclamide and placebo, consistent with the neutral primary outcome.',
      source: {
        reference: 'CHARM, Lancet Neurology 2024, Figure 2',
        endpoint: 'Distribution of mRS score at 90 days',
        note: 'Percentages are the labeled figure values published in the main article.',
      },
      treatmentName: 'Glibenclamide',
      controlName: 'Placebo',
      treatmentData: [0, 3, 5, 12, 24, 24, 32],
      controlData: [0, 1, 3, 13, 25, 29, 29],
      segments: MRS_SEGMENTS,
    },
    {
      type: 'forest-plot',
      title: 'Prespecified Subgroup Analysis',
      subtitle: 'Common odds ratio for less disability on the 90-day modified Rankin scale',
      interpretation: 'CHARM was neutral overall, but the published forest plot suggests hypothesis-generating signals in lower-severity and reperfusion-treated subgroups.',
      source: {
        reference: 'CHARM, Lancet Neurology 2024, Figure 3',
        endpoint: 'Primary outcome across prespecified subgroups',
        note: 'Subgroup results are exploratory and were not adjusted for multiplicity.',
      },
      estimateType: 'OR',
      treatmentName: 'Glibenclamide',
      controlName: 'Placebo',
      axisMin: 0.2,
      axisMax: 6,
      rows: [
        { label: 'Overall', treatmentText: '217', controlText: '214', sampleSize: 431, pointEstimate: 1.13, ciLower: 0.77, ciUpper: 1.65 },
        { label: 'Thrombectomy: Yes', treatmentText: '42', controlText: '40', sampleSize: 82, pointEstimate: 1.75, ciLower: 0.67, ciUpper: 4.56 },
        { label: 'Thrombectomy: No', treatmentText: '175', controlText: '174', sampleSize: 349, pointEstimate: 1.06, ciLower: 0.69, ciUpper: 1.64 },
        { label: 'rtPA: Yes', treatmentText: '82', controlText: '84', sampleSize: 166, pointEstimate: 1.44, ciLower: 0.75, ciUpper: 2.79 },
        { label: 'rtPA: No', treatmentText: '135', controlText: '130', sampleSize: 265, pointEstimate: 0.99, ciLower: 0.60, ciUpper: 1.62 },
        { label: 'NIHSS ≤20', treatmentText: '141', controlText: '133', sampleSize: 274, pointEstimate: 1.66, ciLower: 1.04, ciUpper: 2.65 },
        { label: 'NIHSS >20', treatmentText: '76', controlText: '81', sampleSize: 157, pointEstimate: 0.52, ciLower: 0.25, ciUpper: 1.08 },
      ],
    },
  ],
  'raise-trial': [
    {
      type: 'forest-plot',
      title: 'Primary Outcome Across Prespecified Subgroups',
      subtitle: 'Excellent functional outcome (mRS 0-1) at 90 days',
      interpretation: 'Reteplase outperformed alteplase consistently across age, sex, stroke severity, and time-to-treatment subgroups, with no clear heterogeneity signal.',
      source: {
        reference: 'RAISE, NEJM 2024, Figure 1',
        endpoint: 'Risk ratio for excellent functional outcome',
        note: 'Event counts and risk ratios are taken from the labeled subgroup figure in the main article.',
      },
      estimateType: 'RR',
      treatmentName: 'Reteplase',
      controlName: 'Alteplase',
      axisMin: 0.5,
      axisMax: 2,
      rows: [
        { label: 'Overall', treatmentText: '562/707', controlText: '496/705', sampleSize: 1412, pointEstimate: 1.13, ciLower: 1.05, ciUpper: 1.21 },
        { label: 'Age 18-60 yr', treatmentText: '248/294', controlText: '238/299', sampleSize: 593, pointEstimate: 1.06, ciLower: 0.97, ciUpper: 1.15 },
        { label: 'Age >60 yr', treatmentText: '315/413', controlText: '259/406', sampleSize: 819, pointEstimate: 1.20, ciLower: 1.10, ciUpper: 1.29 },
        { label: 'Female', treatmentText: '148/199', controlText: '150/217', sampleSize: 416, pointEstimate: 1.08, ciLower: 0.94, ciUpper: 1.22 },
        { label: 'Male', treatmentText: '414/508', controlText: '347/488', sampleSize: 996, pointEstimate: 1.15, ciLower: 1.07, ciUpper: 1.22 },
        { label: 'NIHSS 4-7', treatmentText: '390/462', controlText: '370/471', sampleSize: 933, pointEstimate: 1.08, ciLower: 1.02, ciUpper: 1.13 },
        { label: 'NIHSS >7', treatmentText: '172/245', controlText: '127/234', sampleSize: 479, pointEstimate: 1.29, ciLower: 1.07, ciUpper: 1.51 },
        { label: 'Prestroke mRS 0', treatmentText: '538/660', controlText: '469/640', sampleSize: 1300, pointEstimate: 1.11, ciLower: 1.04, ciUpper: 1.19 },
        { label: 'Prestroke mRS 1-2', treatmentText: '24/47', controlText: '27/65', sampleSize: 112, pointEstimate: 1.20, ciLower: 0.82, ciUpper: 1.58 },
        { label: 'Treatment <3 hr', treatmentText: '268/334', controlText: '240/331', sampleSize: 665, pointEstimate: 1.11, ciLower: 1.03, ciUpper: 1.20 },
        { label: 'Treatment ≥3 hr', treatmentText: '294/373', controlText: '257/374', sampleSize: 747, pointEstimate: 1.15, ciLower: 1.05, ciUpper: 1.25 },
      ],
    },
  ],
  'rescue-bt-trial': [
    {
      type: 'forest-plot',
      title: 'Etiology Subgroup Signal',
      subtitle: 'Primary ordinal outcome by large-artery atherosclerosis status',
      interpretation: 'RESCUE BT was neutral overall, but the subgroup estimate was directionally favorable in large-artery atherosclerosis and neutral to unfavorable otherwise.',
      source: {
        reference: 'RESCUE BT, JAMA 2022, subgroup-analysis text',
        endpoint: 'Adjusted common odds ratio for less mRS disability',
        note: 'The publication text reports the subgroup estimates and interaction p value, but not subgroup event counts.',
      },
      estimateType: 'OR',
      treatmentName: 'Tirofiban',
      controlName: 'Placebo',
      axisMin: 0.4,
      axisMax: 2.4,
      rows: [
        { label: 'Overall', treatmentText: '463', controlText: '485', sampleSize: 948, pointEstimate: 1.08, ciLower: 0.86, ciUpper: 1.36 },
        { label: 'Large-artery atherosclerosis', pointEstimate: 1.40, ciLower: 1.00, ciUpper: 1.97 },
        { label: 'Non-LAA etiology', pointEstimate: 0.84, ciLower: 0.62, ciUpper: 1.15 },
      ],
    },
  ],
};
