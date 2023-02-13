import { InjectionToken } from '@angular/core';

export const APP_FILTERS_CONFIG = new InjectionToken('APP_FILTERS_CONFIG');

export const filterOptionFields = {
  text: 'name',
  value: 'id'
};

export const ExcludeSpinnerUrls = [
  'financialtimesheet/candidatesearch',
  '/api/Audit/uiaction',
  'Alerts/GetAlertsForUser',
];
