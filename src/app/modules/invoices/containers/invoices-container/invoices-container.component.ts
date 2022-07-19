import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable, of, takeUntil } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { PageOfCollections } from '@shared/models/page.model';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { Destroyable } from '@core/helpers';

import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import { Invoice, InvoicePage, InvoiceRecord, InvoicesTableConfig, PagingQueryParams } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { DEFAULT_ALL_INVOICES, INVOICES_TAB_CONFIG } from '../../constants/invoices.constant';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { InvoiceRecordsTableComponent } from '../../components/invoice-records-table/invoice-records-table.component';
import { INVOICES_STATUSES } from '../../enums/invoices.enum';
import { DialogAction } from '../../../timesheets/enums';
import { InvoicesService } from '../../services/invoices.service';
import { AllInvoicesTableComponent } from '../../components/all-invoices-table/all-invoices-table.component';

const defaultPagingData: PageOfCollections<unknown> = {
  totalPages: 1,
  pageNumber: 1,
  hasPreviousPage: false,
  hasNextPage: false,
  totalCount: 1,
  items: [],
};

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesContainerComponent extends Destroyable {
  public readonly tabsConfig: TabsListConfig[] = INVOICES_TAB_CONFIG;
  public selectedTabIdx: number = 0;

  public readonly tableConfig: InvoicesTableConfig = {
    onPageChange: this.onPageChange.bind(this),
    onPageSizeChange: this.onPageSizeChange.bind(this),
  };

  public readonly formGroup: FormGroup = this.fb.group({
    search: ['']
  });

  // @Select(InvoicesState.invoicesData)
  public invoiceRecordsData$: Observable<PageOfCollections<InvoiceRecord>>;

  public allInvoices: InvoicePage;

  public get dateControl(): FormControl {
    return this.formGroup.get('date') as FormControl;
  }

  public fieldValues: {text: 'text', value: 'value'};
  public invoicesGroupByOptions: (ItemModel & {value: GroupInvoicesBy})[] = [
    {
      text: 'Location',
      id: 'location',
      value: 'location',
    },
    {
      text: 'Department',
      id: 'department',
      value: 'location',
    }
  ];
  public invoiceRecords: PageOfCollections<InvoiceRecord>;

  public groupInvoicesBy: GroupInvoicesBy = this.invoicesGroupByOptions[0].value;

  @ViewChild('createInvoiceDialog')
  public createInvoiceDialog: DialogComponent;

  @ViewChild('invoiceRecordsTable')
  public invoiceRecordsTable: InvoiceRecordsTableComponent;

  @ViewChild('allInvoicesTable')
  public allInvoicesTable: AllInvoicesTableComponent;

  public currentSelectedTableRowIndex: Observable<number>
    = this.invoicesService.getCurrentTableIdxStream();
  public pageSize = 30;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private invoicesService: InvoicesService,
  ) {
    super();
    this.store.dispatch(new SetHeaderState({ iconName: 'dollar-sign', title: 'Invoices' }));
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onExportOptionSelect(event: unknown): void {
  }

  public handleChangeTab(tabIdx: number): void {
    this.selectedTabIdx = tabIdx;
    this.getInvoicesByTab();
  }

  private onPageChange(page: number): void {
    this.updateQueryParams({
      page,
    });
  }

  private onPageSizeChange(pageSize: number): void {
    this.updateQueryParams({
      pageSize: pageSize,
    });
  }

  private updateQueryParams(params: Partial<PagingQueryParams>): void {
    this.route.queryParams.subscribe((currentParams: Params) => this.router.navigate([], {
      queryParams: {
        ...currentParams,
        ...params,
      },
    }));
  }

  public onInvoiceGrouping({itemData: {id}}: {itemData: {id: GroupInvoicesBy}}): void {
    this.groupInvoicesBy = id;
  }

  public handleRowSelected(selectedRowData: {rowIndex: number; data: Invoice}): void {
    this.invoicesService.setCurrentSelectedIndexValue(selectedRowData.rowIndex);
    localStorage.setItem('selected_invoice_row', JSON.stringify(selectedRowData.data));
    const prevId: string = this.allInvoices.items[selectedRowData.rowIndex - 1]?.id;
    const nextId: string = this.allInvoices.items[selectedRowData.rowIndex + 1]?.id;

    this.store.dispatch(
      new Invoices.ToggleInvoiceDialog(
        DialogAction.Open,
        selectedRowData.rowIndex,
        prevId,
        nextId
    ));
    this.cdr.markForCheck();
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    this.invoicesService.setNextValue(next);
    const index = this.invoicesService.getNextIndex();
    this.allInvoicesTable.selectRow(index);

    this.cdr.markForCheck();
  }

  public handleUpdateTable(): void {
    this.getInvoicesByTab();
  }

  private getInvoicesByTab(): void {
    const invoices = JSON.parse(`${localStorage.getItem('invoices')}`) || DEFAULT_ALL_INVOICES;

    switch (this.selectedTabIdx) {
      case 0: {
        console.log(0);
        break;
      }
      case 1: {
        this.allInvoices = invoices;

        break;
      }
      case 2: {
        this.allInvoices = this.filterByStatus(invoices, INVOICES_STATUSES.SUBMITED_PEND_APPR);

        break;
      }
      case 3: {
        this.allInvoices = this.filterByStatus(invoices, INVOICES_STATUSES.PENDING_PAYMENT);

        break;
      }
      case 4: {
        this.allInvoices = this.filterByStatus(invoices, INVOICES_STATUSES.PAID);

        break;
      }
    }
  }

  private filterByStatus(invoicePage: InvoicePage, status: INVOICES_STATUSES): InvoicePage {
    return {
      ...invoicePage,
      items: invoicePage.items.filter(el => el.statusText === status),
    };
  }

  private restoreInvoiceRecords(data: TimesheetData[]) {}
}

type GroupInvoicesBy = keyof Pick<InvoiceRecord, 'location' | 'department'>;

interface TimesheetData {
  orgName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  location: string;
  department: string;
  skill: string;
  billRate: number;
  startDate: string;
  id: number;
}

function getRandomNumberInRange(from: number, to: number): number {
  return Math.floor(Math.random() * (to - from) + from);
}
