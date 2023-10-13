import { LayerSettingsModel } from '@syncfusion/ej2-angular-maps';

export interface CandidatesByStateWidgetAggregatedDataModel {
  chartData: LayerSettingsModel[];
  unknownStateCandidates: number;
  title: string;
  description: string;
  totalCandidates:number;
}
