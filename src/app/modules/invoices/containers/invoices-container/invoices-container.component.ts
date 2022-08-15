import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import {distinctUntilChanged, filter, forkJoin, Observable, switchMap, takeUntil} from 'rxjs';

import { PageOfCollections } from '@shared/models/page.model';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { Destroyable } from '@core/helpers';
import { DialogAction } from '@core/enums';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import {
  GroupInvoicesBy,
  Invoice,
  InvoicePage,
  InvoiceRecord,
  InvoicesFilterState,
  InvoicesTableConfig,
  PagingQueryParams
} from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { INVOICES_TAB_CONFIG } from '../../constants';
import { InvoiceRecordsTableComponent } from '../../components/invoice-records-table/invoice-records-table.component';
import { InvoicesService } from '../../services';
import { AllInvoicesTableComponent } from '../../components/all-invoices-table/all-invoices-table.component';
import { InvoicesState } from '../../store/state/invoices.state';
import { UNIT_ORGANIZATIONS_FIELDS } from 'src/app/modules/timesheets/constants';
import { DataSourceItem } from '@core/interface';

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesContainerComponent extends Destroyable implements OnInit {
  @Select(InvoicesState.invoicesData)
  public invoiceRecordsData$: Observable<PageOfCollections<InvoiceRecord>>;

  @Select(InvoicesState.invoicesOrganizations)
  readonly organizations$: Observable<DataSourceItem[]>;

  @ViewChild('createInvoiceDialog')
  public createInvoiceDialog: DialogComponent;

  @ViewChild('invoiceRecordsTable')
  public invoiceRecordsTable: InvoiceRecordsTableComponent;

  @ViewChild('allInvoicesTable')
  public allInvoicesTable: AllInvoicesTableComponent;

  public readonly tabsConfig: TabsListConfig[] = INVOICES_TAB_CONFIG;
  public selectedTabIdx = 0;
  public appliedFiltersAmount = 0;

  public readonly tableConfig: InvoicesTableConfig = {
    onPageChange: this.onPageChange.bind(this),
    onPageSizeChange: this.onPageSizeChange.bind(this),
  };

  public readonly organizationControl: FormControl = new FormControl(null);

  public allInvoices: InvoicePage;

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

  public currentSelectedTableRowIndex: Observable<number>
    = this.invoicesService.getCurrentTableIdxStream();
  public pageSize = 30;

  public isAgency = false;

  public readonly unitOrganizationsFields = UNIT_ORGANIZATIONS_FIELDS;

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
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
  }

  ngOnInit(): void {
    if (this.isAgency) {
      this.initOrganizationsList();
      this.startOrganizationWatching();
    }
    this.initFilters();
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

  public openAddDialog(): void {
    this.store.dispatch(new Invoices.ToggleManualInvoiceDialog(DialogAction.Open));
    this.store.dispatch(new Invoices.GetInvoicesReasons(this.organizationControl.value));
  }

  public changeFiltersAmount(amount: number): void {
    this.appliedFiltersAmount = amount;
  }

  public resetFilters(): void {
    this.store.dispatch(new Invoices.UpdateFiltersState(null));
  }

  public updateTableByFilters(filters: InvoicesFilterState): void {
    this.store.dispatch(new Invoices.UpdateFiltersState({ ...filters }));
    this.store.dispatch(new ShowFilterDialog(false));
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

  private getInvoicesByTab(): void {
  }

  private initFilters(): void {
    this.store.dispatch([
      new Invoices.UpdateFiltersState(),
      new Invoices.GetFiltersDataSource()
    ]);
  }

  private startOrganizationWatching(): void {
    this.organizationControl.valueChanges.pipe(
      filter(Boolean),
      distinctUntilChanged(),
      switchMap((organizationId: number) => this.store.dispatch(
        [
          new Invoices.SelectOrganization(organizationId),
        ]
      )),
      takeUntil(this.componentDestroy()),
    ).subscribe();
  }

  private initOrganizationsList(): void {
    this.store.dispatch(new Invoices.GetOrganizations())
    .pipe(
      switchMap(() => this.organizations$.pipe(
        filter((res: DataSourceItem[]) => !!res.length),
      )),
      takeUntil(this.componentDestroy()),
    ).subscribe(res => {
      this.organizationControl.setValue(res[0].id, { emitEvent: false });
      this.store.dispatch(new Invoices.SelectOrganization(res[0].id),
      )
    });
  }
}

