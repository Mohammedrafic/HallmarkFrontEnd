import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetCommonReportFilterOptions, GetLogiReportData, ClearLogiReportState, GetCommonReportAgencyCandidateSearch, GetAgencyCommonFilterReportOptions, GetOrganizationsByAgency, GetOrganizationsStructureByOrgIds, GetCommonReportCandidateSearch, GetCommonReportCredentialSearch } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ORGANIZATION_DATA_FIELDS } from '../constants/agency-reports.constants';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import {
  CommonAgencyCandidateSearchFilter, CommonReportFilter,
  SearchCandidate, AgencyCommonFilterReportOptions, CommonCredentialSearchFilter, SearchCredential
} from '../models/agency-common-report.model';
import { OutsideZone } from "@core/decorators";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { DataSourceItem } from '../../../core/interface/common.interface';
import { GetOrganizationById } from '../../../admin/store/admin.actions';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '../../../shared/models/organization.model';
import { AgencyCandidateEligibilityConstants } from '../constants/agency-reports.constants';

@Component({
  selector: 'app-candidate-eligibility-agency',
  templateUrl: './candidate-eligibility-agency.component.html',
  styleUrls: ['./candidate-eligibility-agency.component.scss'],
})
export class CandidateEligibilityAgencyComponent implements OnInit, OnDestroy {
  public paramsData: any = {
    "AgenciesParamAFTS": "",
    "OrganizationParamMSR": "",
    "CandidateNameParamMSR": "",
    "JobIdParamMSR": "",
  };
  public reportName: LogiReportFileDetails = { name: "/AgencyReports/CandidateEligibility/CandidateEligibility.cls" };
  public catelogName: LogiReportFileDetails = { name: "/AgencyReports/CandidateEligibility/CandidateEligibility.cat" };
  public title: string = "Candidate Eligibility";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public allOption: string = "All";
 

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(LogiReportState.getOrganizationsByAgency)
  public organizationsByAgency$: Observable<DataSourceItem[]>;

  @Select(LogiReportState.getOrganizationsStructure)
  public getOrganizationsStructure$: Observable<OrganizationStructure[]>;

  @Select(LogiReportState.agencycommonReportFilterData)
  public agencycommonReportFilterData$: Observable<AgencyCommonFilterReportOptions>;

  @Select(LogiReportState.commonReportCandidateSearch)
  public financialTimeSheetCandidateSearchData$: Observable<SearchCandidate[]>;

  candidateSearchData: SearchCandidate[] = [];
  
  selectedOrganizations: OrganizationStructure[] = [];

  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  private fixedCanidateStatusesTypes: number[] = [4, 5, 10, 12];  
  @Select(UserState.lastSelectedAgencyId)
  private agencyId$: Observable<number>;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = { text: 'organizationName', value: 'organizationId' };
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public agencyCandidateEligibilityReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public candidateNameControl: AbstractControl;
  public organizations: OrganizationStructure[] = [];
  public defaultOrganizations: number;
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isDefaultLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: AgencyCommonFilterReportOptions;
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  private defaultAgency: string;
  private dateFormat = 'MM/dd/yyyy';
  private culture = 'en-US';
  private nullValue = "null";
  private joinString = ",";

