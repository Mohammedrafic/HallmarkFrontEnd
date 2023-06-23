import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HolidaysComponent } from './holidays.component';

const routes: Routes = [
  {
    path: '',
    component: HolidaysComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HolidaysRoutingModule { }
