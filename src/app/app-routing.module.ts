import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { BrowserUtils } from '@azure/msal-browser';
import { ClearCacheComponent } from '@shared/components/clear-cache/clear-cache.component';

import { LoginGuard, UserGuard } from '@shared/guards';
import { LoginFormComponent } from './b2c-auth/login-form/login-form.component';
import { LoginPageComponent } from './b2c-auth/login-page/login-page.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
        canActivate: [ LoginGuard ],
      },
      {
        path: 'login-b2c',
        component: LoginFormComponent
      },
      {
        path: 'util/clear-cache',
        component: ClearCacheComponent,
      },
      {
        path: '',
        loadChildren: () =>
          import('./shell/shell.module').then((m) => m.ShellModule),
        // canLoad: [ LoginGuard ],
        canActivate: [ MsalGuard, UserGuard ]
      },
    ],
  },
  {
    // Needed for hash routing
    path: 'error',
    component: LoginPageComponent
  },
  {
    // Needed for hash routing
    path: 'state',
    component: LoginPageComponent
  },
  {
    // Needed for hash routing
    path: 'code',
    component: LoginPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // useHash: true,
    // Don't perform initial navigation in iframes or popups
    initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabled' : 'disabled'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
