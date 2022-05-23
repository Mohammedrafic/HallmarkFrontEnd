import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupComponent } from './credentials/credentials-setup/group/group.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { DepartmentsComponent } from './departments/departments.component';
import { HolidaysComponent } from './holidays/holidays.component';
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
        component: DepartmentsComponent,
        data: {
          isOrganizationArea: true
        }
      },
      {
        path: 'locations',
        component: LocationsComponent,
        data: {
          isOrganizationArea: true
        }
      },
      {
        path: 'credentials',
        component: CredentialsComponent,
        data: {
          isOrganizationArea: true
        }
      },
      {
        path: 'credentials/groups-setup',
        component: GroupComponent,
        data: {
          isOrganizationArea: true
        }
      },
      {
        path: 'skills',
        component: SkillsComponent,
        data: {
          isOrganizationArea: true
        }
      },
      {
        path: 'shifts',
        component: ShiftsComponent,
        data: {
          isOrganizationArea: true
        }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: {
          isOrganizationArea: true
        }
      },
      {
        path: 'holidays',
        component: HolidaysComponent,
        data: {
          isOrganizationArea: true
        }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationManagementRoutingModule {}
