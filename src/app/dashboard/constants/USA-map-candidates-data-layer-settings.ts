import type { LayerSettingsModel } from '@syncfusion/ej2-maps';
import { USAStatesLayerSettings } from '@shared/constants/geoJSON/USA-states/USA-states-layer-settings';

export const USAMapCandidatesDataLayerSettings: LayerSettingsModel = {
  ...USAStatesLayerSettings,
  shapeSettings: {
    autofill: false,
    colorValuePath: 'candidates',
    colorMapping: [
      { from: 0, to: 2, color: '#ECF2FF' },
      { from: 2, to: 4, color: '#C5D9FF' },
      { from: 4, to: 6, color: '#9EBFFF' },
      { color: '#6499FF' },
    ],
  },
  tooltipSettings: {
    visible: true,
    valuePath: 'name',
    template:
      '<div style="text-align: center; padding: 10px; background-color: #fff"><div>${name}</div><b>${candidates}</b></div>',
  },
};
