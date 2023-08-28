import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input,
  OnInit, Output, ViewChild
} from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { ColDef, GridOptions } from '@ag-grid-community/core';
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { map, Observable, takeUntil, throttleTime } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { DialogAction } from '@core/enums';
import { Destroyable } from '@core/helpers';
import { GRID_CONFIG } from '@shared/constants';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportPayload } from '@shared/models/export.model';
import { ChipsCssClass } from '@shared/pipes/chip-css-class/chips-css-class.pipe';
import {
  ActionBtnOnStatus, AgencyActionBtnOnStatus,
  NewStatusDependsOnAction
} from '../../constants/invoice-detail.constant';
import { InvoicesActionBtn, InvoiceState, INVOICES_STATUSES, PaymentDialogTitle } from '../../enums';
import {
  ExportOption, InvoiceDetail, InvoiceDetailsSettings,
  InvoiceDialogActionPayload, InvoicePaymentData, InvoiceUpdateEmmit, PrintingPostDto
} from '../../interfaces';
import { InvoicePrintingService } from '../../services';
import { InvoicesContainerService } from '../../services/invoices-container/invoices-container.service';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesModel } from '../../store/invoices.model';
import { InvoicesState } from '../../store/state/invoices.state';
import { BreakpointObserverService } from '@core/services';
import { ItemModel, MenuEventArgs } from '@syncfusion/ej2-angular-navigations';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { MobileMenuItems } from '@shared/enums/mobile-menu-items.enum';
import { MiddleTabletScreenWidth } from '../../constants';


