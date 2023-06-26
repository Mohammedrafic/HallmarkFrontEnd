import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CredentialsListComponent } from '@shared/components/credentials-list/credentials-list.component';

import { CredentialsSetupComponent } from './credentials-setup/credentials-setup.component';
import { CredentialsComponent } from './credentials.component';

const routes: Routes = [
  {
    path: '',
    component: CredentialsComponent,
    children: [
      {
        path: 'list',
        component: CredentialsListComponent,
        data: {
          isOrganizationArea: true,
          isCredentialSettings: true,
        },
      },
      {
        path: 'setup',
        component: CredentialsSetupComponent,
        data: {
          isOrganizationArea: true,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CredentialsRoutingModule { }
