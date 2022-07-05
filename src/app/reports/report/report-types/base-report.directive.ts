import { BehaviorSubject, Observable, switchMap, finalize, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { Directive, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilterColumnsModel, FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { PageOfCollections } from '@shared/models/page.model';
import { PageQueryFilterParamsService, PageQueryParams } from '@shared/services/page-query-filter-params.service';
import { ReportDirectiveDataModel } from '../models/report-directive-data.model';
import { ShowFilterDialog } from '../../../store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { DatePipe } from '@angular/common';

@Directive()
export abstract class BaseReportDirective<T> extends DestroyableDirective implements OnInit {
  @Select(UserState.lastSelectedOrganizationId)
  lastSelectedOrganizationId$: Observable<number>;

  public abstract readonly columnDefinitions: ColumnDefinitionModel[];
  public abstract readonly filterColumns: FilterColumnsModel;

  public reportFiltersForm: FormGroup;
  public reportListData$: Observable<PageOfCollections<T>>;

  public readonly isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly pageQueryParams$: Observable<PageQueryParams> = this.pageQueryFilterParamsService.pageQueryParams$;

  protected constructor(
    public readonly reportDirectiveData: ReportDirectiveDataModel,
    protected readonly filterService: FilterService,
    protected readonly pageQueryFilterParamsService: PageQueryFilterParamsService,
    protected readonly store: Store,
    protected readonly datePipe: DatePipe,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.reportFiltersForm = this.getReportFiltersForm();
    this.getReportListDataStream();
    this.getFiltersData();
    this.onOrgChange();
  }

  public handlePageSizeChange(pageSize: number): void {
    this.pageQueryFilterParamsService.changePageSize(pageSize);
  }

  public handlePageChange(page: number): void {
    this.pageQueryFilterParamsService.changePage(page);
  }

  public applyFilters(): void {
    this.updateFilters();
    this.getReportListDataStream();
    this.toggleFilterDialog(false);
  }

  public clearFilters(): void {
    this.reportFiltersForm = this.getReportFiltersForm();
    this.updateFilters();
    this.getReportListDataStream();
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.reportFiltersForm, this.filterColumns);
    this.updateFilters();
  }

  protected abstract getReportFiltersForm(): FormGroup;
  protected abstract getReportDataRequest(pageQueryParams: PageQueryParams): Observable<PageOfCollections<T>>;
  protected abstract getFiltersData(): void;

  private getReportListDataStream(): void {
    this.reportListData$ = this.pageQueryParams$.pipe(
      switchMap((pageQueryParams: PageQueryParams) => this.getReportData(pageQueryParams))
    );
  }

  private getReportData(pageQueryParams: PageQueryParams): Observable<PageOfCollections<T>> {
    this.isLoading$.next(true);
    return this.getReportDataRequest(pageQueryParams).pipe(finalize(() => this.isLoading$.next(false)));
  }

  private toggleFilterDialog(state: boolean): void {
    this.store.dispatch(new ShowFilterDialog(state));
  }

  private updateFilters(): void {
    this.reportDirectiveData.filterChangeHandler(
      this.filterService.generateChips(this.reportFiltersForm, this.filterColumns, this.datePipe)
    );
  }

  private onOrgChange(): void {
    this.lastSelectedOrganizationId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateFilters();
      this.getReportListDataStream();
    });
  }
}
