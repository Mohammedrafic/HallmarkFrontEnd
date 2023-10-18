import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RolesAndPermissionsComponent } from './roles-and-permissions/roles-and-permissions.component';
import { SecurityComponent } from './security.component';
import {UserListComponent} from "./user-list/user-list.component";
import { AgencyVisibilityFlagResolverService } from '@core/resolvers/agency-visibility-flag.resolver';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: SecurityComponent,
    children: [
      {
        path: 'roles-and-permissions',
        component: RolesAndPermissionsComponent,
      },
      {
        path: 'user-list',
        component: UserListComponent,
        resolve:[AgencyVisibilityFlagResolverService],
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityRoutingModule {}
