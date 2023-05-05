import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertsTemplateComponent } from './alerts-template/alerts-template.component';
import { AlertsComponent } from './alerts.component';
import { UserSubscriptionComponent } from './user-subscription/user-subscription.component';
import { GroupEmailComponent } from './group-email/group-email.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AlertsComponent,
    children: [
      {
        path: 'user-subscription',
        component: UserSubscriptionComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'alerts-template',
        component: AlertsTemplateComponent,
        data: {
          isOrganizationArea: true,
        },
      },
      {
        path: 'group-email',
        component: GroupEmailComponent,
      }
     
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertsRoutingModule { }
