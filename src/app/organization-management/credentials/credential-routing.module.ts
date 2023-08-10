import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { CredentialsComponent } from '@organization-management/credentials/credentials.component';

const routes: Routes = [
  {
    path: '',
    component: CredentialsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CredentialRoutingModule {}
