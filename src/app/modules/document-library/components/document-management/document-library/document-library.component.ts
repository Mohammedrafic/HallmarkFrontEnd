import { FilterChangedEvent, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { debounceTime, filter, Observable, Subject, takeUntil } from 'rxjs';
import { SpecialProjectMessages } from '../../../../../organization-management/specialproject/constants/specialprojects.constant';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { SetHeaderState, ShowSideDialog } from '../../../../../store/app.actions';
import { BUSINESS_UNITS_VALUES, DocumentLibraryColumnsDefinition } from '../../../constants/documents.constant';
import { DocumentFolder, DocumentsInfo, DocumentsLibraryPage, NodeItem } from '../../../store/model/document-library.model';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { DocumentLibraryState } from '../../../store/state/document-library.state';
import { GetDocuments, IsAddNewFolder, SaveDocumentFolder } from '../../../store/actions/document-library.actions';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { FormControlNames, FormDailogTitle, MoreMenuType, StatusEnum } from '../../../enums/documents.enum';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Document } from '@shared/models/document.model';
import { UserState, UserStateModel } from '../../../../../store/user.state';
import { SecurityState } from '../../../../../security/store/security.state';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType, GetRolePerUser } from '../../../../../security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Location, LocationsByRegionsFilter } from '@shared/models/location.model';
import { Region, regionFilter } from '@shared/models/region.model';
import { GetLocationsByRegions, GetRegionsByOrganizations } from '../../../../../organization-management/store/logi-report.action';
import { LogiReportState } from '../../../../../organization-management/store/logi-report.state';
import { RolesPerUser } from '@shared/models/user-managment-page.model';
import { datesValidator } from '../../../../../shared/validators/date.validator';

