import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";

import { Store } from "@ngxs/store";
import { Observable, of, takeUntil } from "rxjs";
import { map, tap } from "rxjs/operators";

import { PageOfCollections } from "@shared/models/page.model";
import { TabsListConfig } from "@shared/components/tabs-list/tabs-list-config.model";
import { Destroyable } from "@core/helpers";

import { SetHeaderState, ShowFilterDialog } from "../../../../store/app.actions";
import { Invoice, InvoicePage, InvoiceRecord, InvoicesTableConfig, PagingQueryParams } from '../../interfaces';
import { Invoices } from "../../store/actions/invoices.actions";
import { ProfileTimeSheetDetail, TimesheetDetails } from "../../../timesheets/store/model/timesheets.model";
import { DEFAULT_ALL_INVOICES, INVOICES_TAB_CONFIG } from '../../constants/invoices.constant';
import { ItemModel } from "@syncfusion/ej2-angular-navigations";
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { InvoiceRecordsTableComponent } from "../../components/invoice-records-table/invoice-records-table.component";
import { INVOICES_STATUSES } from '../../enums/invoices.enum';

const defaultPagingData: Omit<PageOfCollections<unknown>, 'items'> = {
  totalPages: 1,
  pageNumber: 1,
  hasPreviousPage: false,
  hasNextPage: false,
  totalCount: 1,
};

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesContainerComponent extends Destroyable implements OnInit {
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
  public invoicesData$: Observable<PageOfCollections<InvoiceRecord>>;

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

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super();
    route.queryParams.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(({page = 1, pageSize = 30}: Params) => {
      this.store.dispatch(new Invoices.Get({
        page: +page,
        pageSize: +pageSize,
        type: '',
      }));
    });

    this.invoicesData$ = of(
      JSON.parse(localStorage.getItem('APPROVED_TIMESHEETS') as string)
    ).pipe(
      map((v: PageOfCollections<TimesheetData>) => {
        const existingRecords: PageOfCollections<InvoiceRecord> = JSON.parse(
          localStorage.getItem('invoice-records') as string
        );

        return {
          ...v,
          items: [...this.restoreInvoiceRecords(v.items), ...(existingRecords?.items || [])],
        };
      })
    ).pipe(
      tap((recordsData) => {
        this.invoiceRecords = recordsData;

        localStorage.setItem('invoice-records', JSON.stringify({
          ...defaultPagingData,
          items: recordsData.items,
          totalCount: recordsData.items.length,
        } as PageOfCollections<InvoiceRecord>));

        localStorage.setItem('APPROVED_TIMESHEETS', JSON.stringify(
            {
              ...defaultPagingData,
              items: [],
            } as PageOfCollections<unknown>
          )
        );
      }),
    );
  }

  public ngOnInit(): void {
    this.store.dispatch(new SetHeaderState({ iconName: 'dollar-sign', title: 'Invoices' }));
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onExportOptionSelect(event: unknown): void {
  }

  public handleChangeTab(tabIdx: number): void {
    this.selectedTabIdx = tabIdx;
    switch (tabIdx) {
      case 0: {
        console.log(0);
        break;
      }
      case 1: {
        this.allInvoices = JSON.parse(`${localStorage.getItem('invoices')}`) || DEFAULT_ALL_INVOICES;

        break;
      }
      case 2: {
        console.log(2);
        break;
      }
      case 3: {
        console.log(2);
        break;
      }
    }
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

  public createInvoices(items: InvoiceRecord[] = []): void {
    const [{organization, location, department, candidate}] = this.invoiceRecords.items;
    const groups = items.reduce<string[]>((acc: string[], value: InvoiceRecord) => {
      const groupByValue: string = value[this.groupInvoicesBy];
      return acc.includes(groupByValue) ? acc : [...acc, groupByValue];
    }, []);

    const groupedInvoices = groups.map<Invoice>((groupName: string) => {
      const groupInvoices = items.filter((record) => record[this.groupInvoicesBy] === groupName);
      const issuedDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(issuedDate.getDate() + 2);

      return {
        groupBy: this.groupInvoicesBy,
        groupName: groupName,
        id: `${getRandomNumberInRange(20, 24)}-${getRandomNumberInRange(25, 30)}-${getRandomNumberInRange(300, 500)}`,
        organization,
        location,
        department,
        candidate,
        amount: groupInvoices.reduce((acc, value) => acc + value.amount, 0),
        type: 'Interfaced',
        invoices: groupInvoices,
        issuedDate,
        dueDate,
        statusText: INVOICES_STATUSES.SUBMITED_PEND_APPR,
      } as Invoice;
    });

    const filterIds = items.map(item => item.timesheetId);
    const filteredInvoiceRecords = this.invoiceRecords.items.filter(item => !filterIds.includes(item.timesheetId));

    this.invoicesData$ = of({
      ...this.invoiceRecords,
      items: filteredInvoiceRecords,
    });

    const storeData: PageOfCollections<Invoice> = {
      ...defaultPagingData,
      items: groupedInvoices,
    };

    localStorage.setItem('invoices', JSON.stringify(storeData));
    localStorage.setItem('pending-invoices', JSON.stringify(storeData));
    localStorage.setItem('invoice-records', JSON.stringify({
      ...defaultPagingData,
      items: filteredInvoiceRecords,
    } as PageOfCollections<InvoiceRecord>));

    this.createInvoiceDialog?.hide();
  }

  private restoreInvoiceRecords(data: TimesheetData[]): InvoiceRecord[] {
    return data.map(({
                       orgName,
                       location,
                       department,
                       skill,
                       jobTitle,
                       firstName,
                       lastName,
                       billRate,
                       startDate,
                       id: timesheetId,
                     }: TimesheetData
    ) => {
      const timesheetDetailsTables = JSON.parse(
        localStorage.getItem('timesheet-details-tables') as string
      ) as {[key: number]: ProfileTimeSheetDetail[]};

      const timehseetDetails = timesheetDetailsTables[timesheetId] || [];
      const hours = timehseetDetails.reduce((acc, item) => acc + item.hours, 0);
      const amount = timehseetDetails.reduce((acc, item) => acc + item.hours * item.rate, 0);
      const rates = timehseetDetails.map((v) => v.rate).sort();

      return {
        organization: orgName,
        location,
        department,
        skill,
        jobTitle,
        candidate: `${lastName}, ${firstName}`,
        bonus: 0,
        rate: billRate,
        startDate,
        amount: amount,
        hours: hours,
        minRate: rates[0],
        maxRate: rates[rates.length - 1],
        timesheetId,
      } as InvoiceRecord;
    })
  }

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
