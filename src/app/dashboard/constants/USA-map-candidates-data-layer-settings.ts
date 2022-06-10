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
      '<div style="text-align: center; padding: 10px 20px; background-color: #fff; box-shadow: 0 3px 15px rgb(0 0 0 / 0.2); color: #4C5673;"><div>${name}</div><b>${candidates}</b><div style="width: 15px; height: 15px; background: #fff; transform: rotate(45deg); position: absolute; left: 40%;"></div></div>',
  },
};
