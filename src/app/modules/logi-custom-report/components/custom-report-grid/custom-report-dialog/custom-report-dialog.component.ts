import { DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, Inject, ChangeDetectorRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject, take, takeUntil, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from '../../../../../../app.settings';
import { LogiReportComponent } from '../../../../../shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '../../../../../shared/enums/logi-report-type.enum';
import { AbstractPermissionGrid } from '../../../../../shared/helpers/permissions/abstract-permission-grid';
import { LogiReportFileDetails } from '../../../../../shared/models/logi-report-file';
import { User } from '../../../../../shared/models/user.model';
import { UserState } from '../../../../../store/user.state';
import { SaveCustomReport } from '../../../store/actions/logi-custom-report.actions';
import { AddLogiCustomReportRequest, LogiCustomReport } from '../../../store/model/logi-custom-report.model';
import { LogiCustomReportState } from '../../../store/state/logi-custom-report.state';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { Department, DepartmentsByLocationsFilter } from '@shared/models/department.model';
import { Region } from '@shared/models/region.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetDepartmentsByLocations, GetLocationsByRegions, GetRegionsByOrganizations } from '@organization-management/store/logi-report.action';
import { regionFilter } from '@shared/models/region.model';
import { Location, LocationsByRegionsFilter } from '@shared/models/location.model';

@Component({
  selector: 'app-custom-report-dialog',
  templateUrl: './custom-report-dialog.component.html',
  styleUrls: ['./custom-report-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomReportDialogComponent extends AbstractPermissionGrid implements OnInit, AfterViewInit {
  public user: User | null;
  @Input() selectedLog$: BehaviorSubject<LogiCustomReport> = new BehaviorSubject<LogiCustomReport>(null!);


  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

  selectedLog: LogiCustomReport;
  private isAlive = true;
  private unsubscribe$: Subject<void> = new Subject();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public paramsData: any = {
    'OrganizationParam': "",
    'RegionsParam': "",
    'LocationsParam': "",
    'DepartmentsParam': "",
  };
  public catelogName: LogiReportFileDetails;
  public reportName: LogiReportFileDetails;
  public customCSSName = 'logi-Custom-report-iframe-div';
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public reportFormGroup: FormGroup;
  public isAddCustomReportSidebarShown: boolean;
  @Select(LogiCustomReportState.SaveCustomReport)
  public saveCustomReport$: Observable<LogiCustomReport>;


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

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;
  selectedOrganizations: BusinessUnit[];

  public organizations: BusinessUnit[] = [];
  public defaultOrganizations: number[] = [];
  public filterColumns: any;
  private agencyOrganizationId: number;
 public  isInitial=true
  constructor(
    protected override store: Store,
    private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(APP_SETTINGS) private appSettings: AppSettings
  ) {
    super(store);
    this.user = this.store.selectSnapshot(UserState.user);

  }
  override ngOnInit(): void {

    this.selectedLog$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      if (data) {
        this.selectedLog = data;
        this.catelogName = { name: this.selectedLog.catalogPath }
        this.reportName = { name: this.selectedLog.path }
      }
    });

    this.reportFormGroup = new FormGroup({
      reportName: new FormControl('', [Validators.required]),

    });
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      //this.SetReportData();
      this.agencyOrganizationId = data;

    });
    this.businessData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizations = data;
      this.defaultOrganizations = data.map((list) => list.id).filter(i => i == this.agencyOrganizationId);
    });

    let regionFilter: regionFilter = {
      ids: [this.agencyOrganizationId],
      getAll: true
    }
    this.store.dispatch(new GetRegionsByOrganizations(regionFilter));

    this.onOrganizationsChange();
    this.onLocationsChange();
    this.onRegionsChange();

  }
  ngAfterViewInit(): void {


  }
  public onClose(): void {
    this.logiReportComponent.CloseReport("reportIframe");
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.refreshParent.emit();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public saveAsReport(): void {

    this.reportFormGroup.markAllAsTouched();
    if (this.reportFormGroup.valid && this.reportFormGroup.errors == null) {
      const formValues = this.reportFormGroup.getRawValue();
      var path = "/IRPReports/Hallmark/" + formValues.reportName.replace(/ /g, '_') + this.datePipe.transform(Date.now(), 'MMddyyyy_HH_mm') as string + ".wls";
      const addLogiCustomReportRequestDto: AddLogiCustomReportRequest = {
        customReportName: formValues.reportName,
        isSystem: false,
        path: path,
        catalogPath: this.selectedLog.catalogPath,
        reportParamaters: '',
        businessUnitId: this.selectedLog.businessUnitId
      };

      this.store.dispatch(new SaveCustomReport(addLogiCustomReportRequestDto));

      let options: any = {
        savePath: path,
        linkedCatalog: true,
        saveSort: false,
        catalog: "/CustomReport/CustomReport.cat"
      };
      this.logiReportComponent.SaveAsReport(options, "reportIframe");
      setTimeout(() => { this.refreshCustomReportComponent() }, 2000);
      this.isAddCustomReportSidebarShown = false;

    }
  }

  public refreshCustomReportComponent() {

    this.refreshParent.emit();
  }
  public saveAsPopUp(): void {
    this.isAddCustomReportSidebarShown = true;
  }



  public onAddReportClose(): void {
    this.isAddCustomReportSidebarShown = false;
  }
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  private onOrganizationsChange(): void {
    this.regions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Region[]) => {
        if (data != undefined) {
          this.regions = data
          const region = this.regions?.map((list) => Number(list.id))
          let locationFilter: LocationsByRegionsFilter = {
            ids: region,
            businessUnitIds: [this.agencyOrganizationId],
            getAll: true
          };
          this.store.dispatch(new GetLocationsByRegions(locationFilter));
          // this.onRegionsChange()
        }
      });
  }
  private onRegionsChange(): void {
    this.locations$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Location[]) => {
        if (data != undefined) {
          this.locations = data;
          const location = this.locations?.map((list) => Number(list.id))
          let departmentFilter: DepartmentsByLocationsFilter = {
            ids: location,
            businessUnitIds: [this.agencyOrganizationId],
            getAll: true
          };
          this.store.dispatch(new GetDepartmentsByLocations(departmentFilter))
        }
      });
  }
  private onLocationsChange(): void {
    this.departments$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Department[]) => {
        if (data != undefined) {
          this.departments = data;
          if(this.departments.length > 0)
          if(this.isInitial)
          {
            this.isInitial=false
          this.paramsData =
          {
            OrganizationParam: [this.agencyOrganizationId],
            RegionsParam: this.regions?.map((list) => Number(list.id)),
            LocationsParam: this.locations.map((list) => Number(list.id)),
            DepartmentsParam: this.departments.map((list) => Number(list.departmentId)),
    
          };   
          setTimeout(() => {
          this.logiReportComponent.paramsData = this.paramsData;
          this.logiReportComponent.RenderReport();
          },1000)
        }
        }
      });
  }

}
