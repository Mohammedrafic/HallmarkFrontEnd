import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  ProfileInformationContainerComponent,
} from './containers/profile-information-container/profile-information-container.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileInformationContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileInformationRoutingModule { }
