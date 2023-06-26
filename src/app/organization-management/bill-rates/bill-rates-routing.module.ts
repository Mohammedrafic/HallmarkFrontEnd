import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BillRatesComponent } from './bill-rates.component';

const routes: Routes = [
  {
    path: '',
    component: BillRatesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillRatesRoutingModule { }
