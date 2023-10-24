import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MspComponent } from './msp.component';
import { MspListComponent } from './msp-list/msp-list.component';

 const routes: Routes = [  
  {
    path: '',
    component: MspComponent,
    children: [      
      {
        path: 'msp-list',
        component: MspListComponent,
      }    
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MspRoutingModule {}
