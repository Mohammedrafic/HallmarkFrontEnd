import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';
import { Observable, BehaviorSubject, finalize, takeUntil, forkJoin, switchMap } from 'rxjs';
import { Store } from '@ngxs/store';
import type { ValueFormatterParams } from '@ag-grid-community/core';

import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ApplicantStatus } from '@shared/models/order-management.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { CandidateModel } from './models/candidate.model';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilterService } from '@shared/services/filter.service';
import { FilteredItem, FilterColumnsModel } from '@shared/models/filter.model';
import { PageOfCollections } from '@shared/models/page.model';
import { PageQueryFilterParamsService, PageQueryParams } from '@shared/services/page-query-filter-params.service';
import { ReportsService } from './reports.service';
import { SetHeaderState, ShowFilterDialog } from '../store/app.actions';
import { Skill } from '@shared/models/skill.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent extends DestroyableDirective implements OnInit {
  public reportListData$: Observable<PageOfCollections<CandidateModel>>;

  public readonly filters$: BehaviorSubject<FilteredItem[]> = new BehaviorSubject<FilteredItem[]>([]);
  public readonly buttonTypeEnum: typeof ButtonTypeEnum = ButtonTypeEnum;
  public readonly isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly skillOptionFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };
  public readonly agenciesOptionFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  public readonly statusesOptionFields: FieldSettingsModel = { text: 'statusText', value: 'applicantStatus' };
  public readonly reportsFilterForm: FormGroup = this.getReportsFilterForm();
  public readonly pageQueryParams$: Observable<PageQueryParams> = this.pageQueryFilterParamsService.pageQueryParams$;

  public readonly columnDefinitions: ColumnDefinitionModel[] = [
    { field: 'agency', headerName: 'Agency' },
    { field: 'name', headerName: 'Name' },
    { field: 'skills', headerName: 'Skill Type' },
    { field: 'email', headerName: 'Email' },
    { field: 'workPhoneNumber', headerName: 'Work Phone Number' },
    { field: 'cellPhoneNumber', headerName: 'Cell Phone Number' },
    { field: 'address', headerName: 'Address' },
    { field: 'state', headerName: 'State' },
    { field: 'city', headerName: 'City' },
    {
      field: 'applicantStatus',
      headerName: 'Applicant status',
      valueFormatter: (valueFormatterParams: ValueFormatterParams): string => {
        const targetApplicantStatus: ApplicantStatus | undefined = this.filterColumns['statuses'].dataSource?.find(
          (applicantStatus: ApplicantStatus) => applicantStatus.applicantStatus === valueFormatterParams.value
        );
        return targetApplicantStatus?.statusText ?? '';
      },
    },
  ];

  public readonly filterColumns: FilterColumnsModel = {
    candidateName: { type: ControlTypes.Text, valueType: ValueType.Text },
    agencies: {
      dataSource: [],
      type: ControlTypes.Multiselect,
      valueField: this.agenciesOptionFields.text,
      valueId: this.agenciesOptionFields.value,
      valueType: ValueType.Id,
    },
    skills: {
      dataSource: [],
      type: ControlTypes.Multiselect,
      valueField: this.skillOptionFields.text,
      valueId: this.skillOptionFields.value,
      valueType: ValueType.Id,
    },
    statuses: {
      dataSource: [],
      type: ControlTypes.Multiselect,
      valueField: this.statusesOptionFields.text,
      valueId: this.statusesOptionFields.value,
      valueType: ValueType.Id,
    },
  };

  public constructor(
    private readonly store: Store,
    private readonly reportsService: ReportsService,
    private readonly formBuilder: FormBuilder,
    private readonly filterService: FilterService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly pageQueryFilterParamsService: PageQueryFilterParamsService
  ) {
    super();
    this.setHeader();
  }

  public ngOnInit(): void {
    this.getReportListDataStream();
    this.getFiltersData();
  }

  public showFilters(): void {
    this.toggleFilterDialog(true);
  }

  public applyFilters(): void {
    this.filters$.next(this.filterService.generateChips(this.reportsFilterForm, this.filterColumns));
    this.getReportListDataStream();
    this.toggleFilterDialog(false);
  }

  public clearFilters(): void {
    this.reportsFilterForm.reset();
    this.getReportListDataStream();
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.reportsFilterForm, this.filterColumns);
  }

  public handlePageSizeChange(pageSize: number): void {
    this.pageQueryFilterParamsService.changePageSize(pageSize);
  }

  public handlePageChange(page: number): void {
    this.pageQueryFilterParamsService.changePage(page);
  }

  private setHeader(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Reports', iconName: 'trello' }));
  }

  private getReportListDataStream(): void {
    this.reportListData$ = this.pageQueryParams$.pipe(
      switchMap((pageQueryParams: PageQueryParams) => this.getReportData(pageQueryParams))
    );
  }

  private getReportData(pageQueryParams: PageQueryParams): Observable<PageOfCollections<CandidateModel>> {
    this.isLoading$.next(true);
    return this.reportsService
      .getReportData(pageQueryParams, this.reportsFilterForm.value)
      .pipe(finalize(() => this.isLoading$.next(false)));
  }

  private getReportsFilterForm(): FormGroup {
    return this.formBuilder.group({
      skills: [[]],
      agencies: [[]],
      candidateName: [''],
      statuses: [[]],
    });
  }

  private toggleFilterDialog(isOpened: boolean): void {
    this.store.dispatch(new ShowFilterDialog(isOpened));
  }

  private getFiltersData(): void {
    forkJoin([
      this.reportsService.getAssignedSkills(),
      this.reportsService.getApplicantsStatuses(),
      this.reportsService.getAssociateAgencies(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([skills, statuses, agencies]: [Skill[], ApplicantStatus[], AssociateAgency[]]) => {
        this.filterColumns['skills'].dataSource = skills;
        this.filterColumns['statuses'].dataSource = statuses;
        this.filterColumns['agencies'].dataSource = agencies;
        this.changeDetectorRef.markForCheck();
      });
  }
}
