import type { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import type { ValueFormatterParams } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, NgModule, Type, ChangeDetectorRef, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { ApplicantStatus } from '@shared/models/order-management.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { BaseReportDirective } from '../base-report.directive';
import { CandidateModel } from './models/candidate.model';
import { CandidatesReportService } from './candidates-report.service';
import { ColumnDefinitionModel } from '@shared/components/grid/models/column-definition.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilterColumnsModel } from '@shared/models/filter.model';
import { FilterDialogModule } from '@shared/components/filter-dialog/filter-dialog.module';
import { FilterService } from '@shared/services/filter.service';
import { GridModule } from '@shared/components/grid/grid.module';
import { InputModule } from '@shared/components/form-controls/input/input.module';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { PageOfCollections } from '@shared/models/page.model';
import { PageQueryFilterParamsService, PageQueryParams } from '@shared/services/page-query-filter-params.service';
import { ReportDirectiveDataModel } from '../../models/report-directive-data.model';
import { Skill } from '@shared/models/skill.model';
import { reportDirectiveDataToken } from '../../constants/report-directive-data.token';

@Component({
  selector: 'app-candidates-report',
  templateUrl: './candidates-report.component.html',
  styleUrls: ['./candidates-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CandidatesReportComponent extends BaseReportDirective<CandidateModel> {
  public readonly agenciesOptionFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  public readonly skillOptionFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };
  public readonly statusesOptionFields: FieldSettingsModel = { text: 'statusText', value: 'applicantStatus' };

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

  public constructor(
    @Inject(reportDirectiveDataToken) public override readonly reportDirectiveData: ReportDirectiveDataModel,
    private readonly candidatesReportService: CandidatesReportService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly formBuilder: FormBuilder,
    protected override readonly filterService: FilterService,
    protected override readonly pageQueryFilterParamsService: PageQueryFilterParamsService,
    protected override readonly store: Store
  ) {
    super(reportDirectiveData, filterService, pageQueryFilterParamsService, store);
  }

  protected getReportFiltersForm(): FormGroup {
    return this.formBuilder.group({
      skills: [[]],
      agencies: [[]],
      candidateName: [''],
      statuses: [[]],
    });
  }

  protected override getReportDataRequest(
    pageQueryParams: PageQueryParams
  ): Observable<PageOfCollections<CandidateModel>> {
    return this.candidatesReportService.getReportData(pageQueryParams, this.reportFiltersForm.value);
  }

  protected getFiltersData(): void {
    forkJoin([
      this.candidatesReportService.getAssignedSkills(),
      this.candidatesReportService.getApplicantsStatuses(),
      this.candidatesReportService.getAssociateAgencies(),
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

@NgModule({
  declarations: [CandidatesReportComponent],
  imports: [CommonModule, GridModule, FilterDialogModule, InputModule, MultiselectDropdownModule],
})
class CandidatesReportModule {}

export const component: Type<CandidatesReportComponent> = CandidatesReportComponent;
export const module: Type<CandidatesReportModule> = CandidatesReportModule;
