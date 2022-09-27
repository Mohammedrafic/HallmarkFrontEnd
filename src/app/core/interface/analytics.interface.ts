export type AnalyticsEvent = 'click' | 'select';

export type AnalyticsTarget = 'menu';

export interface AnalyticsDTO<T> {
  message?: string;
  eventType?: string;
  eventTargetType?: string;
  eventTarget?: T;
  eventValue?: string;
  screenUrl?: string;
  screenName?: string;
  client?: string;
  userIP?: string;
}
