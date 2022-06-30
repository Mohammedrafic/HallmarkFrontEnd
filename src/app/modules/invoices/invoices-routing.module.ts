import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicesContainerComponent } from "./containers/invoices-container/invoices-container.component";

const routes: Routes = [
  {
    path: '',
    component: InvoicesContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesRoutingModule {}
