import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomReportGridComponent } from './components/custom-report-grid/custom-report-grid.component';



const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: 'custom-report',
    component: CustomReportGridComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogiCustomReportRoutingModule { }


