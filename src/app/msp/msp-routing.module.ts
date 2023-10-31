import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MspComponent } from './msp.component';
import { MspListComponent } from './msp-list/msp-list.component';
import { AddEditMspComponent } from './add-edit-msp/add-edit-msp.component';

 const routes: Routes = [  
  {
    path: '',
    component: MspComponent,
    children: [      
      {
        path: 'msp-list',
        component: MspListComponent,
      },
      {
        path: 'msp-add',
        component: AddEditMspComponent,
      },
      {
        path: 'msp-edit/edit/:id',
        component: AddEditMspComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MspRoutingModule {}
