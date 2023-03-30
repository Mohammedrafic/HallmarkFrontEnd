import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { FilterService } from '@shared/services/filter.service';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { uniqBy } from 'lodash';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from '../../../../app.settings';
import { ClearLogiReportState, GetCommonReportFilterOptions, GetLogiReportData } from '../../../organization-management/store/logi-report.action';
import { LogiReportState } from '../../../organization-management/store/logi-report.state';
import { GetOrganizationsStructureAll } from '../../../security/store/security.actions';
import { SecurityState } from '../../../security/store/security.state';
import { LogiReportComponent } from '../../../shared/components/logi-report/logi-report.component';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { ControlTypes, ValueType } from '../../../shared/enums/control-types.enum';
import { LogiReportTypes } from '../../../shared/enums/logi-report-type.enum';
import { MessageTypes } from '../../../shared/enums/message-types';
import { sortByField } from '../../../shared/helpers/sort-by-field.helper';
import { ConfigurationDto } from '../../../shared/models/analytics.model';
import { FilteredItem } from '../../../shared/models/filter.model';
import { LogiReportFileDetails } from '../../../shared/models/logi-report-file';
import { User } from '../../../shared/models/user.model';
import {  Organisation, UserVisibilityFilter } from '../../../shared/models/visibility-settings.model';
import { SetHeaderState, ShowFilterDialog, ShowToast } from '../../../store/app.actions';
import { UserState } from '../../../store/user.state';
import { BUSINESS_DATA_FIELDS } from '../../alerts/alerts.constants';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { analyticsConstants } from '../constants/analytics.constant';
import { CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, OrderTypeOptionsForReport, SkillCategoryDto } from '../models/common-report.model';

@Component({
  selector: 'app-job-event',
  templateUrl: './job-event.component.html',
  styleUrls: ['./job-event.component.scss']
})
export class JobEventComponent implements OnInit, OnDestroy {
  public paramsData: any = {
    "Organizationid": "",
    "Userid": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/JobEvent/JobEventReport.wls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/JobEvent/JobEventReport.cat" };
  public message: string = "";
  public title: string = "Job Event";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;



  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[] = [];

  @Select(LogiReportState.commonReportFilterData)
  public JobEventFilterData$: Observable<CommonReportFilterOptions>;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public jobEventForm: FormGroup;
  public bussinessControl: AbstractControl;
  
 
  public organizations: Organisation[] = [];
  public defaultOrganizations: number;
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  public isInitialLoad: boolean = false;
  public user: User | null;

  
  public baseUrl: string = '';
  private nullValue = "null";
  private joinString = ",";
  

  

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  filterOptionsData: CommonReportFilterOptions;
  skillCategoryIdControl: AbstractControl;
  skillIdControl: AbstractControl;
  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
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
      //this.SetReportData();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;

      this.jobEventForm.get(analyticsConstants.formControlNames.AccrualReportTypes)?.setValue(1);

      this.onFilterControlValueChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.jobEventForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.jobEventForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
  
    this.jobEventForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        Userid: new FormControl([Validators.required])
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.jobEventForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.jobEventForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.jobEventForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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

          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.JobEventFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              this.isAlive = false;
              this.filterOptionsData = data;
              setTimeout(() => { this.SearchReport() }, 3000);
            }
          });
        }
        else {
          this.isClearAll = false;
          this.jobEventForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
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
    let { businessIds, Userid }
      = this.jobEventForm.getRawValue();
    if (!this.jobEventForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }

    this.paramsData =
    {
      "Organizationid": this.selectedOrganizations?.length == 0 ? this.nullValue : this.selectedOrganizations?.map((list) => list.organizationId).join(this.joinString),
      "Userid": this.user?.id
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
  
 
}
