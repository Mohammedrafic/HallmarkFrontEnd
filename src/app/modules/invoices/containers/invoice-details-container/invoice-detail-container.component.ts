import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
  Input, OnInit, Output, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { map, Observable, takeUntil, throttleTime } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ColDef, GridOptions } from '@ag-grid-community/core';
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { DialogAction } from '@core/enums';
import { Destroyable } from '@core/helpers';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportPayload } from '@shared/models/export.model';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import {
  ActionBtnOnStatus, AgencyActionBtnOnStatus,
  NewStatusDependsOnAction
} from '../../constants/invoice-detail.constant';
import { InvoiceState, INVOICES_STATUSES, InvoicesActionBtn } from '../../enums';
import { InvoiceDetail, InvoiceDialogActionPayload, InvoiceUpdateEmmit, PrintingPostDto } from '../../interfaces';
import { InvoicePrintingService } from '../../services';
import { InvoicesContainerService } from '../../services/invoices-container/invoices-container.service';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesState } from '../../store/state/invoices.state';
import { InvoicesModel } from './../../store/invoices.model';

interface ExportOption extends ItemModel {
  ext: string | null;
}

@Component({
  selector: 'app-invoice-detail-container',
  templateUrl: './invoice-detail-container.component.html',
  styleUrls: ['./invoice-detail-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailContainerComponent extends Destroyable implements OnInit {
  @Select(InvoicesState.isInvoiceDetailDialogOpen)
  isInvoiceDetailDialogOpen$: Observable<InvoiceDialogActionPayload>;

  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() currentSelectedRowIndex: number | null = null;
  @Input() maxRowIndex: number = 30;
  @Input() actionAllowed = true;
  @Input() approveAllowed = false;
  @Input() payAllowed = false;

  @Output() updateTable: EventEmitter<InvoiceUpdateEmmit> = new EventEmitter<InvoiceUpdateEmmit>();

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  @Select(InvoicesState.nextInvoiceId)
  public nextId$: Observable<number | null>;

  @Select(InvoicesState.prevInvoiceId)
  public prevId$: Observable<number | null>;

  public invoiceDetail: InvoiceDetail;
  public isLoading: boolean;
  public columnDefinitions: ColDef[] = [];
  public columnSummaryDefinitions: ColDef[] = [];
  public gridOptions: GridOptions = {};
  public gridSummaryOptions: GridOptions = {};
  public isAgency: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private chipPipe: ChipsCssClass,
    private store: Store,
    private invoicesContainerService: InvoicesContainerService,
    private printingService: InvoicePrintingService,
    private chipsCssClass: ChipsCssClass,
  ) {
    super();
  }

  public get actionBtnDisabled(): boolean {
    if (!this.actionAllowed) {
      return true;
    }

    if (this.actionBtnText === InvoicesActionBtn.Approve) {
      return !this.approveAllowed;
    } else {
      return !this.payAllowed;
    }
  }

  public get actionBtnText(): string {
    const status = this.invoiceDetail.meta.invoiceStateText.toLowerCase() as INVOICES_STATUSES;
    let result: string;

    if (this.isAgency) {
      const permission = (this.store.snapshot().invoices as InvoicesModel).permissions.agencyCanPay || this.actionAllowed;
      result = permission && this.payAllowed ? AgencyActionBtnOnStatus.get(status) as string : '';
    } else {
      result = ActionBtnOnStatus.get(status) as string;
    }

    return result || '';
  }

  ngOnInit(): void {
    this.getDialogState();
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

    this.store.dispatch(new Invoices.DetailExport(
      new ExportPayload(fileTypeId)
    ));
  }

  public handlePrint(): void {
    const dto: PrintingPostDto = this.isAgency ? {
      invoiceIds: [this.invoiceDetail.meta.invoiceId],
      organizationIds: [this.invoiceDetail.meta.organizationIds[0]],
    } : {
      invoiceIds: [this.invoiceDetail.meta.invoiceId],
    };

    this.store.dispatch(new Invoices.GetPrintData(dto, this.isAgency))
      .pipe(
        filter((state) => !!state.invoices.printData),
        map((state) => state.invoices.printData),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((data) => {
        if (this.isAgency) {
          this.printingService.printAgencyInvoice(data);
        } else {
          this.printingService.printInvoice(data);
        }
      });
  }

  public handleApprove(): void {
    this.updateTable.emit({
      invoiceId: this.invoiceDetail.meta.invoiceId,
      status: NewStatusDependsOnAction.get(this.actionBtnText) as InvoiceState,
      ...(this.isAgency && {
        organizationId: this.invoiceDetail.meta.organizationIds[0],
      }),
    });
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
    this.cdr.detectChanges();
  }

  private getDialogState(): void {
    this.isInvoiceDetailDialogOpen$
      .pipe(
        throttleTime(100),
        filter(() => !!this.sideDialog),
        takeUntil(this.componentDestroy())
      )
      .subscribe((payload) => {
        if (payload.dialogState) {
          this.sideDialog.show();
          this.invoiceDetail = payload.invoiceDetail as InvoiceDetail;
          if (payload.invoiceDetail) {
            this.initTableColumns(this.invoiceDetail.summary[0]?.locationName || '');
            if (this.chipList) {
              this.chipList.cssClass = this.chipsCssClass.transform(this.invoiceDetail.meta.invoiceStateText);
              this.chipList.text = this.invoiceDetail.meta.invoiceStateText.toUpperCase();
            }
          }
        } else {
          this.sideDialog.hide();
        }
        this.cdr.detectChanges();
      });
  }

  private initTableColumns(summaryLocation: string): void {
    this.columnDefinitions = this.invoicesContainerService.getDetailColDef();
    this.columnSummaryDefinitions = this.invoicesContainerService.getDetailSummaryColDef(summaryLocation);
    this.isAgency = this.invoicesContainerService.isAgency();
  }
}
