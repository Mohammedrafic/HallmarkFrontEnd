import { InjectionToken } from "@angular/core";

export type AppSettings = {
    host: string;
}

export const APP_SETTINGS = new InjectionToken<AppSettings>('APP_SETTINGS')