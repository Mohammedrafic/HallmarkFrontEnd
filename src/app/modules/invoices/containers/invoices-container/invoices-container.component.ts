import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PageOfCollections } from '@shared/models/page.model';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { Destroyable } from '@core/helpers';

import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import {
  GroupInvoicesBy,
  Invoice,
  InvoicePage,
  InvoiceRecord,
  InvoicesTableConfig,
  PagingQueryParams
} from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { INVOICES_TAB_CONFIG } from '../../constants/invoices.constant';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { InvoiceRecordsTableComponent } from '../../components/invoice-records-table/invoice-records-table.component';
import { DialogAction } from '../../../timesheets/enums';
import { InvoicesService } from '../../services/invoices.service';
import { AllInvoicesTableComponent } from '../../components/all-invoices-table/all-invoices-table.component';
import { InvoicesState } from '../../store/state/invoices.state';

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

  @Select(InvoicesState.invoicesData)
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
    this.store.dispatch(new Invoices.Get({
      pageSize: 30,
      page: 1,
      type: ''
    }));
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
  }
}

