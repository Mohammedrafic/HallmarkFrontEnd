import { Directive, OnInit } from '@angular/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { GetCandidateJob } from '@agency/store/order-management.actions';
import {
  GetOrderById as GetOrgOrderById,
  GetOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';
import { GetOrderById } from '@agency/store/order-management.actions';
import { takeUntil } from 'rxjs';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { DestroyableDirective } from './destroyable.directive';

@Directive({
  selector: '[appOpenFirstAccordion]',
})
export class OpenFirstAccordionDirective extends DestroyableDirective implements OnInit {
  constructor(private actions$: Actions, private accordion: AccordionComponent) {
    super();
  }

  public ngOnInit(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(GetCandidateJob, GetOrganisationCandidateJob, GetOrderById, GetOrgOrderById),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const firstItem = 0;
        this.accordion.expandItem(true, firstItem);
      });
  }
}
