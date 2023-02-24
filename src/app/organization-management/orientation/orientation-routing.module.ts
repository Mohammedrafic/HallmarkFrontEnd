import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { OrientationComponent } from './orientation.component';

const routes: Route[] = [
  {
    path: '',
    component: OrientationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrientationRoutingModule {}