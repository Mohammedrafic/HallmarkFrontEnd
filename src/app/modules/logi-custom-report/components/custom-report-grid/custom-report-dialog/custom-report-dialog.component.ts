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
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import {  GetRegionsByOrganizations } from '@organization-management/store/logi-report.action';
import { regionFilter } from '@shared/models/region.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

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
    '@OrganizationId': "",
    '@RegionIds': "",
    '@LocationIds': "",
    '@DepartmentIDs': "",
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

  public organizations: Organisation[] = [];
  public defaultOrganizations: number[] = [];
  public filterColumns: any;
  private agencyOrganizationId: number;
 public  isInitial=true

 //New changes 
 @Select(SecurityState.organisations)
 public organizationData$: Observable<Organisation[]>;
 public regionsList: Region[] = [];
 public locationsList: Location[] = [];
 public departmentsList: Department[] = [];
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
    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.changeDetectorRef.detectChanges();
      }
    });
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      //this.SetReportData();
      this.agencyOrganizationId = data;
      const filteredArray = this.organizations.filter(obj => obj.organizationId === this.agencyOrganizationId);
      let regionsList: Region[] = [];
      let locationsList: Location[] = [];
      let departmentsList: Department[] = [];

      filteredArray.forEach((value) => {
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
      this.searchreport()
      
    });
    this.businessData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.defaultOrganizations = data.map((list) => list.id).filter(i => i == this.agencyOrganizationId);
    });
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

  public searchreport()
  {
    this.paramsData =
    {
    
      '@OrganizationId': [this.agencyOrganizationId].toString(),
      '@RegionIds': this.regionsList?.map((list) => Number(list.id)).toString(),
      '@LocationIds': this.locationsList.map((list) => Number(list.id)).toString(),
      '@DepartmentIDs': this.departmentsList.map((list) => Number(list.id)).toString(),
 

    }; 
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }


}