@Component({
  selector: 'app-invoice-detail-container',
  templateUrl: './invoice-detail-container.component.html',
  styleUrls: ['./invoice-detail-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailContainerComponent extends Destroyable implements OnInit {
  @ViewChild('chipList') chipList: ChipListComponent;
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() currentSelectedRowIndex: number | null = null;
  @Input() maxRowIndex: number = GRID_CONFIG.initialRowsPerPage;
  @Input() actionAllowed = true;
  @Input() approveAllowed = false;
  @Input() payAllowed = false;
  @Input() payButton = false;


  @Output() updateTable: EventEmitter<InvoiceUpdateEmmit> = new EventEmitter<InvoiceUpdateEmmit>();

  @Output() nextPreviousOrderEvent = new EventEmitter<boolean>();

  @Select(InvoicesState.nextInvoiceId)
  public nextId$: Observable<number | null>;

  @Select(InvoicesState.prevInvoiceId)
  public prevId$: Observable<number | null>;

  @Select(InvoicesState.isInvoiceDetailDialogOpen)
  isInvoiceDetailDialogOpen$: Observable<InvoiceDialogActionPayload>;

  public invoiceDetail: InvoiceDetail;
  public isLoading: boolean;
  public columnDefinitions: ColDef[] = [];
  public columnSummaryDefinitions: ColDef[] = [];
  public gridOptions: GridOptions = {};
  public gridSummaryOptions: GridOptions = {};
  public isAgency: boolean;
  public actionBtnText = '';
  public readonly invoiceDetailsConfig: InvoiceDetailsSettings = {
    isActionBtnDisabled: false,
    paymentDetailsOpen: false,
    addPaymentOpen: false,
    isTablet: false,
    isMiddleTabletWidth: false,
    isMobile: false,
  };

  public paymentRecords: InvoicePaymentData[] = [];

  public editCheckNumber: string | null;

  public paymentDialogTitle = PaymentDialogTitle.Add;

  private resizeObserver: ResizeObserverModel;

  public targetElement: HTMLElement | null = document.body.querySelector('#main');

  public mobileMenuOptions: ItemModel[] = [
    { text: MobileMenuItems.Print, id: '0' },
  ];


  constructor(
    private cdr: ChangeDetectorRef,
    private chipPipe: ChipsCssClass,
    private store: Store,
    private invoicesContainerService: InvoicesContainerService,
    private printingService: InvoicePrintingService,
    private chipsCssClass: ChipsCssClass,
    private breakpointObserver: BreakpointObserverService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isAgency = this.invoicesContainerService.isAgency();
    this.getDialogState();
    this.getDeviceTypeResolution();
    this.initResizeObserver();
    this.listenResizeContent();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.resizeObserver.detach();
  }

  public closeInvoiceDetails(): void {
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

  public printInvoice(): void {
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

  public changeInvoiceStatus(): void {
    const invoiceState = this.invoiceDetail.meta.invoiceState;
    const isPendingPayment = invoiceState === InvoiceState.PendingPayment;
    const isSubmittedPendingApproval = invoiceState === InvoiceState.SubmittedPendingApproval;
    if (isPendingPayment || (isSubmittedPendingApproval && this.isAgency)) {
      this.openAddPayment();
    } else {
      this.updateTable.emit({
        invoiceId: this.invoiceDetail.meta.invoiceId,
        status: NewStatusDependsOnAction.get(this.actionBtnText) as InvoiceState,
        ...(this.isAgency && {
          organizationId: this.invoiceDetail.meta.organizationIds[0],
        }),
      });
    }
  }

  public onNextPreviousOrder(next: boolean): void {
    this.nextPreviousOrderEvent.emit(next);
    this.cdr.detectChanges();
  }

  public openPaymentDetails(): void {
    this.invoiceDetailsConfig.paymentDetailsOpen = true;
    this.cdr.markForCheck();
  }

  public closePaymentDetails(): void {
    this.invoiceDetailsConfig.paymentDetailsOpen = false;
    this.cdr.markForCheck();
  }

  public openAddPayment(): void {
    this.paymentDialogTitle = PaymentDialogTitle.Add;
    this.createPaymentRecords();
    this.invoiceDetailsConfig.addPaymentOpen = true;
    this.cdr.markForCheck();
  }

  public openEditPayment(id: string): void {
    this.paymentDialogTitle = PaymentDialogTitle.Edit;
    this.createPaymentRecords();
    this.editCheckNumber = id;
    this.invoiceDetailsConfig.addPaymentOpen = true;
    this.cdr.markForCheck();
  }

  public closeAddPayment(): void {
    this.paymentRecords.length = 0;
    this.invoiceDetailsConfig.addPaymentOpen = false;
    this.editCheckNumber = null;
    this.cdr.markForCheck();
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
            this.setInvoiceData();
          }
        } else {
          this.sideDialog.hide();
        }
        this.cdr.detectChanges();
      });
  }

  private initTableColumns(): void {
    this.columnDefinitions = this.invoicesContainerService.getDetailColDef();
    this.columnSummaryDefinitions = this.invoicesContainerService.getDetailSummaryColDef();
  }

  private checkActionBtnDisabled(): boolean {
    if (!this.actionAllowed) {
      return true;
    }

    if (this.actionBtnText === InvoicesActionBtn.Approve) {
      return !this.approveAllowed;
    } else {
      return !this.payAllowed;
    }
  }

  private setActionBtnText(): void {
    const status = this.invoiceDetail.meta.invoiceStateText.toLowerCase() as INVOICES_STATUSES;
    let result: string;

    if (this.isAgency) {
      const permission = (this.store.snapshot().invoices as InvoicesModel).permissions.agencyCanPay || this.actionAllowed;
      result = permission && this.payAllowed ? AgencyActionBtnOnStatus.get(status) as string : '';
    } else {
      result = ActionBtnOnStatus.get(status) as string;
    }   
    if (result.trim() !== InvoicesActionBtn.Approve || result === undefined) {
      if (!this.payButton) {
        result = '';
      }
    }
    this.actionBtnText = result || '';
  }

  private createPaymentRecords(): void {
    this.paymentRecords = [];
    this.paymentRecords.push({
      invoiceId: this.invoiceDetail.meta.invoiceId,
      invoiceNumber: this.invoiceDetail.meta.formattedInvoiceNumber,
      amount: this.invoiceDetail.totals.amountToPay,
      agencySuffix: this.invoiceDetail.meta.agencySuffix,
    });
  }

  private setInvoiceData(): void {
    this.setActionBtnText();
    this.invoiceDetailsConfig.isActionBtnDisabled = this.checkActionBtnDisabled();
    this.initTableColumns();

    if (this.chipList) {
      this.chipList.cssClass = this.chipsCssClass.transform(this.invoiceDetail.meta.invoiceStateText);
      this.chipList.text = this.invoiceDetail.meta.invoiceStateText.toUpperCase();
    }
  }

  private getDeviceTypeResolution(): void {
    this.breakpointObserver.getBreakpointMediaRanges()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(({ isTablet, isMobile }) => {
        this.invoiceDetailsConfig.isTablet = isTablet;
        this.invoiceDetailsConfig.isMobile = isMobile;
        this.cdr.markForCheck();
      });
  }

  public onSelectMenuItem({ item: { text } }: MenuEventArgs): void {
    if (text === MobileMenuItems.Print) {
      this.printInvoice();
    }
  }

  private initResizeObserver(): void {
    this.resizeObserver = ResizeObserverService.init(this.targetElement!);
  }

  private listenResizeContent(): void {
    this.resizeObserver.resize$
      .pipe(
        filter(() => this.invoiceDetailsConfig.isTablet),
        map((data) => data[0].contentRect.width),
        distinctUntilChanged(),
        takeUntil(this.componentDestroy())
      )
      .subscribe((contentWidth) => {
        this.invoiceDetailsConfig.isMiddleTabletWidth = contentWidth <= MiddleTabletScreenWidth;
        this.cdr.markForCheck();
      });
  }

  public onOpen(args: { preventFocus: boolean }): void {
    args.preventFocus = true;
  }
}
