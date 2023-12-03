import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { registerLicense } from '@syncfusion/ej2-base';
import { LicenseManager, ModuleRegistry, AllModules } from '@ag-grid-enterprise/all-modules';
import { MSAL_STATIC_PROVIDERS, APP_SETTINGS_B2C_CONFIG_URL } from './app/b2c-auth/b2c-auth.providers';
import { APP_SETTINGS, APP_SETTINGS_URL } from './app.settings';
import { SsoManagement } from './app/b2c-auth/sso-management';

// Registering AG-Grid enterprise license key
LicenseManager.setLicenseKey(
  'CompanyName=Hallmark Health Care Solutions,LicensedApplication=Einstein-II,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=1,AssetReference=AG-030341,SupportServicesEnd=7_July_2023_[v2]_MTY4ODY4NDQwMDAwMA==510643d903720c40e7c3b0bf23079182'
);
ModuleRegistry.registerModules(AllModules);

// Registering Syncfusion license key
registerLicense('ORg4AjUWIQA/Gnt2VVhhQlFaclhJXGFWfVJpTGpQdk5xdV9DaVZUTWY/P1ZhSXxRdkBjUH9cdH1UR2dYVEU=');

if (environment.production) {
  enableProdMode();
}

Promise.resolve()
  .then(() => fetch(APP_SETTINGS_URL))
  .then((res) => res.json())
  .then((settings) => {
    const host = environment.production ? settings.API_BASE_URL : environment.host;
    const reportServerUrl = settings.LOGIREPORT_BASE_URL;
    return Promise.all([{ host, reportServerUrl }, fetch(APP_SETTINGS_B2C_CONFIG_URL(host)).then((res) => res.json())]);
  })
  .then(([settings, configs]) => {
    //When the user provides a url like this, we imply that they want to use SSO
    const urlParams = new URLSearchParams(window.location.search);
    const domainHint = urlParams.get('domainHint');
    if (location.pathname.includes('/sso') && domainHint !== null) {
      SsoManagement.setSsoInformation(domainHint, configs[0].apiScope);
    }

    SsoManagement.setRedirectUrl(location.pathname);
    const index = SsoManagement.isSsoAvailable() ? 1 : 0;
    const B2C_STATIC_PROVIDERS = MSAL_STATIC_PROVIDERS(settings.host, configs[index]);
    platformBrowserDynamic([{ provide: APP_SETTINGS, useValue: settings }, ...B2C_STATIC_PROVIDERS])
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  });

