import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { ReasonsComponent } from './reasons.component';

const routes: Route[] = [
    {
        path: '',
        component: ReasonsComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReasonsRoutingModule {}