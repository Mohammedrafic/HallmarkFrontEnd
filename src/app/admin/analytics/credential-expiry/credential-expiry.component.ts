import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Location, LocationsByRegionsFilter } from '@shared/models/location.model';
import { Region, regionFilter } from '@shared/models/region.model';
import { Department, DepartmentsByLocationsFilter } from '@shared/models/department.model';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { SetHeaderState } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetDepartmentsByLocations, GetLocationsByRegions, GetRegionsByOrganizations } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { startDateValidator } from '@shared/validators/date.validator';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';

@Component({
  selector: 'app-credential-expiry',
  templateUrl: './credential-expiry.component.html',
  styleUrls: ['./credential-expiry.component.scss']
})
export class CredentialExpiryComponent implements OnInit {
  public paramsData: any = {
    "OrganizationParamACCR": "",
    "StartDateParamACCR": "",
    "EndDateParamACCR": "",
    "RegionParamACCR": "",
    "LocationParamACCR": "",
    "DepartmentParamACCR": ""
  };
  public reportName: LogiReportFileDetails = { name: "/CredentialExpiry/CredentialExpiry.wls" };
  public catelogName: LogiReportFileDetails = { name: "/CredentialExpiry/Dashbord.cat" };
  public title: string = "Credential Expiry";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;

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
  departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
  selectedDepartments: Department[];


  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;
  selectedOrganizations: BusinessUnit[];

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  private touchedFields: Set<string> = new Set();
  public credentialExpiryForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: BusinessUnit[] = [];
  public today = new Date();
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  constructor(private store: Store,
    private formBuilder: FormBuilder) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
    }
    this.credentialExpiryForm = this.formBuilder.group(
      {
        business: [null, Validators.required],
        startDate: [null, Validators.required],
        endDate: [null, Validators.required],
        regionId: [null, Validators.required],
        locationId: [null, Validators.required],
        departmentId: [null, Validators.required]

      }
    );
  }

  ngOnInit(): void {
    this.orderFilterColumnsSetup();
    this.businessData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizations = data;
      this.filterColumns.businessIds.dataSource = data;

    });
    this.bussinessControl = this.credentialExpiryForm.get('business') as AbstractControl;
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {

      this.selectedOrganizations = this.organizations?.filter((x) => data?.includes(x.id));
      let regionFilter: regionFilter = {
        ids: data,
        getAll: true
      };
      this.store.dispatch(new GetRegionsByOrganizations(regionFilter));
    });
    this.regionIdControl = this.credentialExpiryForm.get('regionId') as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      const fieldName = 'region';
      this.selectedRegions = this.regions?.filter((object) => data?.includes(object.id));
      let locationFilter: LocationsByRegionsFilter = {
        ids: data,
        getAll: true
      };

      this.markTouchedField(fieldName);
      this.store.dispatch(new GetLocationsByRegions(locationFilter));
    });
    this.locationIdControl = this.credentialExpiryForm.get('locationId') as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      const fieldName = 'location';
      this.selectedLocations = this.locations?.filter((object) => data?.includes(object.id));
      let departmentFilter: DepartmentsByLocationsFilter = {
        ids: data,
        getAll: true
      };
      this.markTouchedField(fieldName);
      this.store.dispatch(new GetDepartmentsByLocations(departmentFilter));
    });
    this.departmentIdControl = this.credentialExpiryForm.get('departmentId') as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      const fieldName = 'department';
      this.selectedDepartments = this.departments?.filter((object) => data?.includes(object.departmentId));
      this.markTouchedField(fieldName);
    });
    this.onOrganizationsChange();
    this.onRegionsChange();
    this.onLocationsChange();
  }

  public SearchReport(): void {
    if (this.credentialExpiryForm?.valid) {
      let { startDate, endDate } = this.credentialExpiryForm.getRawValue();
      this.paramsData =
      {
        "OrganizationParamACCR": this.selectedOrganizations?.map((list) => list.name),
        "StartDateParamACCR": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
        "EndDateParamACCR": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
        "RegionParamACCR": this.selectedRegions?.map((list) => list.name),
        "LocationParamACCR": this.selectedLocations?.map((list) => list.name),
        "DepartmentParamACCR": this.selectedDepartments?.map((list) => list.departmentName)
      };
      this.logiReportComponent.paramsData = this.paramsData;
      this.logiReportComponent.RenderReport();
    } else {
      this.credentialExpiryForm?.updateValueAndValidity();
    }
  }
  private resetLocation(): void {
    this.locationIdControl.reset(null, { emitValue: false });
    this.locationIdControl.markAsUntouched();
  }
  private resetRegion(): void {
    this.regionIdControl.reset(null, { emitValue: false });
    this.regionIdControl.markAsUntouched();
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
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text }
    }
  }
  private onOrganizationsChange(): void {
    this.regions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Region[]) => {
        if (data != undefined) {
          this.regions = data;
          this.filterColumns.regionIds.dataSource = this.regions;
          this.resetRegion();
          this.resetLocation();
          this.resetDepartment();
        }
      });
  }
  private onRegionsChange(): void {
    this.locations$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Location[]) => {
        if (data != undefined) {
          this.locations = data;
          this.filterColumns.locationIds.dataSource = this.locations;
          this.resetLocation();
          this.resetDepartment();
        }
      });
  }
  private onLocationsChange(): void {
    this.departments$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Department[]) => {
        if (data != undefined) {
          this.departments = data;
          this.filterColumns.departmentIds.dataSource = this.departments;
          this.resetDepartment();
        }
      });
  }
  private resetDepartment(): void {
    this.departmentIdControl.reset(null, { emitValue: false });
    this.departmentIdControl.markAsUntouched();
  }
  private markTouchedField(field: string) {
    this.touchedFields.add(field);
  }

}
