import type { LayerSettingsModel } from '@syncfusion/ej2-maps';
import { USAStatesLayerSettings } from '@shared/constants/geoJSON/USA-states/USA-states-layer-settings';

export const USAMapCandidatesDataLayerSettings: LayerSettingsModel = {
  ...USAStatesLayerSettings,
  shapeSettings: {
    autofill: false,
    colorValuePath: 'candidates',
    border: { color: '#9198ac', width: 0.5 },
  },
  tooltipSettings: {
    visible: true,
    valuePath: 'name',
    template:
      '<div class="widget-tooltip"><div>${name}</div><b>${candidates}</b></div>',
  },
};
