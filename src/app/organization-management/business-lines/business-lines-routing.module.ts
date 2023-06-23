import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BusinessLinesComponent } from './business-lines.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessLinesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessLinesRoutingModule { }
