import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { registerLicense } from '@syncfusion/ej2-base';

// Registering Syncfusion license key
registerLicense('ORg4AjUWIQA/Gnt2VVhhQlFaclhJWHxMYVF2R2FJelRwd19CZkwgOX1dQl9hSXpTc0VmWXpddnxWQWA='); //Trial key

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
