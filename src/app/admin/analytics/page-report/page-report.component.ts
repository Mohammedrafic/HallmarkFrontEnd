import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { GetDepartmentsByLocationId, GetLocationsByRegionId } from '@organization-management/store/organization-management.actions';
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
@Component({
  selector: 'app-page-report',
  templateUrl: './page-report.component.html',
  styleUrls: ['./page-report.component.scss']
})
export class PageReportComponent implements OnInit {
  public paramsData: any = {};
  public reportName: LogiReportFileDetails = { name: "/JobDetails/JobDetails.wls" };
  public catelogName: LogiReportFileDetails = { name: "/JobDetails/Dashbord.cat" };
  public title: string = "Job Details";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;

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
  selectedDepartments: Department[];


  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  private touchedFields: Set<string> = new Set();
  public jobDetailsForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  constructor(private store: Store,
    private formBuilder: FormBuilder) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
    }
    this.jobDetailsForm = this.formBuilder.group(
      {
        business: [null, Validators.required],
        regionId: [null, Validators.required],
        locationId: [null, Validators.required],
        departmentId: [null, Validators.required]

      }
    );
  }
  
  ngOnInit(): void {
    this.orderFilterColumnsSetup();
    this.businessData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.filterColumns.businessIds.dataSource = data;

    });
    this.bussinessControl = this.jobDetailsForm.get('business') as AbstractControl;
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      let regionFilter: regionFilter = {
        ids: data,
        getAll: true
      };
      this.store.dispatch(new GetRegionsByOrganizations(regionFilter));
    });
    this.regionIdControl = this.jobDetailsForm.get('regionId') as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {      
    const fieldName = 'region';
      let locationFilter: LocationsByRegionsFilter = {
        ids: data,
        getAll: true
      };
      
      this.markTouchedField(fieldName);
      this.store.dispatch(new GetLocationsByRegions(locationFilter));
    });
    this.locationIdControl = this.jobDetailsForm.get('locationId') as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      const fieldName = 'location';
      let departmentFilter: DepartmentsByLocationsFilter = {
        ids: data,
        getAll: true
      };
      this.markTouchedField(fieldName);
      this.store.dispatch(new GetDepartmentsByLocations(departmentFilter));
    });
    this.departmentIdControl = this.jobDetailsForm.get('departmentId') as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      const fieldName = 'department';      
      this.markTouchedField(fieldName);
    });
    this.onOrganizationsChange();
    this.onRegionsChange();
    this.onLocationsChange();
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
      }
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
