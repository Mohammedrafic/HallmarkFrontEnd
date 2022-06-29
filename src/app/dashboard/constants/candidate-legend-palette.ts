import { CandidateLegendPalette } from '../enums/candidate-legend-palette.enum';

export const candidateLegendPalette: Record<CandidateLegendPalette, string> = {
  [CandidateLegendPalette.APPLIED]: 'var(--widget-status-applied-open)',
  [CandidateLegendPalette.NOT_APPLIED]: 'var(--widget-status-not-applied)',
  [CandidateLegendPalette.SHORTLISTED]: 'var(--widget-status-shortlisted-incomplete)',
  [CandidateLegendPalette.OFFERED]: 'var(--widget-status-offered-pending)',
  [CandidateLegendPalette.REJECTED]: 'var(--widget-status-rejected-closed)',
  [CandidateLegendPalette.ACCEPTED]: 'var(--widget-status-accepted)',
  [CandidateLegendPalette.ONBOARD]: 'var(--widget-status-onboard-filled)',
  [CandidateLegendPalette.CUSTOM]: 'var(--widget-status-custom)',
};
