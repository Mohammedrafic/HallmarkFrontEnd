import type { LayerSettingsModel } from '@syncfusion/ej2-angular-maps';
import type { CandidatesByStatesResponseModel } from './candidates-by-states-response.model';

export interface ApplicantsByRegionDataModel {
  mapData: LayerSettingsModel;
  applicantsByRegion: CandidatesByStatesResponseModel;
}
