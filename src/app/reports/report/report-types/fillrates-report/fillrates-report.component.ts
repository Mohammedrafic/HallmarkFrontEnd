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
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

import { ApplicantStatus } from '@shared/models/order-management.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
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

@Component({
  selector: 'app-fillrates-report',
  templateUrl: './fillrates-report.component.html',
  styleUrls: ['./fillrates-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FillratesReportComponent extends BaseReportDirective<FillrateModel> implements OnInit {
  public readonly agenciesOptionFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  public readonly candidatesStatusesOptionFields: FieldSettingsModel = { text: 'statusText', value: 'applicantStatus' };
  public readonly departmentsOptionFields: FieldSettingsModel = baseDropdownFieldsSettings;
  public readonly locationsOptionFields: FieldSettingsModel = baseDropdownFieldsSettings;
  public readonly orderTypesOptionFields: FieldSettingsModel = baseDropdownFieldsSettings;
  public readonly regionsOptionFields: FieldSettingsModel = baseDropdownFieldsSettings;
  public readonly skillOptionFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };

  public readonly columnDefinitions: ColumnDefinitionModel[] = [
    {
      field: 'actualEndDate',
      headerName: 'Actual End Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    {
      field: 'actualStartDate',
      headerName: 'Actual Start Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    { field: 'agency', headerName: 'Agency' },
    { field: 'agencyId', headerName: 'Agency ID' },
    { field: 'badgeId', headerName: 'Badge ID' },
    { field: 'candidate', headerName: 'Candidate' },
    { field: 'candidateStatus', headerName: 'Candidate Status' },
    {
      field: 'daysOrderStartToActualStartDate',
      headerName: 'Days Order Start To Actual Start Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    { field: 'department', headerName: 'Department' },
    { field: 'departmentId', headerName: 'Department ID' },
    { field: 'jobClassification', headerName: 'Job Classification' },
    { field: 'jobStatus', headerName: 'Job Status' },
    { field: 'jobTitle', headerName: 'Job Title' },
    { field: 'location', headerName: 'Location' },
    { field: 'locationId', headerName: 'Location ID' },
    { field: 'ltaOrderNumber', headerName: 'Lta Order Number' },
    {
      field: 'onboardDate',
      headerName: 'Onboard Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    {
      field: 'orderEndDate',
      headerName: 'Order End Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    {
      field: 'orderStartDate',
      headerName: 'Order Start Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    { field: 'orderType', headerName: 'Order Type' },
    { field: 'reason', headerName: 'Reason' },
    { field: 'reasonCode', headerName: 'Reason Code' },
    { field: 'region', headerName: 'Region' },
    {
      field: 'rejectedDate',
      headerName: 'Rejected Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
    },
    { field: 'skill', headerName: 'Skill' },
  ];

  public readonly filterColumns: FilterColumnsModel = {
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
  };

  private regions: OrganizationRegion[] = [];

  public constructor(
    @Inject(reportDirectiveDataToken) public override readonly reportDirectiveData: ReportDirectiveDataModel,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly datePipe: DatePipe,
    private readonly fillratesReportService: FillratesReportService,
    private readonly formBuilder: FormBuilder,
    protected override readonly filterService: FilterService,
    protected override readonly pageQueryFilterParamsService: PageQueryFilterParamsService,
    protected override readonly store: Store
  ) {
    super(reportDirectiveData, filterService, pageQueryFilterParamsService, store);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(new GetOrganizationStructure());
    this.initOrganizationStructureChangesListener();
    this.initReportFiltersFormFieldsChangesListeners();
  }

  protected getFiltersData(): void {
    forkJoin([
      this.fillratesReportService.getAssignedSkills(),
      this.fillratesReportService.getApplicantsStatuses(),
      this.fillratesReportService.getAssociateAgencies(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([skills, statuses, agencies]: [Skill[], ApplicantStatus[], AssociateAgency[]]) => {
        this.filterColumns['skills'].dataSource = skills;
        this.filterColumns['agencies'].dataSource = agencies;
        this.filterColumns['candidatesStatuses'].dataSource = statuses;
        this.changeDetectorRef.markForCheck();
      });
  }

  protected getReportDataRequest(pageQueryParams: PageQueryParams): Observable<PageOfCollections<FillrateModel>> {
    return this.fillratesReportService.getReportData(pageQueryParams, this.reportFiltersForm.value);
  }

  protected getReportFiltersForm(): FormGroup {
    return this.formBuilder.group({
      agencies: [[]],
      candidatesStatuses: [[]],
      departments: [[]],
      locations: [[]],
      orderTypes: [[]],
      regions: [[]],
      skills: [[]],
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
    return this.datePipe.transform(date, 'MM/dd/yy') ?? '';
  }
}

@NgModule({
  declarations: [FillratesReportComponent],
  imports: [CommonModule, GridModule, FilterDialogModule, MultiselectDropdownModule],
})
class FillratesReportModule {}

export const component: Type<FillratesReportComponent> = FillratesReportComponent;
export const module: Type<FillratesReportModule> = FillratesReportModule;
