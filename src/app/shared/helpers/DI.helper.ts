import { InjectionToken, Injector, ɵcreateInjector as createInjector } from '@angular/core';

import { SingleComponentModuleModel } from '@shared/models/single-component-module.model';

export class DIHelper {
  public static createInjectorForSCAM<Data, Component, Module>(
    scam: SingleComponentModuleModel<Component, Module>,
    injectorToken: InjectionToken<Data>,
    parentInjector: Injector,
    data: Data
  ): Injector {
    const moduleInjector = createInjector(scam.module, parentInjector);
    return Injector.create({ providers: [{ provide: injectorToken, useValue: data }], parent: moduleInjector });
  }
}
