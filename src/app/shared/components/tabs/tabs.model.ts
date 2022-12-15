import { Type } from '@angular/core';

export interface TabsModel<T> {
  title: string;
  subtitle: string;
  isRequired: boolean;
  disabled: boolean;
  component: Type<T>;
}
