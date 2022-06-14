import type { LayerSettingsModel } from '@syncfusion/ej2-maps';

export const USAMapCandidatesDataLayerSettings: LayerSettingsModel = {
  shapeSettings: {
    autofill: false,
    colorValuePath: 'candidates',
    border: { color: '#9198ac', width: 0.5 },
  },
  tooltipSettings: {
    visible: true,
    valuePath: 'name',
    template: '<div class="widget-tooltip"><div>${name}</div><b>${candidates}</b></div>',
  },
};
