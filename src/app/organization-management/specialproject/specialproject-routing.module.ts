import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SpecialProjectContainerComponent } from './components/specialproject-container.component';

const routes: Routes = [
  {
    path: '',
    component: SpecialProjectContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpecialprojectRoutingModule { }
