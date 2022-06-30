import { Component, OnInit } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { SetHeaderState, ShowFilterDialog } from "../../../../store/app.actions";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Observable, takeUntil } from "rxjs";
import { PageOfCollections } from "@shared/models/page.model";
import { InvoiceRecord, InvoicesTableConfig, PagingQueryParams } from "../../interfaces";
import { TabsListConfig } from "@shared/components/tabs-list/tabs-list-config.model";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Invoices } from "../../store/actions/invoices.actions";
import { InvoicesState } from "../../store/state/invoices.state";
import { Destroyable } from "@core/helpers";

@Component({
  selector: 'app-invoices-container',
  templateUrl: './invoices-container.component.html',
  styleUrls: ['./invoices-container.component.scss']
})
export class InvoicesContainerComponent extends Destroyable implements OnInit {
  public readonly tabsConfig: TabsListConfig[] = [
    {
      title: 'Invoice Records',
    },
    {
      title: 'All Invoices'
    },
    {
      title: 'Pending Approval'
    },
    {
      title: 'Pending',
      amount: 2,
    },
    {
      title: 'Paid',
    }
  ];

  public readonly tableConfig: InvoicesTableConfig = {
    onPageChange: this.onPageChange.bind(this),
    onPageSizeChange: this.onPageSizeChange.bind(this),
  };

  public readonly formGroup: FormGroup = this.fb.group({
    search: ['']
  });

  @Select(InvoicesState.invoicesData)
  public invoicesData$: Observable<PageOfCollections<InvoiceRecord>>;

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
  }

  public ngOnInit(): void {
    this.store.dispatch(new SetHeaderState({ iconName: 'dollar-sign', title: 'Invoices' }));
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onExportOptionSelect(event: unknown): void {
  }

  public onTabSelect(event: unknown): void {
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
