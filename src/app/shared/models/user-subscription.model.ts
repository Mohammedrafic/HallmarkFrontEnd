import { PageOfCollections } from "./page.model";

export type UserSubscription = {
  id?: number;
  alert: string;
  isEmail: boolean;
  isText: boolean;
  isOnScreen: boolean;
};
export type UserSubscriptionPage = PageOfCollections<UserSubscription>;
export type UserSubscriptionFilters = {
};
