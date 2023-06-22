import { ChangeDetectorRef, Component, Inject, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetCommonReportFilterOptions, GetLogiReportData, ClearLogiReportState, GetCommonReportCandidateSearch } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { GeneralCommentReportConstants, analyticsConstants, InvoiceStatus, CommentsTypeFilter, CommentsLevelFilter, CommentsByFilter } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions, SearchCandidate } from '../models/common-report.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { AssociateAgencyDto } from '../../../shared/models/logi-report-file';
import { OutsideZone } from '@core/decorators';
import { EmitType } from '@syncfusion/ej2-base';


@Component({
  selector: 'app-general-comments',
  templateUrl: './general-comments.component.html',
  styleUrls: ['./general-comments.component.scss']
})
export class GeneralCommentsComponent implements OnInit {
  public paramsData: any = {

    
    OrganizationsGCR: '',
    RegionsGCR: '',
    LocationsGCR: '',
    DepartmentsGCR: '',
    AgenciesGCR: '',
    StartDateGCR: '',
    EndDateGCR: '',
    CommentType: '',
    CommentLevel: '',
    Commentby: '',
    OrderId: '',
    CandidateName: '',
    Userid: ''
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/GeneralComments/GeneralComments.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/GeneralComments/GeneralComments.cat" };
  public title: string = "General Comments";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  //public selectedFilter = CommentsTypeFilter.All;

  //public selectedLevelFilter = CommentsLevelFilter.All;

  //public selectedCommentByFilter = CommentsByFilter.All;

  public allOption: string = "All";
  @Input() disabled: boolean = false;
  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegions: Region[];

  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocations: Location[];

  @Select(LogiReportState.departments)
  public departments$: Observable<Department[]>;
  departmentFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(LogiReportState.commonReportFilterData)
  public GeneralCommentFilterData$: Observable<CommonReportFilterOptions>;

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
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  selectedDepartments: Department[];


  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;
  public commentsFilterItems = CommentsTypeFilter;
  public commentsLevelFilterItems = CommentsLevelFilter;
  public commentsByFilterItems = CommentsByFilter;
  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public generalcmntReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
  public agencyData: AssociateAgencyDto[] = [];
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: Organisation[] = [];
  public regionsList: Region[] = [];
  public locationsList: Location[] = [];
  public departmentsList: Department[] = [];
  public defaultOrganizations: number;
  public defaultRegions: (number | undefined)[] = [];
  public defaultLocations: (number | undefined)[] = [];
  public defaultDepartments: (number | undefined)[] = [];

  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  candidateWaterMark: string = 'e.g. Andrew Fuller';

  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  candidateSearchData: SearchCandidate[] = [];
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

  }

