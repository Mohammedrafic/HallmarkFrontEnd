import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AppSettings, APP_SETTINGS } from '../../../../app.settings';
import { LogiReportState } from '../../../organization-management/store/logi-report.state';
import { SecurityState } from '../../../security/store/security.state';
import { LogiReportComponent } from '../../../shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '../../../shared/enums/logi-report-type.enum';
import { ConfigurationDto } from '../../../shared/models/analytics.model';
import { BusinessUnit } from '../../../shared/models/business-unit.model';
import { FilteredItem } from '../../../shared/models/filter.model';
import { LogiReportFileDetails } from '../../../shared/models/logi-report-file';
import { SetHeaderState, ShowFilterDialog } from '../../../store/app.actions';
import { UserState } from '../../../store/user.state';
import { BUSINESS_DATA_FIELDS } from '../../alerts/alerts.constants';
import { CommonReportFilterOptions } from '../models/common-report.model';
import { FilterService } from '@shared/services/filter.service';
import { GetBusinessByUnitType } from '../../../security/store/security.actions';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { ControlTypes, ValueType } from '../../../shared/enums/control-types.enum';
import { formatDate } from '@angular/common';
import { analyticsConstants } from '../constants/analytics.constant';

@Component({
  selector: 'app-daily-order-status',
  templateUrl: './daily-order-status.component.html',
  styleUrls: ['./daily-order-status.component.scss']
})
export class DailyOrderStatusComponent implements OnInit, OnDestroy {
  public paramsData: any = {
    "OrganizationParamDOS": "",
    "StartDateParamDOS": "",
    "EndDateParamDOS": "",
    "BearerParamDOS": "",
    "BusinessUnitIdParamDOS": "",
    "HostName": "",
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/DailyOrderStatus/DailyOrderStatus.wls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/DailyOrderStatus/DailyOrderStatus.cat" };
  public title: string = "Daily Order Status";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  public allOption: string = "All";

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;
  selectedOrganizations: BusinessUnit[];

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public dailyOrderForm: FormGroup;
  public bussinessControl: AbstractControl;
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string;
  public filterOptionsData: CommonReportFilterOptions;
  public organizations: BusinessUnit[] = [];
  public defaultOrganizations: number[] = [];

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService, @Inject(APP_SETTINGS) private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
    this.initForm();
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
    }
    //this.SetReportData();    
  }

  ngOnInit(): void {

    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {

      // this.SetReportData();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
      this.orderFilterColumnsSetup();
      let businessIdData = [];
      businessIdData.push(data);
      this.onFilterControlValueChangedHandler();
      this.SearchReport();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.dailyOrderForm = this.formBuilder.group(
      {
        businessIds: new FormControl({ value: [] }, [Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now()), [Validators.required]),
        
      }
    );
  }

  public SearchReport(): void {
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let { startDate, endDate,  } = this.dailyOrderForm.getRawValue();

    this.paramsData =
    {
      "OrganizationParamDOS": this.selectedOrganizations?.map((list) => list.id).join(","),
      "StartDateParamDOS": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamDOS": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "BearerParamDOS": auth,
      "BusinessUnitIdParamDOS": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl,
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
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      
    }
  }


  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.dailyOrderForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;
    this.businessData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizations = data;
      this.filterColumns.businessIds.dataSource = data;
      this.defaultOrganizations = data.map((list) => list.id).filter(i => i == this.agencyOrganizationId);
    });
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (!this.isClearAll) {
        this.selectedOrganizations = this.organizations?.filter((x) => data?.includes(x.id));
      }
      else {
        this.isClearAll = false;
      }
    });
  }
  public showFilters(): void {
    this.onFilterControlValueChangedHandler();
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.dailyOrderForm, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
 
    this.dailyOrderForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.dailyOrderForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
 
    this.filteredItems = [];
  }
  public onFilterApply(): void {
    this.dailyOrderForm.markAllAsTouched();
    if (this.dailyOrderForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
