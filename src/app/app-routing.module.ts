import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { BrowserUtils } from '@azure/msal-browser';
import { ClearCacheComponent } from '@shared/components/clear-cache/clear-cache.component';

import { LoginGuard, UserGuard } from '@shared/guards';
import { LoginPageComponent } from './b2c-auth/login-page/login-page.component';
import { CanViewDocumentGuard } from './document-viewer/guards/can-view-document.guard';

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
        path: 'util/clear-cache',
        component: ClearCacheComponent,
      },
      {
        path: 'schedule-export',
        loadChildren: () =>
          import('./schedule-export/schedule-export.module').then((m) => m.ScheduleExportModule),
          data: { skipAuthentication: true },
      },
      {
        path: 'document-viewer',
        loadChildren: () =>
          import('./document-viewer/document-viewer.module').then((m) => m.DocumentViewerModule),
          data: { skipAuthentication: true },
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
  {
    matcher: providerMatcher,
    redirectTo: 'login',
  },
];

function providerMatcher(url: UrlSegment[]) {
  // Assuming your URLs are like '/provider-1', '/provider-2', etc.
  const regex = /^provider-\d+$/;
  if (url.length === 1 && regex.test(url[0].path)) {
    return {
      consumed: url,
    };
  }
  return null;
}

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // useHash: true,
    // Don't perform initial navigation in iframes or popups
    initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabled' : 'disabled'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
