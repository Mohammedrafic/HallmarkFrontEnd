import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";

import { Store } from "@ngxs/store";
import { Observable, of, takeUntil } from "rxjs";
import { map } from "rxjs/operators";

import { PageOfCollections } from "@shared/models/page.model";
import { TabsListConfig } from "@shared/components/tabs-list/tabs-list-config.model";
import { Destroyable } from "@core/helpers";

import { SetHeaderState, ShowFilterDialog } from "../../../../store/app.actions";
import { InvoicePage, InvoiceRecord, InvoicesTableConfig, PagingQueryParams } from '../../interfaces';
import { Invoices } from "../../store/actions/invoices.actions";
import { ProfileTimeSheetDetail } from "../../../timesheets/store/model/timesheets.model";
import { INVOICES_TAB_CONFIG, MOK_ALL_INVOICES_PAGE } from '../../constants/invoices.constant';

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

  public allInvoices: InvoicePage = MOK_ALL_INVOICES_PAGE;

  public get dateControl(): FormControl {
    return this.formGroup.get('date') as FormControl;
  }

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

    this.invoicesData$ = of(JSON.parse(localStorage.getItem('submited-timsheets') as string)).pipe(
      map((v: PageOfCollections<{
        orgName: string,
        firstName: string,
        lastName: string;
        jobTitle: string;
        location: string;
        department: string;
        skill: string;
        billRate: number;
        startDate: string;
        timesheets: {
          [key: number]: ProfileTimeSheetDetail[],
        },
        id: number,
      }>) => {
        return {
          ...v,
          items: v.items.map(({
                              orgName,
                              location,
                              department,
                              skill,
                              jobTitle,
                              firstName,
                              lastName,
                              billRate,
                              startDate,
                              timesheets,
                              id,
                            }) => {
            const timehseetDetails = timesheets[id];
            const hours = timehseetDetails.reduce((acc, item) => acc + item.hours, 0);
            const amount = timehseetDetails.reduce((acc, item) => acc + item.hours * item.rate, 0);

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
            } as InvoiceRecord;
          })
        };
      })
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
        console.log(1);
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
}
