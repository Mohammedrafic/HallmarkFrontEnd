import { InjectionToken } from '@angular/core';

import { ReportDirectiveDataModel } from '../models/report-directive-data.model';

export const reportDirectiveDataToken: InjectionToken<ReportDirectiveDataModel> = new InjectionToken(
  'report directive data'
);
