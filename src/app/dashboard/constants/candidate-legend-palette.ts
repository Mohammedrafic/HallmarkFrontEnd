import { CandidateChartStatuses } from '../enums/candidate-legend-palette.enum';

export const candidateLegendPalette: Record<CandidateChartStatuses, string> = {
  [CandidateChartStatuses.APPLIED]: 'var(--widget-status-applied-open)',
  [CandidateChartStatuses.NOT_APPLIED]: 'var(--widget-status-not-applied)',
  [CandidateChartStatuses.SHORTLISTED]: 'var(--widget-status-shortlisted-incomplete)',
  [CandidateChartStatuses.OFFERED]: 'var(--widget-status-offered-pending)',
  [CandidateChartStatuses.REJECTED]: 'var(--widget-status-rejected-closed)',
  [CandidateChartStatuses.ACCEPTED]: 'var(--widget-status-accepted)',
  [CandidateChartStatuses.ONBOARD]: 'var(--widget-status-onboard-filled)',
  [CandidateChartStatuses.OFFBOARD]: 'var(--widget-status-offboard)',
  [CandidateChartStatuses.CANCELLED]: 'var(--widget-status-cancelled)',
  [CandidateChartStatuses.CUSTOM]: 'var(--widget-status-custom)',
};
