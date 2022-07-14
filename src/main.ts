import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { registerLicense } from '@syncfusion/ej2-base';
import { LicenseManager, ModuleRegistry, AllModules } from '@ag-grid-enterprise/all-modules';
import { APP_SETTINGS } from './app.settings';

// Registering AG-Grid enterprise license key
LicenseManager.setLicenseKey('CompanyName=Hallmark Health Care Solutions,LicensedApplication=Einstein-II,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=1,AssetReference=AG-030341,SupportServicesEnd=7_July_2023_[v2]_MTY4ODY4NDQwMDAwMA==510643d903720c40e7c3b0bf23079182');
ModuleRegistry.registerModules(AllModules);

// Registering Syncfusion license key
registerLicense('ORg4AjUWIQA/Gnt2VVhhQlFaclhJXGFWfVJpTGpQdk5xdV9DaVZUTWY/P1ZhSXxRdkBjUH9cdH1UR2dYVEU=');

if (environment.production) {
  enableProdMode();
}

fetch('/assets/app.settings.json')
  .then((res) => res.json())
  .then((settings) => {
    
    platformBrowserDynamic([{ provide: APP_SETTINGS, useValue: settings }])
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  });
