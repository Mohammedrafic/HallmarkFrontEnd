import { Type } from '@angular/core';

export interface SingleComponentModuleModel<ComponentType, Module> {
  component: Type<ComponentType>;
  module: Type<Module>
}
