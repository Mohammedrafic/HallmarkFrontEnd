import type { Type, Injector } from '@angular/core';

export interface DynamicComponentModel<T> {
  component: Type<T>;
  injector: Injector;
}
