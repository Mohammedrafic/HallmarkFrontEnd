import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData,
  GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState
} from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { analyticsConstants, searchByList } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SearchCandidate, SkillCategoryDto } from '../models/common-report.model';
import { OutsideZone } from "@core/decorators";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { AssociateAgencyDto } from '../../../shared/models/logi-report-file';
import { CheckBoxAllModule } from '@syncfusion/ej2-angular-buttons';


@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss']
})
export class CandidateListComponent implements OnInit, OnDestroy {
  public paramsData: any = {
    "OrganizationParamCL": "",
    "AgencyCL": "",
    "SearchByCL" :"",
    "SkillCL": "",
    "CandidateNameCL": "",
    "BearerParamCL": "",
    "BusinessUnitIdParamCL": "",
    "HostNameCL": "",
    "InActiveInCompleteCL": "",
    "IsExactMatchCL": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/CandidateList/CandidateList.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/CandidateList/CandidateList.cat" };
  public title: string = "Candidate List";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public allOption: string = "All";
  public message: string = "";

  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegions: Region[];

  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocations: Location[];

  @Select(LogiReportState.departments)
  public departments$: Observable<Department[]>;
  isDepartmentsDropDownEnabled: boolean = false;
  departmentFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(LogiReportState.commonReportFilterData)
  public financialTimeSheetFilterData$: Observable<CommonReportFilterOptions>;

  @Select(LogiReportState.commonReportCandidateSearch)
  public financialTimeSheetCandidateSearchData$: Observable<SearchCandidate[]>;

  candidateSearchData: SearchCandidate[] = [];

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  public agencyFields = {
    text: 'agencyName',
    value: 'agencyId',
  };
  selectedAgencies: AssociateAgencyDto[];
  public defaultAgencyIds: (number | undefined)[] = [];

  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  selectedDepartments: Department[];
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private selectedOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public candidateListForm: FormGroup;
  public bussinessControl: AbstractControl;
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
  public candidateNameControl: AbstractControl;
  public agencyData: AssociateAgencyDto[] = [];

  public defaultOrganizations: number;
  public defaultSkillCategories: (number | undefined)[] = [];
  public defaultOrderTypes: (number | undefined)[] = [];
  public defaultSkills: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = true;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  searchByFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public selectedSearchByOption: number;
  public searchByControl: AbstractControl;
  public inActiveInCompleteControl: AbstractControl;

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    @Inject(APP_SETTINGS) private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
    this.initForm();
    this.user = this.store.selectSnapshot(UserState.user);
    if (this.user?.id != null) {
      this.store.dispatch(new GetOrganizationsStructureAll(this.user?.id));
    }

    this.SetReportData();
  }