@Component({
  selector: 'app-document-library',
  templateUrl: './document-library.component.html',
  styleUrls: ['./document-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentLibraryComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy, AfterViewInit {

  public title: string = "Documents";
  private unsubscribe$: Subject<void> = new Subject();

  @Select(DocumentLibraryState.selectedDocumentNode)
  selectedDocNode$: Observable<NodeItem>;

  @Select(DocumentLibraryState.isAddNewFolder)
  IsAddNewFolder$: Observable<boolean>;

  @Select(DocumentLibraryState.documentsPage)
  documentsPage$: Observable<DocumentsLibraryPage>;

  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;
  selectedOrganizations: BusinessUnit[];

  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  selectedRegions: Region[];

  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  selectedLocations: Location[];

  @Select(SecurityState.rolesPerUsers)
  rolesPerUsers$: Observable<RolesPerUser>;

  selectedDocumentNode: NodeItem | null;


  public gridApi!: GridApi;
  public rowData: DocumentsInfo[] = [];
  public rowSelection: 'single' | 'multiple' = 'single';

  public editMenuItems: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[2], id: '2' },
  ];

  public statusItems: ItemModel[] = [
    { text: StatusEnum[0], id: '0' },
    { text: StatusEnum[1], id: '1' }
  ];

  public actionCellrenderParams: any = {
    editMenuITems: this.editMenuItems,
    handleOnEdit: (params: DocumentsInfo) => {
      // this.onEdit.next(params);
    },
    handleOnDelete: (params: any) => {
      //this.deleteSpecialProject(params);
    }
  }
  public allOption: string = "All";
  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public statusFields = {
    text: 'text',
    value: 'id',
  };
  public orgsFields = {
    text: 'name',
    value: 'organizationId',
  };
  public halmarkSwitch: boolean = true;
  public agencySwitch: boolean = false;
  public organizationSwitch: boolean = false;
  public documentLibraryform: FormGroup;
  public isAddNewFolder: boolean = false;
  public isUpload: boolean = false;
  public formDailogTitle: string = '';

  public documents: Blob[] = [];
  public deleteDocumentsGuids: string[] = [];
  public uploadDocumentInfo: DocumentsInfo | null;
  public dialogWidth: string = '';
  public orgStructureData: any;
  public organizationControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public startDateField: AbstractControl;
  public endDateField: AbstractControl;
  public today = new Date();
  public startDate: any = new Date();
  public businessUnits = BUSINESS_UNITS_VALUES;

  constructor(private store: Store, private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef) {
    super();
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
    }
    this.today.setHours(0, 0, 0);
  }
  public readonly columnDefinitions: ColumnDefinitionModel[] = DocumentLibraryColumnsDefinition(this.actionCellrenderParams, this.datePipe);

  ngOnInit(): void {
    this.startDate = null;
    this.store.dispatch(new SetHeaderState({ title: 'Documents', iconName: 'folder' }));
    this.orgStructureDataSetup();
    this.createForm();
    this.IsAddNewFolder$.pipe(takeUntil(this.unsubscribe$)).subscribe((isAdd) => {
      this.isAddNewFolder = isAdd;
      if (this.isAddNewFolder) {
        this.addRemoveFormcontrols();
        this.dialogWidth = '434px';
        this.formDailogTitle = FormDailogTitle.AddNewFolder;
        this.store.dispatch(new ShowSideDialog(true));
      }
      else {
        this.isUpload = false;
        this.store.dispatch(new ShowSideDialog(false));
      }
    });
    this.selectedDocNode$.pipe(takeUntil(this.unsubscribe$)).subscribe((nodeData) => {
      if (nodeData) {
        this.selectedDocumentNode = nodeData;
        this.getDocuments();
      }
    });
  }
  ngAfterViewInit(): void {
    this.orgStructureData.organizationIds.dataSource = [];
    this.orgStructureData.regionIds.dataSource = [];
    this.orgStructureData.locationIds.dataSource = [];
    this.documentLibraryform.get(FormControlNames.OrgnizationIds)?.setValue([]);
    this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
    this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public createForm(): void {
    this.documentLibraryform = new FormGroup({})
    this.addRemoveFormcontrols();
  }

  public addRemoveFormcontrols() {
    if (this.isAddNewFolder) {
      this.documentLibraryform.addControl(FormControlNames.FolderName, new FormControl(null, [Validators.required]));
      if (this.documentLibraryform.contains(FormControlNames.DocumentName)) this.documentLibraryform.removeControl(FormControlNames.DocumentName);
      if (this.documentLibraryform.contains(FormControlNames.OrgnizationIds)) this.documentLibraryform.removeControl(FormControlNames.OrgnizationIds);
      if (this.documentLibraryform.contains(FormControlNames.RegionIds)) this.documentLibraryform.removeControl(FormControlNames.RegionIds);
      if (this.documentLibraryform.contains(FormControlNames.LocationIds)) this.documentLibraryform.removeControl(FormControlNames.LocationIds);
      if (this.documentLibraryform.contains(FormControlNames.TypeIds)) this.documentLibraryform.removeControl(FormControlNames.TypeIds);
      if (this.documentLibraryform.contains(FormControlNames.Tags)) this.documentLibraryform.removeControl(FormControlNames.Tags);
      if (this.documentLibraryform.contains(FormControlNames.StatusIds)) this.documentLibraryform.removeControl(FormControlNames.StatusIds);
      if (this.documentLibraryform.contains(FormControlNames.RoleIds)) this.documentLibraryform.removeControl(FormControlNames.RoleIds);
      if (this.documentLibraryform.contains(FormControlNames.StartDate)) this.documentLibraryform.removeControl(FormControlNames.StartDate);
      if (this.documentLibraryform.contains(FormControlNames.EndDate)) this.documentLibraryform.removeControl(FormControlNames.EndDate);
    }
    else {
      if (this.documentLibraryform.contains(FormControlNames.FolderName)) this.documentLibraryform.removeControl(FormControlNames.FolderName);
      this.documentLibraryform.addControl(FormControlNames.DocumentName, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.OrgnizationIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.RegionIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.LocationIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.TypeIds, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.Tags, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.StatusIds, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.RoleIds, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.StartDate, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.EndDate, new FormControl(null, []));
      this.applyDateValidations();
    }
    this.documentLibraryform.addControl(FormControlNames.Agencies, new FormControl(null, []));
    this.documentLibraryform.addControl(FormControlNames.Orgnizations, new FormControl(null, []));
  }

  private applyDateValidations() {
    this.startDateField = this.documentLibraryform.get(FormControlNames.StartDate) as AbstractControl;
    this.endDateField = this.documentLibraryform.get(FormControlNames.EndDate) as AbstractControl;
    this.startDateField.valueChanges.subscribe(() => {
      if (this.endDateField?.value != null) {
        this.endDateField.addValidators(datesValidator(this.documentLibraryform, FormControlNames.StartDate, FormControlNames.EndDate));
        this.endDateField.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    });
    this.endDateField.valueChanges.subscribe(() => {
      if (this.startDateField?.value != null) {
        this.startDateField.addValidators(datesValidator(this.documentLibraryform, FormControlNames.StartDate, FormControlNames.EndDate));
        this.startDateField.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    });
  }

  onPageSizeChanged(event: any) {
    this.gridOptions.cacheBlockSize = Number(event.value.toLowerCase().replace("rows", ""));
    this.gridOptions.paginationPageSize = Number(event.value.toLowerCase().replace("rows", ""));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows", "")));
      this.gridApi.setRowData(this.rowData);
    }
  }

  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => SpecialProjectMessages.NoRowsMessage,
  };

  public sideBar = {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filters',
        toolPanel: 'agFiltersToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
    ],
  };

  gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.columnDefinitions,
    rowData: this.rowData,
    sideBar: this.sideBar,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
    }
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
  }

  public getDocuments(): void {
    this.store.dispatch(new GetDocuments());
    this.documentsPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (!data || !data?.items.length) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
        this.rowData = data.items;
        this.gridApi?.setRowData(this.rowData);
      }
    });

  }

  public closeDialog() {
    this.orgStructureData.organizationIds.dataSource = [];
    this.orgStructureData.regionIds.dataSource = [];
    this.orgStructureData.locationIds.dataSource = [];
    this.orgStructureData.statusIds.dataSource = [];
    this.store.dispatch(new ShowSideDialog(false));
    this.isAddNewFolder = false;
    this.isUpload = false;
  }

  public onDocumentsSelected(documents: Blob[]): void {
    this.documents = documents;
  }

  public onDocumentDeleted(document: Document): void {
    this.deleteDocumentsGuids.push(document.documentId);
  }

  public handleOnUploadBtnClick() {
    this.isAddNewFolder = false;
    this.isUpload = true;
    this.dialogWidth = '800px';
    this.formDailogTitle = FormDailogTitle.Upload;
    this.addRemoveFormcontrols();
    this.orgStructureData.statusIds.dataSource = this.statusItems;
    this.store.dispatch(new GetRolePerUser(1, []));
    this.documentLibraryform.get(FormControlNames.OrgnizationIds)?.setValue([]);
    this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
    this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
    this.getOrganizations();
    
    this.store.dispatch(new ShowSideDialog(true));
  }

  public handleOnSave() {
    this.documentLibraryform.markAllAsTouched();
    if (this.documentLibraryform.invalid) {
      return;
    }

    if (this.isAddNewFolder) {
      let businessUnitId = this.businessUnits.filter((x: any) =>  { return x.id == 1 });
      const documentFolder: DocumentFolder = {
          id: 0,
          name: this.documentLibraryform.get(FormControlNames.FolderName)?.value,
          parentFolderId: null,
          businessUnitType: businessUnitId[0].id,
          businessUnitId: null,
          status: 0,
          isDeleted: false
      }
      this.store.dispatch(new SaveDocumentFolder(documentFolder)).subscribe(val => {
        this.documentLibraryform.reset();
        this.closeDialog();
      });
    }
  }

  private orgStructureDataSetup(): void {
    this.orgStructureData = {
      organizationIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      regionIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      typeIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      statusIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [{id:1,name:'Active'}],
        valueField: 'name',
        valueId: 'id',
      },
      roleIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text }
    };
  }
  public onHallmarkSwitcher(event: any) {
    this.halmarkSwitch = !this.halmarkSwitch;
    this.changeDetectorRef.markForCheck();
  }
  public onAgencySwitcher(event: any) {
    this.agencySwitch = !this.agencySwitch;
    this.changeDetectorRef.markForCheck();
  }
  public onOrganizationSwitcher(event: any) {
    this.organizationSwitch = !this.organizationSwitch;
    this.changeDetectorRef.markForCheck();
  }
  public getOrganizations() {
    this.businessData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.orgStructureData.organizationIds.dataSource = data;
      this.changeDetectorRef.markForCheck();
      this.onOrganizationChangeHandler();
      this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
      this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
    });
  }

  public getRoles() {
    this.rolesPerUsers$.pipe(takeUntil(this.unsubscribe$))
  }
  public onOrganizationChangeHandler(): void {
    this.organizationControl = this.documentLibraryform.get(FormControlNames.OrgnizationIds) as AbstractControl;
    this.regionIdControl = this.documentLibraryform.get(FormControlNames.RegionIds) as AbstractControl;
    this.locationIdControl = this.documentLibraryform.get(FormControlNames.LocationIds) as AbstractControl;
    this.organizationControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val: number[]) => {
      this.regionIdControl?.setValue([]);
      this.selectedOrganizations = this.orgStructureData.organizationIds.dataSource.filter((x: any) => val?.includes(x.id));
      let regionFilter: regionFilter = {
        ids: val,
        getAll: true
      };
      this.store.dispatch(new GetRegionsByOrganizations(regionFilter));
      this.changeDetectorRef.markForCheck();
    });
    this.regionIdControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.locationIdControl?.setValue([]);
      this.orgStructureData.locationIds.dataSource=[]
      if (this.regionIdControl?.value.length > 0) {
        this.selectedRegions = this.orgStructureData.regionIds.dataSource?.filter((object:any) => data?.includes(object.id));
        let locationFilter: LocationsByRegionsFilter = {
          ids: data,
          getAll: true
        };
        this.store.dispatch(new GetLocationsByRegions(locationFilter));
        this.changeDetectorRef.markForCheck();
      }
    });
    this.onOrganizationsChange();
    this.onRegionsChange();
  }

  public onOrganizationsChange(): void {
    this.regions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Region[]) => {
        if (data != undefined) {
          this.orgStructureData.regionIds.dataSource = data;
          this.changeDetectorRef.markForCheck();
        }
      });
  }
  public onRegionsChange(): void {
    this.locations$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Location[]) => {
        if (data != undefined) {
          this.orgStructureData.locationIds.dataSource = data;
          this.changeDetectorRef.markForCheck();
        }
      });
  }
}
