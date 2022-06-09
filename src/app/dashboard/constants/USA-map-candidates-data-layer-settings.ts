import type { LayerSettingsModel } from '@syncfusion/ej2-maps';
import { USAStatesLayerSettings } from '@shared/constants/geoJSON/USA-states/USA-states-layer-settings';

export const USAMapCandidatesDataLayerSettings: LayerSettingsModel = {
  ...USAStatesLayerSettings,
  shapeSettings: {
    autofill: false,
    colorValuePath: 'candidates',
    border: { color: '#0a163e', width: 0.5 },
  },
  tooltipSettings: {
    visible: true,
    valuePath: 'name',
    template:
      '<div style="text-align: center; padding: 10px; background-color: #fff"><div>${name}</div><b>${candidates}</b></div>',
  },
};
