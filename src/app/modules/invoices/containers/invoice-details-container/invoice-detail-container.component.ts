import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input,
  OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { Observable, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';

import { InvoicesState } from '../../store/state/invoices.state';
import { Invoice } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { TimesheetDetails } from '../../../timesheets/store/actions/timesheet-details.actions';
import { ExportPayload } from '@shared/models/export.model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { INVOICES_STATUSES } from '../../enums/invoices.enum';
import { DialogAction } from '@core/enums';

interface ExportOption extends ItemModel {
  ext: string | null;
}

@Component({
  selector: 'app-invoice-detail-container',
  templateUrl: './invoice-detail-container.component.html',
  styleUrls: ['./invoice-detail-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailContainerComponent extends Destroyable implements OnInit, OnChanges {
  // @Select(InvoicesState.isInvoiceDetailDialogOpen)
  // isInvoiceDetailDialogOpen$: Observable<DialogActionPayload>;

  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() currentSelectedRowIndex: number | null = null;
  @Input() maxRowIndex: number = 30;

  @Output() updateTable: EventEmitter<void> = new EventEmitter<void>();
  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  @Select(InvoicesState.nextInvoiceId)
  public nextId$: Observable<string>;

  @Select(InvoicesState.prevInvoiceId)
  public prevId$: Observable<string>;

  public invoiceData: Invoice;
  public isNextDisabled = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private chipPipe: ChipsCssClass,
    private store: Store,
  ) {
    super();
  }

  public get isApproveDisable(): boolean {
    return this.invoiceData?.statusText === INVOICES_STATUSES.PENDING_PAYMENT;
  }

  ngOnInit(): void {
    this.getDialogState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentSelectedRowIndex'] && !changes['currentSelectedRowIndex'].firstChange) {
      this.isNextDisabled = this.currentSelectedRowIndex === (this.maxRowIndex - 1);
    }
  }

  public handleProfileClose(): void {
    this.store.dispatch(new Invoices.ToggleInvoiceDialog(DialogAction.Close)).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.sideDialog.hide();
    });
  }

  public export(event: { item: { properties: ExportOption } }): void {
    const fileTypeId = event.item.properties.id as unknown as ExportedFileType;

    this.store.dispatch(new TimesheetDetails.Export(
      new ExportPayload(fileTypeId)
    ));
  }

  public handleApprove(): void {
    this.invoiceData.statusText = INVOICES_STATUSES.PENDING_PAYMENT;
    localStorage.setItem('selected_invoice_row', JSON.stringify(this.invoiceData));
    this.chipList.cssClass = this.chipPipe.transform(this.invoiceData.statusText);
    const oldInvoices = JSON.parse(`${ localStorage.getItem('invoices') }`);
    const newInvoices = Object.assign({}, oldInvoices, {
      items: oldInvoices.items.map((el: any) => ({
        ...el,
        ...(el.id === this.invoiceData.id && { statusText: INVOICES_STATUSES.PENDING_PAYMENT }),
      })),
    });
    localStorage.setItem('invoices', JSON.stringify(newInvoices));
    this.updateTable.emit();
    this.cdr.detectChanges();
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
    this.cdr.detectChanges();
  }

  private getDialogState(): void {
    // this.isInvoiceDetailDialogOpen$
    //   .pipe(
    //     throttleTime(100),
    //     filter((val) => val.dialogState),
    //     takeUntil(this.componentDestroy())
    //   )
    //   .subscribe((payload) => {
    //     this.invoiceData = JSON.parse(localStorage.getItem('selected_invoice_row') as string);
    //     this.chipList.cssClass = this.chipPipe.transform(this.invoiceData.statusText);

    //     if (payload.dialogState && typeof payload.id === 'number') {
    //       this.sideDialog.show();
    //     } else {
    //       this.sideDialog.hide();
    //     }
    //     this.cdr.detectChanges();
    //   });
  }
}
