import { Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { GetCandidateJob } from '@agency/store/order-management.actions';
import { GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[openFirstAccordion]',
})
export class AlwaysOpenFirstAccordition implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private actions$: Actions, private el: ElementRef) {}

  public ngOnInit(): void {
    this.actions$
      .pipe(ofActionSuccessful(GetCandidateJob, GetOrganisationCandidateJob), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        const accordionComponent = this.el.nativeElement.ej2_instances[0];
        accordionComponent.expandItem(true, 0);
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
