import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { Select } from '@ngxs/store';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { AccordionClickArgs, AccordionComponent, ExpandEventArgs } from '@syncfusion/ej2-angular-navigations';

import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Order, OrderCandidatesList } from '@shared/models/order-management.model';
import { AccordionOneField } from '@shared/models/accordion-one-field.model';
import { OrderManagementState } from '@agency/store/order-management.state';
import { AcceptFormComponent } from './accept-form/accept-form.component';

@Component({
  selector: 'app-reorder-status-dialog',
  templateUrl: './reorder-status-dialog.component.html',
  styleUrls: ['./reorder-status-dialog.component.scss'],
})
export class ReorderStatusDialogComponent extends DestroyableDirective implements OnInit {
  @Input() openEvent: Subject<boolean>;
  @Input() candidate: OrderCandidatesList;
  @Input() isAgency: boolean = false;
  @Input() isTab: boolean = false;
  @Input() dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Select(OrderManagementState.selectedOrder)
  public selectedOrder$: Observable<Order>;

  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public acceptForm = AcceptFormComponent.generateFormGroup();

  public accordionOneField: AccordionOneField;
  public accordionClickElement: HTMLElement | null;

  ngOnInit(): void {
    this.onOpenEvent().subscribe();
  }

  public onAccept(): void {
    const value = this.acceptForm.getRawValue();
  }

  public clickedOnAccordion(accordionClick: AccordionClickArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionClickElement = this.accordionOneField.clickedOnAccordion(accordionClick);
  }

  public toForbidExpandSecondRow(expandEvent: ExpandEventArgs): void {
    this.accordionOneField = new AccordionOneField(this.accordionComponent);
    this.accordionOneField.toForbidExpandSecondRow(expandEvent, this.accordionClickElement);
  }

  public onCloseDialog(): void {
    this.openEvent.next(false);
  }

  private onOpenEvent(): Observable<boolean> {
    return this.openEvent.pipe(
      takeUntil(this.destroy$),
      tap((isOpen: boolean) => {
        if (isOpen) {
          this.sideDialog.show();
        } else {
          this.sideDialog.hide();
        }
      })
    );
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
  }
}

