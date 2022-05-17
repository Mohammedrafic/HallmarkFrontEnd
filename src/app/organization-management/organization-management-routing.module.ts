import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditSkillGroupComponent } from './credentials/credentials-setup/add-edit-skill-group/add-edit-skill-group.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { DepartmentsComponent } from './departments/departments.component';
import { LocationsComponent } from './locations/locations.component';
import { OrganizationManagementComponent } from './organization-management.component';
import { SettingsComponent } from './settings/settings.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { SkillsComponent } from './skills/skills.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationManagementComponent,
    children: [
      {
        path: 'departments',
        component: DepartmentsComponent
      },
      {
        path: 'locations',
        component: LocationsComponent
      },
      {
        path: 'credentials',
        component: CredentialsComponent
      },
      {
        path: 'credentials/groups-setup',
        component: AddEditSkillGroupComponent
      },
      {
        path: 'skills',
        component: SkillsComponent
      },
      {
        path: 'shifts',
        component: ShiftsComponent
      },
      {
        path: 'settings',
        component: SettingsComponent

      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationManagementRoutingModule {}
