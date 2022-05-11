import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginGuard, ShellGuard } from '@shared/guards';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('./login/login.module').then((m) => m.LoginModule),
        // canLoad: [ LoginGuard ],
        canActivate: [ LoginGuard ],
      },
      {
        path: '',
        loadChildren: () =>
          import('./shell/shell.module').then((m) => m.ShellModule),
        // canLoad: [ LoginGuard ],
        canActivate: [ ShellGuard ]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
