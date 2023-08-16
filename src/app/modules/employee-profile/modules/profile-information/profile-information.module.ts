import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';

import { EmployeeProfileFormModule } from './components/employee-profile-form/employee-profile-form.module';
import { ProfileApiService } from './services/profile-api.service';
import { ProfileService } from './services/profile.service';
import { ProfileInformationRoutingModule } from './profile-information-routing.module';
import {
  ProfileInformationContainerComponent,
} from './containers/profile-information-container/profile-information-container.component';

@NgModule({
  declarations: [ProfileInformationContainerComponent],
  imports: [
    CommonModule,
    SharedModule,
    ProfileInformationRoutingModule,
    EmployeeProfileFormModule,
  ],
  providers: [
    ProfileService,
    ProfileApiService,
  ],
})
export class ProfileInformationModule { }
