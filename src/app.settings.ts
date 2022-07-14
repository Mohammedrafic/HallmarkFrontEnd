import { InjectionToken } from '@angular/core';

export class AppSettings {
  API_BASE_URL: string;
}

export let APP_SETTINGS = new InjectionToken<AppSettings>('APP_SETTINGS');
