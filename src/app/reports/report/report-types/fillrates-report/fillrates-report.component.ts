import flatten from 'lodash/fp/flatten';
import flow from 'lodash/fp/flow';
import identity from 'lodash/fp/identity';
import isEqual from 'lodash/fp/isEqual';
import lodashFilter from 'lodash/fp/filter';
import lodashMap from 'lodash/fp/map';
import type { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import type { ValueFormatterParams } from '@ag-grid-community/core';
import { Observable, forkJoin, takeUntil, filter, distinctUntilChanged } from 'rxjs';
import { Store } from '@ngxs/store';

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, NgModule, Type, Inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

import { ApplicantStatus } from '@shared/models/order-management.model';
import { BaseReportDirective } from '../base-report.directive';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FillrateModel } from './models/fillrate.model';
import { FillratesReportService } from './fillrates-report.service';
import { FilterColumnsModel } from '@shared/models/filter.model';
import { FilterDialogModule } from '@shared/components/filter-dialog/filter-dialog.module';
import { FilterService } from '@shared/services/filter.service';
import { GridModule } from '@shared/components/grid/grid.module';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { PageOfCollections } from '@shared/models/page.model';
import { PageQueryFilterParamsService, PageQueryParams } from '@shared/services/page-query-filter-params.service';
import { Skill } from '@shared/models/skill.model';
import {
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
  OrganizationDepartment,
} from '@shared/models/organization.model';
import { FillrateReportFilterFormValueModel } from './models/fillrate-report-filter-form-value.model';
import { GetOrganizationStructure } from '../../../../store/user.actions';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { ReportDirectiveDataModel } from '../../models/report-directive-data.model';
import { UserState } from '../../../../store/user.state';
import { baseDropdownFieldsSettings } from '@shared/constants/base-dropdown-fields-settings';
import { reportDirectiveDataToken } from '../../constants/report-directive-data.token';
import { DatePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { CheckBoxAllModule } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'app-fillrates-report',
  templateUrl: './fillrates-report.component.html',
  styleUrls: ['./fillrates-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FillratesReportComponent extends BaseReportDirective<FillrateModel> implements OnInit {
  public readonly candidatesStatusesOptionFields: FieldSettingsModel = { text: 'statusText', value: 'applicantStatus' };
  public readonly departmentsOptionFields: FieldSettingsModel = baseDropdownFieldsSettings;
  public readonly locationsOptionFields: FieldSettingsModel = baseDropdownFieldsSettings;
  public readonly orderTypesOptionFields: FieldSettingsModel = baseDropdownFieldsSettings;
  public readonly regionsOptionFields: FieldSettingsModel = baseDropdownFieldsSettings;
  public readonly skillOptionFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };

  public readonly columnDefinitions: ColumnDefinitionModel[] = [
    { field: 'region', headerName: 'Region' },
    { field: 'location', headerName: 'Location' },
    { field: 'locationId', headerName: 'Location ID' },
    { field: 'department', headerName: 'Department' },
    { field: 'departmentId', headerName: 'Department ID' },
    { field: 'skill', headerName: 'Skill' },
    { field: 'agency', headerName: 'Agency' },
    { field: 'agencyId', headerName: 'Agency ID' },
    { field: 'candidate', headerName: 'Candidate' },
    { field: 'candidateStatusText', headerName: 'Candidate Status' },
    {
      field: 'rejectedDate',
      headerName: 'Rejected Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    { field: 'reason', headerName: 'Reason' },
    { field: 'badgeId', headerName: 'Badge ID' },
    { field: 'formattedId', headerName: 'Job ID' },
    { field: 'jobTitle', headerName: 'Job Title' },
    {
      field: 'orderStartDate',
      headerName: 'Order Start Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    {
      field: 'orderEndDate',
      headerName: 'Order End Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    {
      field: 'orderStartDate',
      headerName: 'Start Time',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedTime(params.value),
    },
    {
      field: 'orderEndDate',
      headerName: 'End Time',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedTime(params.value),
    },
    { field: 'orderTypeText', headerName: 'Order Type' },
    { field: 'jobStatus', headerName: 'Job Status' },
    { field: 'reasonCode', headerName: 'Reason Code' },
    { field: 'jobClassificationText', headerName: 'Job Classification' },

    {
      field: 'distributionDate',
      headerName: 'Distribution Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedTime(params.value),
    },
    {
      field: 'appliedDate',
      headerName: 'Applied Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedTime(params.value),
    },
    {
      field: 'distributionToActualAppliedDays',
      headerName: '#Days Job Dist. to Cand. Appl.'
    },
    {
      field: 'shortlistedDate',
      headerName: 'Shortlisted Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedTime(params.value),
    },
    {
      field: 'appliedToShortlistdDays',
      headerName: '#Days Cand Appl to Shortlisted'
    },
    {
      field: 'offeredDate',
      headerName: 'Offered Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedTime(params.value),
    },
    {
      field: 'appliedToOfferedDays',
      headerName: '#Days Cand Appl to Offered Date'
    },
    {
      field: 'shortlistedToOfferedDays',
      headerName: '#Days Cand Shortlisted to Offered Date'
    },
    {
      field: 'acceptedDate',
      headerName: 'Accepted Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedTime(params.value),
    },
    {
      field: 'offeredToAcceptedDays',
      headerName: '#Days Off. Date  to Accept. Date'
    },
    {
      field: 'distributedToAcceptedDays',
      headerName: '#Days order Dist. Date to Accepted Date'
    },
    {
      field: 'actualStartDate',
      headerName: 'Actual Start Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    {
      field: 'actualEndDate',
      headerName: 'Actual End Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    {
      field: 'orderStartToActualStartDays',
      headerName: '#Days Order Start to Actual Start Date'
    },
    {
      field: 'onboardDate',
      headerName: 'Onboard Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    {
      field: 'acceptToOnboardDays',
      headerName: '#Days Accept. Date to Onboard Date'
    },
    {
      field: 'distributionToActualDays',
      headerName: '#Days Order Dist. to Actual Start Date'
    },
  ];

  public readonly filterColumns: FilterColumnsModel = {
    skills: {
      dataSource: [],
      type: ControlTypes.Multiselect,
      valueField: this.skillOptionFields.text,
      valueId: this.skillOptionFields.value,
      valueType: ValueType.Id,
    },
    regions: {
      dataSource: [],
      type: ControlTypes.Multiselect,
      valueField: this.regionsOptionFields.text,
      valueId: this.regionsOptionFields.value,
      valueType: ValueType.Id,
    },
    orderTypes: {
      dataSource: OrderTypeOptions,
      type: ControlTypes.Multiselect,
      valueField: this.orderTypesOptionFields.text,
      valueId: this.orderTypesOptionFields.value,
      valueType: ValueType.Id,
    },
    locations: {
      dataSource: [],
      type: ControlTypes.Multiselect,
      valueField: this.locationsOptionFields.text,
      valueId: this.locationsOptionFields.value,
      valueType: ValueType.Id,
    },
    candidatesStatuses: {
      dataSource: [],
      type: ControlTypes.Multiselect,
      valueField: this.candidatesStatusesOptionFields.text,
      valueId: this.candidatesStatusesOptionFields.value,
      valueType: ValueType.Id,
    },
    departments: {
      dataSource: [],
      type: ControlTypes.Multiselect,
      valueField: this.departmentsOptionFields.text,
      valueId: this.departmentsOptionFields.value,
      valueType: ValueType.Id,
    },
    orderEndDate: { type: ControlTypes.Date, valueType: ValueType.Text },
    orderStartDate: { type: ControlTypes.Date, valueType: ValueType.Text },
    excludeFcAgency: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkBoxTitle: 'Allow Internal' },
  };

  private regions: OrganizationRegion[] = [];

  public constructor(
    @Inject(reportDirectiveDataToken) public override readonly reportDirectiveData: ReportDirectiveDataModel,
    private readonly changeDetectorRef: ChangeDetectorRef,
    protected override readonly datePipe: DatePipe,
    private readonly fillratesReportService: FillratesReportService,
    private readonly formBuilder: FormBuilder,
    protected override readonly filterService: FilterService,
    protected override readonly pageQueryFilterParamsService: PageQueryFilterParamsService,
    protected override readonly store: Store
  ) {
    super(reportDirectiveData, filterService, pageQueryFilterParamsService, store, datePipe);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(new GetOrganizationStructure());
    this.initOrganizationStructureChangesListener();
    this.initReportFiltersFormFieldsChangesListeners();
  }

  public onExcludeFcAgencyChange(): void {
    const checkboxControl = this.reportFiltersForm.get('excludeFcAgency');
    checkboxControl?.patchValue(!checkboxControl.value);
  }

  protected getFiltersData(): void {
    forkJoin([this.fillratesReportService.getAssignedSkills(), this.fillratesReportService.getApplicantsStatuses()])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([skills, statuses]: [Skill[], ApplicantStatus[]]) => {
        this.filterColumns['skills'].dataSource = skills;
        this.filterColumns['candidatesStatuses'].dataSource = statuses;
        this.changeDetectorRef.markForCheck();
      });
  }

  protected getReportDataRequest(pageQueryParams: PageQueryParams): Observable<PageOfCollections<FillrateModel>> {
    return this.fillratesReportService.getReportData(pageQueryParams, this.reportFiltersForm.value);
  }

  protected getReportFiltersForm(): FormGroup {
    return this.formBuilder.group({
      candidatesStatuses: [[]],
      departments: [[]],
      locations: [[]],
      orderTypes: [[]],
      regions: [[]],
      skills: [[]],
      orderEndDate: [''],
      orderStartDate: [''],
      excludeFcAgency: [false]
    });
  }

  private initOrganizationStructureChangesListener(): void {
    this.store
      .select(UserState.organizationStructure)
      .pipe(takeUntil(this.destroy$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.regions = structure.regions;
        this.filterColumns['regions'].dataSource = structure.regions;
        this.changeDetectorRef.markForCheck();
      });
  }

  private initReportFiltersFormFieldsChangesListeners(): void {
    this.initRegionsControlValueChangesListener();
    this.initLocationsControlValueChangesListener();
  }

  private initLocationsControlValueChangesListener(): void {
    this.initCrossControlValueChangesListener<OrganizationDepartment>(
      'locations',
      'departments',
      (regionId: number) =>
        this.filterColumns['locations'].dataSource?.find((location: OrganizationLocation) => location.id === regionId)
          ?.departments ?? []
    );
  }

  private initRegionsControlValueChangesListener(): void {
    this.initCrossControlValueChangesListener<OrganizationLocation>(
      'regions',
      'locations',
      (regionId: number) => this.regions.find((region: OrganizationRegion) => region.id === regionId)?.locations ?? []
    );
  }

  private initCrossControlValueChangesListener<T>(
    targetControlName: keyof FillrateReportFilterFormValueModel,
    relatedControlName: keyof FillrateReportFilterFormValueModel,
    valueHandler: (entityId: number) => T[]
  ): void {
    this.reportFiltersForm
      .get(targetControlName)
      ?.valueChanges.pipe(
        distinctUntilChanged((previous: number[], current: number[]) => isEqual(previous, current)),
        takeUntil(this.destroy$)
      )
      .subscribe((entityIds: number[]) => {
        if (entityIds?.length) {
          this.setDataSourceToRelatedControlForSelectedTargetEntities(relatedControlName, valueHandler, entityIds);
        } else {
          this.setDataSourceToRelatedControlForEmptySelectedTargetEntities(relatedControlName);
        }

        this.changeDetectorRef.markForCheck();
      });
  }

  private setDataSourceToRelatedControlForEmptySelectedTargetEntities(
    relatedControlName: keyof FillrateReportFilterFormValueModel
  ) {
    this.filterColumns[relatedControlName].dataSource = [];
    this.reportFiltersForm.get(relatedControlName)?.setValue([]);
  }

  private setDataSourceToRelatedControlForSelectedTargetEntities<T>(
    relatedControlName: keyof FillrateReportFilterFormValueModel,
    valueHandler: (entityId: number) => T[],
    entityIds: number[]
  ): void {
    this.filterColumns[relatedControlName].dataSource = flow(
      lodashMap((entityId: number) => valueHandler(entityId)),
      flatten,
      lodashFilter(identity)
    )(entityIds);
  }

  private getFormattedDate(date: string): string {
    return this.getFormattedDateWithFormat(date, 'MM/dd/yy');
  }

  private getFormattedTime(date: string): string {
    return this.getFormattedDateWithFormat(date, 'hh:mm');
  }

  private getFormattedDateWithFormat(date: string, format: string): string {
    return this.datePipe.transform(date, format) ?? '';
  }
}

@NgModule({
  declarations: [FillratesReportComponent],
  imports: [CommonModule, GridModule, FilterDialogModule, MultiselectDropdownModule, DatePickerAllModule, CheckBoxAllModule, ReactiveFormsModule],
})
class FillratesReportModule {}

export const component: Type<FillratesReportComponent> = FillratesReportComponent;
export const module: Type<FillratesReportModule> = FillratesReportModule;