  ngOnInit(): void {

    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.store.dispatch(new ClearLogiReportState());
      this.orderFilterColumnsSetup();
      this.financialTimeSheetFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
        if (data != null) {
          this.isAlive = false;
          this.filterOptionsData = data;
          this.filterColumns.skillIds.dataSource = [];
          this.defaultSkillCategories = data.skillCategories.map((list) => list.id);

          this.filterColumns.agencyIds.dataSource = [];
          this.filterColumns.agencyIds.dataSource = data?.agencies;

          let masterSkills = this.filterOptionsData.masterSkills;
          let skills = masterSkills.filter((i) => this.defaultSkillCategories?.includes(i.skillCategoryId));
          this.filterColumns.skillIds.dataSource = skills;
          this.defaultSkills = skills.map((list) => list.id);
          this.candidateListForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(this.defaultSkills);
          this.changeDetectorRef.detectChanges();

          this.agencyIdControl = this.candidateListForm.get(analyticsConstants.formControlNames.AgencyIds) as AbstractControl;
          let agencyIds = data?.agencies;
          this.selectedAgencies = agencyIds;
          this.defaultAgencyIds = agencyIds.map((list) => list.agencyId);
          this.candidateListForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);

          this.candidateListForm.get(analyticsConstants.formControlNames.SearchBy)?.setValue(0);
          let {searchBy } = this.candidateListForm.getRawValue();
          this.selectedSearchByOption = searchBy;

          let a = this.candidateListForm.get(analyticsConstants.formControlNames.SearchBy)?.value;

          if (this.isInitialLoad) {
            setTimeout(() => { this.SearchReport(); }, 3000)
            this.isInitialLoad = false;
          }
        }
      });
      this.SetReportData();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.selectedOrganizationId = data;

      let businessIdData = [];
      businessIdData.push(data);
      let filter: CommonReportFilter = {
        businessUnitIds: businessIdData
      };
      this.store.dispatch(new GetCommonReportFilterOptions(filter));

      this.onFilterControlValueChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.candidateListForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.candidateListForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }


  private initForm(): void {
    
    this.candidateListForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        candidateName: new FormControl(null),
        searchBy: new FormControl([], [Validators.required]),
        agencyIds: new FormControl([], [Validators.required]),
        inActiveInComplete: new FormControl(false)
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.candidateListForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.skillIdControl = this.candidateListForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
    });

    this.skillIdControl = this.candidateListForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }

      this.agencyIdControl = this.candidateListForm.get(analyticsConstants.formControlNames.AgencyIds) as AbstractControl;
      this.agencyIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (this.agencyIdControl.value.length > 0) {
          let agencyIds = this.agencyData;
          this.selectedAgencies = agencyIds?.filter((object) => data?.includes(object.agencyId));
        }
      });
    });
  }

  public SearchReport(): void {
    this.filteredItems = [];
    let auth = "Bearer ";


    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let { candidateName, skillIds, agencyIds, searchBy, inActiveInComplete } = this.candidateListForm.getRawValue();

    let isExactMatch = "0";

    var candidateNameValue = this.candidateSearchData?.filter((i) => i.id == candidateName).map(i => i.fullName);
    if (candidateNameValue.length > 0 && searchBy==1) {
      isExactMatch = "1";
    }
    else if (candidateNameValue.length == 0 && candidateName != "null" && candidateName?.length > 0 && searchBy == 1) {
      candidateNameValue = [candidateName];
      isExactMatch = "2";
    }
    
    this.paramsData =
    {
      "BearerParamCL": auth,
      "BusinessUnitIdParamCL": window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostNameCL": this.baseUrl,

      "OrganizationParamCL": window.localStorage.getItem("lastSelectedOrganizationId"),
      "AgencyCL": agencyIds.length == 0 ? "null" : agencyIds.join(","),
      "SearchByCL": searchBy?.toString(),
      "SkillCL": skillIds.length == 0 ? "null" : skillIds.join(","),
      "CandidateNameCL": candidateNameValue,
      "IsExactMatchCL": isExactMatch,
      "InActiveInCompleteCL": inActiveInComplete == true ? "2" : "1"
    };
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }
  private orderFilterColumnsSetup(): void {
    this.filterColumns = {
      skillIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'agencyName',
        valueId: 'agencyId',
      },
      candidateName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },

      searchBy: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: searchByList,
        valueField: 'name',
        valueId: 'id',
      },

      inActiveInComplete: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkBoxTitle: 'InComplete / InActive' },
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
    this.onFilterControlValueChangedHandler();
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.candidateListForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    this.candidateListForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue([]);
    this.candidateListForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.candidateListForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.candidateListForm.get(analyticsConstants.formControlNames.CandidateName)?.setValue(null);
    this.candidateListForm.get(analyticsConstants.formControlNames.InActiveInComplete)?.setValue(false);
    this.candidateListForm.get(analyticsConstants.formControlNames.SearchBy)?.setValue(0);
    this.filteredItems = [];
  }
  public onFilterApply(): void {
    this.candidateListForm.markAllAsTouched();
    if (this.candidateListForm?.invalid) {
      return;
    }
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch([new ShowToast(MessageTypes.Error, error)]);
    return;
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }

  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = [];
      ids.push(this.selectedOrganizationId);
      let filter: CommonCandidateSearchFilter = {
        searchText: e.text,
        businessUnitIds: ids
      };
      this.filterColumns.dataSource = [];
      this.store.dispatch(new GetCommonReportCandidateSearch(filter))
        .subscribe((result) => {
          this.candidateFilterData = result.LogiReport.searchCandidates;
          this.candidateSearchData = result.LogiReport.searchCandidates;
          this.filterColumns.dataSource = this.candidateFilterData;
          e.updateData(this.candidateFilterData);
        });

    }
  }
}