  public associatedOrganizations: DataSourceItem[] = [];
  
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    @Inject(APP_SETTINGS) private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Reports", iconName: 'pie-chart' }));
    this.initForm();
    this.user = this.store.selectSnapshot(UserState.user);
    //if (this.user?.id != null) {
    //this.store.dispatch(new GetOrganizationsStructureAll(this.user?.id));
    //}
  }

  ngOnInit(): void {

    this.agencyId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.orderFilterColumnsSetup();
      if (data != null && data != undefined) {
        this.defaultAgency = data.toString();

        this.store.dispatch(new GetOrganizationsByAgency())
        this.store.dispatch(new ClearLogiReportState());
        this.organizationsByAgency$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: DataSourceItem[]) => {
          if (data != null && data != undefined) {
            this.associatedOrganizations = data;

            this.store.dispatch(new GetOrganizationsStructureByOrgIds(data.map(i => i.id ?? 0)));
            this.getOrganizationsStructure$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: OrganizationStructure[]) => {

              if (data != undefined && data != null && data.length > 0) {
                this.organizations = uniqBy(data, 'organizationId');
                this.filterColumns.businessIds.dataSource = this.organizations;
                this.defaultOrganizations = this.organizations.length == 0 ? 0 : this.organizations[0].organizationId;
                this.agencyCandidateEligibilityReportForm.get(AgencyCandidateEligibilityConstants.formControlNames.BusinessIds)?.setValue(this.defaultOrganizations);
                this.changeDetectorRef.detectChanges();
              }
            });
          }
        });
      }


      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });

      this.onFilterControlValueChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark || this.user?.businessUnitType == BusinessUnitType.Agency ? this.agencyCandidateEligibilityReportForm.get(AgencyCandidateEligibilityConstants.formControlNames.BusinessIds)?.enable() : this.agencyCandidateEligibilityReportForm.get(AgencyCandidateEligibilityConstants.formControlNames.BusinessIds)?.disable();

    });

  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.agencyCandidateEligibilityReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        candidateName: new FormControl(null, [Validators.required]),
        jobId: new FormControl('', [Validators.required])
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }


  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.agencyCandidateEligibilityReportForm.get(AgencyCandidateEligibilityConstants.formControlNames.BusinessIds) as AbstractControl;
    this.defaultOrganizations = this.organizations.length == 0 ? 0 : this.organizations[0].organizationId;
    this.agencyCandidateEligibilityReportForm.get(AgencyCandidateEligibilityConstants.formControlNames.BusinessIds)?.setValue(this.defaultOrganizations);


    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && typeof data === 'number' && data != this.previousOrgId) {
        this.isAlive = true;
        this.previousOrgId = data;
        if (!this.isClearAll) {
          let orgList = this.organizations?.filter((x) => data == x.organizationId);
          this.selectedOrganizations = orgList;
          let businessIdData = [];
          businessIdData.push(data);
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };

          this.store.dispatch(new GetAgencyCommonFilterReportOptions(filter));
          this.agencycommonReportFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: AgencyCommonFilterReportOptions | null) => {
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.isDefaultLoad = true;
              setTimeout(() => { this.SearchReport() }, 3000);
            }
          });
        }
        else {
          this.isClearAll = false;
        }
      }
    });
  }
  public SearchReport(): void {
    this.filteredItems = [];
    let {  businessIds, candidateName,   jobId} = this.agencyCandidateEligibilityReportForm.getRawValue();
    this.paramsData =
    {
      "AgencyId": this.defaultAgency,
      "CandidateProfileID": candidateName == null || candidateName == "" ? "0" : candidateName.toString(),
      "OrderId": jobId == null || jobId == "" ? 0 : jobId,
    };
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }
  private orderFilterColumnsSetup(): void {
    this.filterColumns = {
      businessIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'organizationName',
        valueId: 'organizationId',
      },
      candidateName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },
      jobId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      }
    }
  }

  private SetReportData() {
    const logiReportData = this.store.selectSnapshot(LogiReportState.logiReportData);
    if (logiReportData != null && logiReportData.length == 0) {
      this.store.dispatch(new GetLogiReportData());
    }
    else {
      this.logiReportComponent?.SetReportData(logiReportData);
    }
  }

  public showFilters(): void {
    if (this.isResetFilter) {
      this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.agencyCandidateEligibilityReportForm, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.isClearAll = true;
    this.agencyCandidateEligibilityReportForm.get(AgencyCandidateEligibilityConstants.formControlNames.CandidateName)?.setValue(null);
    this.agencyCandidateEligibilityReportForm.get(AgencyCandidateEligibilityConstants.formControlNames.JobId)?.setValue(null);
    this.filteredItems = [];
  }


  public onFilterApply(): void {

    this.agencyCandidateEligibilityReportForm.markAllAsTouched();
    if (this.agencyCandidateEligibilityReportForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }


  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch(new ShowToast(MessageTypes.Error, error));
    return;
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }
 
  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = [];
      ids.push(this.bussinessControl.value);
      let filter: CommonAgencyCandidateSearchFilter = {
        searchText: e.text,
        businessUnitIds: ids,
        agencyId: Number(this.defaultAgency)
      };
      this.filterColumns.dataSource = [];
      this.store.dispatch(new GetCommonReportAgencyCandidateSearch(filter))
        .subscribe((result) => {
          this.candidateFilterData = result.LogiReport.searchCandidates;
          this.candidateSearchData = result.LogiReport.searchCandidates;
          this.filterColumns.dataSource = this.candidateFilterData;
          // pass the filter data source to updateData method.
          e.updateData(this.candidateFilterData);
        });

    }
  }
}
