import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { SecurityRoutingModule } from './security-routing.module';
import { FeatherModule } from 'angular-feather';
import { RolesAndPermissionsComponent } from './roles-and-permissions/roles-and-permissions.component';
import { SecurityComponent } from './security.component';

const scurityIcons = {};


@NgModule({
  declarations: [
    SecurityComponent,
    RolesAndPermissionsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SecurityRoutingModule,
    ReactiveFormsModule,

    FeatherModule.pick(scurityIcons),
  ]
})
export class SecurityModule { }