  ngOnInit(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.store.dispatch(new ClearLogiReportState());
      this.orderFilterColumnsSetup();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });

      this.agencyOrganizationId = data;
      this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.CommentedType)?.setValue(0);
      this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.CommentedLevel)?.setValue(0);
      this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.Commentedby)?.setValue(0);
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.BusinessIds)?.enable() : this.generalcmntReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }
  private initForm(): void {
    let EndDate = new Date(Date.now());
    EndDate.setDate(EndDate.getDate() + 7);
    this.generalcmntReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        agencyIds: new FormControl([]),
        startDate: new FormControl(new Date(Date.now())),
        endDate: new FormControl(EndDate),
        CommentedType: new FormControl(null),
        CommentedLevel: new FormControl(null),
        Commentedby: new FormControl(null),
        OrderId: new FormControl(null),
        candidateName: new FormControl(null)

      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.generalcmntReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.generalcmntReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);


        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.generalcmntReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      if (data != null && typeof data === 'number' && data != this.previousOrgId) {
        this.filterColumns.agencyIds.dataSource = [];
        this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.AgencyIds)?.setValue([]);

        this.isAlive = true;
        this.previousOrgId = data;
        if (!this.isClearAll) {
          let orgList = this.organizations?.filter((x) => data == x.organizationId);
          this.selectedOrganizations = orgList;
          this.regionsList = [];
          let regionsList: Region[] = [];
          let locationsList: Location[] = [];
          let departmentsList: Department[] = [];

          orgList.forEach((value) => {
            regionsList.push(...value.regions);
            locationsList = regionsList.map(obj => {
              return obj.locations.filter(location => location.regionId === obj.id);
            }).reduce((a, b) => a.concat(b), []);
            departmentsList = locationsList.map(obj => {
              return obj.departments.filter(department => department.locationId === obj.id);
            }).reduce((a, b) => a.concat(b), []);
          });

          this.regionsList = sortByField(regionsList, "name");
          this.locationsList = sortByField(locationsList, 'name');
          this.departmentsList = sortByField(departmentsList, 'name');


          this.masterRegionsList = this.regionsList;
          this.masterLocationsList = this.locationsList;
          this.masterDepartmentsList = this.departmentsList;

          if ((data == null || data <= 0) && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
            this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
          }
          else {
            this.isResetFilter = true;
          }
          let businessIdData = [];
          businessIdData.push(data);
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };

          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.GeneralCommentFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            this.filterColumns.agencyIds.dataSource = [];

            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.agencyIdControl = this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.AgencyIds) as AbstractControl;
              let agencyIds = data?.agencies;
              this.filterColumns.agencyIds.dataSource = data?.agencies;
              this.selectedAgencies = agencyIds;
              this.defaultAgencyIds = agencyIds.map((list) => list.agencyId);
              this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
              setTimeout(() => { this.SearchReport() }, 3000);
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        }
        else {
          this.isClearAll = false;
          this.generalcmntReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }


  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.generalcmntReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.generalcmntReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.generalcmntReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.generalcmntReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.generalcmntReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.generalcmntReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.generalcmntReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.generalcmntReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.generalcmntReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }


  public SearchReport(): void {
    this.filteredItems = [];

    let {
      OrganizationsGCR,
      regionIds,
      locationIds,
      departmentIds,
      agencyIds,
      startDate,
      endDate,
      CommentedType,
      CommentedLevel,
      Commentedby,
      OrderId,
      candidateName,
      Userid
    }
      = this.generalcmntReportForm.getRawValue();
    if (!this.generalcmntReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 7 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }


    regionIds = regionIds.length > 0 ? regionIds.join(",") : '';
    locationIds = locationIds.length > 0 ? locationIds.join(",") : '';
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : '';
    this.paramsData =
    {


      OrganizationsGCR: this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      RegionsGCR: regionIds.length == 0 ? '' : regionIds, 
      LocationsGCR: locationIds.length == 0 ? '' : locationIds,
      DepartmentsGCR: departmentIds.length == 0 ? '' : departmentIds,
      AgenciesGCR: agencyIds.length == 0 ? '' : agencyIds.join(","),
      StartDateGCR: formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      EndDateGCR: formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      CommentType: CommentedType == "0" ? "All" : CommentedType == "1" ? "Internal Comments" : "External Comments",
      CommentLevel: CommentedLevel == "0" ? "All" : CommentedLevel == "1" ? "Order Level" : "Candidate Level",
      Commentby: Commentedby == "0" ? "All" : Commentedby == "1" ? "Organization" : "Agency",
      OrderId: OrderId == null || OrderId == "" ? '' : OrderId,
      CandidateName: candidateName == null || candidateName == "" ? '' : candidateName.toString(),
      Userid: this.user?.id
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
        valueField: 'name',
        valueId: 'id',
      },
      regionIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      departmentIds: {
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
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      OrderId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      },
      CommentType: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      CommentLevel: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: this.commentsLevelFilterItems,
        valueField: 'name',
        valueId: 'id',
      },
      Commentby: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },

    }
  }


  public showFilters(): void {
     if (this.isResetFilter) {
    this.onFilterControlValueChangedHandler();
     }
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public saveAsReport(): void {
    let options: any = {
      savePath: "/JsonApiReports/Test/GeneralComments.cls" ,
      linkedCatalog: true,
      saveSort: false,
      catalog: "/JsonApiReports/GeneralComments/GeneralComments.cat" 
    };
    this.logiReportComponent.SaveAsReport(options,"reportIframe");
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.generalcmntReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let EndDate = new Date(Date.now());
    EndDate.setDate(EndDate.getDate() + 7);
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.LocationIds)?.setValue([]);
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.StartDate)?.setValue(new Date(Date.now()));
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.EndDate)?.setValue(EndDate);
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.OrderId)?.setValue([]);
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.CandidateName)?.setValue(null);
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.Commentedby)?.setValue(0);
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.CommentedLevel)?.setValue(0);
    
    this.generalcmntReportForm.get(GeneralCommentReportConstants.formControlNames.CommentedType)?.setValue(0);
    
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    this.generalcmntReportForm.markAllAsTouched();
    if (this.generalcmntReportForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch([new ShowToast(MessageTypes.Error, error)]);
    return;
  }
  public onFilterCandidateSearch: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterCandidateSearchChild(e);
  }
  @OutsideZone
  private onFilterCandidateSearchChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = [];
      ids.push(this.bussinessControl.value);
      let filter: CommonCandidateSearchFilter = {
        searchText: e.text,
        businessUnitIds: ids
      };
      //this.filterColumns.dataSource = [];
      this.store.dispatch(new GetCommonReportCandidateSearch(filter))
        .subscribe((result) => {
          this.candidateFilterData = result.LogiReport.searchCandidates;
          this.candidateSearchData = result.LogiReport.searchCandidates;
          //this.filterColumns.dataSource = this.candidateFilterData;
          // pass the filter data source to updateData method.
          e.updateData(this.candidateFilterData);
        });

    }
  }
}
