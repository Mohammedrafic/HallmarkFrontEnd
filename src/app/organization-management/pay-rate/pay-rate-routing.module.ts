import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PayRateComponent } from './pay-rate.component';

const routes: Routes = [
  {
    path: '',
    component: PayRateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayRateRoutingModule { }
