import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgencySettingsComponent } from './agency-settings.component';

const routes: Routes = [
  {
    path: '',
    component: AgencySettingsComponent,
    children: [
      {
        path: 'configurations',
        loadChildren: () => import('./configurations/configurations.module').then((m) => m.ConfigurationsModule),
        data: {
          isAgencyArea: true,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgencySettingsRoutingModule {}
