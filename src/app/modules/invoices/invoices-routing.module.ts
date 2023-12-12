import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicesContainerComponent } from "./containers/invoices-container/invoices-container.component";
import { InvoiceAgencyResolver } from './resolvers/invoice-agency.resolver';
import { AgencyVisibilityFlagResolverService } from '@core/resolvers/agency-visibility-flag.resolver';

const routes: Routes = [
  {
    path: '',
    component: InvoicesContainerComponent,
    resolve: [InvoiceAgencyResolver,AgencyVisibilityFlagResolverService],    
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesRoutingModule {}
