import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrganizationManagementComponent } from './organization-management.component';

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
        loadChildren: () => import('./credentials/credentials.module').then((m) => m.CredentialsModule),
        data: {
          isOrganizationArea: true,
          isCredentialSettings: true,
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
        loadChildren: () => import('./holidays/holidays.module').then((m) => m.HolidaysModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'workflow',
        loadChildren: () => import('./workflow/workflow.module').then((m) => m.WorkflowModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'bill-rates',
        loadChildren: () => import('./bill-rates/bill-rates.module').then((m) => m.BillRatesModule),
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
        loadChildren: () => import('./specialproject/specialproject.module').then((m) => m.SpecialprojectModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'businesslines',
        loadChildren: () => import('./business-lines/business-lines.module').then((m) => m.BusinessLinesModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'tiers',
        loadChildren: () => import('./tiers/tiers.module').then((m) => m.TiersModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'workcommitment',
        loadChildren: () => import('./work-commitment/work-commitment.module').then((m) => m.WorkCommitmentModule),
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'pay-rate',
        loadChildren: () => import('./pay-rate/pay-rate.module').then((m) => m.PayRateModule),
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
