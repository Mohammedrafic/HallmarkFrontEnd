import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TiersComponent } from '@organization-management/tiers/tiers.component';
import { CredentialsListComponent } from '@shared/components/credentials-list/credentials-list.component';
import { BillRatesComponent } from './bill-rates/bill-rates.component';
import { BusinessLinesComponent } from './business-lines/business-lines.component';
import { CredentialsSetupComponent } from './credentials/credentials-setup/credentials-setup.component';
import { GroupComponent } from './credentials/credentials-setup/group/group.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { OrganizationManagementComponent } from './organization-management.component';
import { PayRateComponent } from './pay-rate/pay-rate.component';
import { SpecialProjectContainerComponent } from './specialproject/components/specialproject-container.component';
import { WorkCommitmentComponent } from './work-commitment/containers/work-commitment-container/work-commitment.component';
import { JobOrderComponent } from './workflow/job-order/job-order.component';

/**
 * TODO: refactor component to modules and make them lazy.
 */
const routes: Routes = [
  {
    path: '',
    component: OrganizationManagementComponent,
    children: [
      {
        path: 'departments',
        loadChildren: () => import('./departments/departments.module').then((m) => m.DepartmentsModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'locations',
        loadChildren: () => import('./locations/locations.module').then((m) => m.LocationsModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'regions',
        loadChildren: () => import('./regions/regions.module').then((m) => m.RegionsModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'credentials',
        component: CredentialsComponent,
        data: {
          isOrganizationArea: true,
        },
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
            data: { isOrganizationArea: true },
          },
        ],
      },
      {
        path: 'credentials/groups-setup',
        component: GroupComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'skills',
        loadChildren: () => import('./skills/skills.module').then((m) => m.SkillsModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'shifts',
        loadChildren: () => import('./shifts/shifts.module').then((m) => m.ShiftsModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'holidays',
        component: HolidaysComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'workflow',
        component: JobOrderComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'bill-rates',
        component: BillRatesComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'reasons',
        loadChildren: () => import('./reasons/reasons.module').then((m) => m.ReasonsModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'orientation',
        loadChildren: () => import('./orientation/orientation.module').then((m) => m.OrientationModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'specialproject',
        component: SpecialProjectContainerComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'businesslines',
        component: BusinessLinesComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'tiers',
        component: TiersComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'workcommitment',
        component: WorkCommitmentComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'pay-rate',
        component: PayRateComponent,
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
export class OrganizationManagementRoutingModule {}
