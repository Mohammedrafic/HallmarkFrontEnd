import { FilterChangedEvent, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SpecialProjectMessages } from '../../../../../organization-management/specialproject/constants/specialprojects.constant';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { SetHeaderState, ShowSideDialog } from '../../../../../store/app.actions';
import { DocumentLibraryColumnsDefinition } from '../../../constants/documents.constant';
import { DeleteDocumentsFilter, DocumentFolder, DocumentLibraryDto, Documents, DocumentsFilter, DocumentsLibraryPage, DocumentTags, DocumentTypeFilter, DocumentTypes, DownloadDocumentDetail, DownloadDocumentDetailFilter, NodeItem } from '../../../store/model/document-library.model';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { DocumentLibraryState } from '../../../store/state/document-library.state';
import { DeletDocuments, GetDocumentDownloadDeatils, GetDocuments, GetDocumentTypes, GetFoldersTree, IsAddNewFolder, SaveDocumentFolder, SaveDocuments } from '../../../store/actions/document-library.actions';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { FormControlNames, FormDailogTitle, MoreMenuType, StatusEnum } from '../../../enums/documents.enum';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Document } from '@shared/models/document.model';
import { UserState, UserStateModel } from '../../../../../store/user.state';
import { SecurityState } from '../../../../../security/store/security.state';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { Location, LocationsByRegionsFilter } from '@shared/models/location.model';
import { Region, regionFilter } from '@shared/models/region.model';
import { GetLocationsByRegions, GetRegionsByOrganizations } from '../../../../../organization-management/store/logi-report.action';
import { LogiReportState } from '../../../../../organization-management/store/logi-report.state';
import { RolesPerUser } from '@shared/models/user-managment-page.model';
import { datesValidator } from '@shared/validators/date.validator';
import { GetBusinessByUnitType } from '../../../../../security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { FileInfo } from '@syncfusion/ej2-inputs/src/uploader/uploader';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, ORG_ID_STORAGE_KEY } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

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

  @Select(DocumentLibraryState.documentsTypes)
  documentsTypes$: Observable<DocumentTypes[]>;

  @Select(DocumentLibraryState.documentsTags)
  documentsTags$: Observable<DocumentTags[]>;

  @Select(DocumentLibraryState.documentDownloadDetail)
  documentDownloadDetail$: Observable<DownloadDocumentDetail>;

  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;
  selectedOrganizations: BusinessUnit[];

  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  selectedRegions: Region[];

  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  selectedLocations: Location[];

  selectedDocumentNode: NodeItem | null;

  public gridApi!: GridApi;
  public rowData: DocumentLibraryDto[] = [];
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
    select: (event:any , params: DocumentLibraryDto) => {
      this.menuOptionSelected(event, params)
    },
    handleOnDownLoad: (params: DocumentLibraryDto)=>{
      this.downloadDocuemt(params);
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
  public dialogWidth: string = '434px';
  public orgStructureData: any;
  public organizationControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public startDateField: AbstractControl;
  public endDateField: AbstractControl;
  public today = new Date();
  public startDate: any = new Date();
  public businessUnitType: number = 0;
  public businessUnitId: number | null;
  public agencyData: BusinessUnit[] = [];
  public selectedFile: Blob | null;
  public isEditDocument: boolean = false;
  public documentId: number = 0;

  constructor(private store: Store, private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef,
    private confirmService: ConfirmService  ) {
    super();
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.businessUnitType = user?.businessUnitType;
      this.businessUnitId = user?.businessUnitId;
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
      let documentTypesFilter: DocumentTypeFilter = {
        businessUnitType: this.businessUnitType,
        businessUnitId:this.businessUnitId
      }
      this.store.dispatch(new GetDocumentTypes(documentTypesFilter));
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
      if (isAdd != undefined) {
        this.isAddNewFolder = isAdd;
        if (this.isAddNewFolder) {
          this.addRemoveFormcontrols();
          this.dialogWidth = '434px';
          this.formDailogTitle = FormDailogTitle.AddNewFolder;
          this.store.dispatch(new GetDocuments(this.getDocumentFilter()));
          this.store.dispatch(new ShowSideDialog(true));
        }
        else {
          this.isUpload = false;
          this.isAddNewFolder = false;
          this.isEditDocument = false;
          this.store.dispatch(new ShowSideDialog(false));
        }
      }
    });
    this.selectedDocNode$.pipe(takeUntil(this.unsubscribe$)).subscribe((nodeData) => {
      if (nodeData) {
        this.selectedDocumentNode = nodeData;
        if (this.selectedDocumentNode?.text != undefined)
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
      if (this.documentLibraryform.contains(FormControlNames.StartDate)) this.documentLibraryform.removeControl(FormControlNames.StartDate);
      if (this.documentLibraryform.contains(FormControlNames.EndDate)) this.documentLibraryform.removeControl(FormControlNames.EndDate);
      if (this.documentLibraryform.contains(FormControlNames.Comments)) this.documentLibraryform.removeControl(FormControlNames.Comments);
    }
    else {
      if (this.documentLibraryform.contains(FormControlNames.FolderName)) this.documentLibraryform.removeControl(FormControlNames.FolderName);
      this.documentLibraryform.addControl(FormControlNames.DocumentName, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.OrgnizationIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.RegionIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.LocationIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.TypeIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.Tags, new FormControl('', []));
      this.documentLibraryform.addControl(FormControlNames.StatusIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.StartDate, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.EndDate, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.Comments, new FormControl('', []));
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

  public uploadToFile(file: Blob | null) {
    this.selectedFile = file;
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
  private getDocumentFilter() {
    const documentFilter: DocumentsFilter = {
      businessUnitType: this.businessUnitType,
      businessUnitId: this.businessUnitId,
      regionId : null,
      locationId: null,
      folderId:  this.selectedDocumentNode?.id != undefined ?  this.selectedDocumentNode?.id : 2,
      getAll:true
    }
    return documentFilter;
  }
  public getDocuments(): void {
    this.store.dispatch(new GetDocuments(this.getDocumentFilter()));
    this.documentsPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.gridApi?.setRowData([]);
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
    if (this.isAddNewFolder) {
      this.store.dispatch(new IsAddNewFolder(false));
    }
    else {
      this.isAddNewFolder = false;
      this.isUpload = false;
      this.isEditDocument = false;
      this.store.dispatch(new ShowSideDialog(false));
    }
   
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
    this.documentId = 0;
    this.isEditDocument = false;
    this.dialogWidth = '800px';
    this.addRemoveFormcontrols();
    this.formDailogTitle = FormDailogTitle.Upload;
    this.orgStructureData.statusIds.dataSource = this.statusItems;
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
    this.SaveFolderOrDocument();
  }

  public SaveFolderOrDocument() {
    if (this.isAddNewFolder) {
      const documentFolder: DocumentFolder = {
        id: 0,
        name: this.documentLibraryform.get(FormControlNames.FolderName)?.value,
        parentFolderId: this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null,
        businessUnitType: this.businessUnitType,
        businessUnitId: this.businessUnitId,
        status: 1,
        isDeleted: false
      }
      this.store.dispatch(new SaveDocumentFolder(documentFolder)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
        this.documentLibraryform.reset();
        this.closeDialog();
        this.store.dispatch(new GetFoldersTree({ businessUnitType: this.businessUnitType, businessUnitId: this.businessUnitId }));
      });
    }
    else if (this.isUpload || this.isEditDocument) {
      const document: Documents = {
        id: this.documentId,
        businessUnitType: this.businessUnitType,
        businessUnitId: this.documentLibraryform.get(FormControlNames.OrgnizationIds)?.value[0],
        regionId: this.documentLibraryform.get(FormControlNames.RegionIds)?.value[0],
        locationId: this.documentLibraryform.get(FormControlNames.LocationIds)?.value[0],
        documentName: this.documentLibraryform.get(FormControlNames.DocumentName)?.value,
        folderId: this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : 1,
        startDate: this.documentLibraryform.get(FormControlNames.StartDate)?.value,
        endDate: this.documentLibraryform.get(FormControlNames.EndDate)?.value,
        docTypeId: this.documentLibraryform.get(FormControlNames.TypeIds)?.value,
        tags: this.documentLibraryform.get(FormControlNames.Tags)?.value,
        comments: this.documentLibraryform.get(FormControlNames.Comments)?.value,
        selectedFile: this.selectedFile,
        isEdit:this.isEditDocument
      }
      this.store.dispatch(new SaveDocuments(document)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
          this.documentLibraryform.reset();
          this.closeDialog();
          this.getDocuments();
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
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text }
    };
  }
  public onHallmarkSwitcher(event: any) {
    this.halmarkSwitch = !this.halmarkSwitch;
    if (this.halmarkSwitch) {
      this.agencySwitch = false;
      this.organizationSwitch = false;
    }
    this.changeDetectorRef.markForCheck();
  }
  public onAgencySwitcher(event: any) {
    this.agencySwitch = !this.agencySwitch;
    if (this.agencySwitch) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Agency));
      this.halmarkSwitch = false;
      this.organizationSwitch = false;
    }
    this.changeDetectorRef.markForCheck();
  }
  public onOrganizationSwitcher(event: any) {
    this.organizationSwitch = !this.organizationSwitch;
    if (this.organizationSwitch) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
      this.halmarkSwitch = false;
      this.agencySwitch = false;
    }
    this.changeDetectorRef.markForCheck();
  }
  public getOrganizations() {
    this.businessData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.agencySwitch) {
        this.agencyData = data;
      }
      else {
        this.orgStructureData.organizationIds.dataSource = data;
        this.changeDetectorRef.markForCheck();
        this.onOrganizationChangeHandler();
        this.documentLibraryform.get(FormControlNames.OrgnizationIds)?.setValue([parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string) || []]);
        this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
        this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
      }
    });
  }

  public onOrganizationChangeHandler(): void {
    this.organizationControl = this.documentLibraryform.get(FormControlNames.OrgnizationIds) as AbstractControl;
    this.regionIdControl = this.documentLibraryform.get(FormControlNames.RegionIds) as AbstractControl;
    this.locationIdControl = this.documentLibraryform.get(FormControlNames.LocationIds) as AbstractControl;
    this.organizationControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val: number[]) => {
      this.regionIdControl?.setValue(null);
      this.orgStructureData.regionIds.dataSource = []
      if (this.organizationControl?.value.length > 0) {
        this.selectedOrganizations = this.orgStructureData.organizationIds.dataSource.filter((x: any) => val?.includes(x.id));
        let regionFilter: regionFilter = {
          ids: val,
          getAll: true
        };
        this.store.dispatch(new GetRegionsByOrganizations(regionFilter));
        this.changeDetectorRef.markForCheck();
      }
    });
    this.regionIdControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data:any) => {
      this.locationIdControl?.setValue(null);
      this.orgStructureData.locationIds.dataSource = [];
      if (this.regionIdControl?.value?.length > 0) {
        this.selectedRegions = this.orgStructureData.regionIds.dataSource?.filter((object: any) => data?.includes(object.id));
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

  public downloadDocuemt(docItem: DocumentLibraryDto) {
    const downloadFilter: DownloadDocumentDetailFilter = {
      documentId: docItem.id,
      businessUnitType: docItem.documentVisibilities?.length>0? docItem.documentVisibilities?.businessUnitType : this.businessUnitType,
      businessUnitId: docItem.documentVisibilities?.length > 0 ? docItem.documentVisibilities?.businessUnitId : this.businessUnitId
    }
    this.store.dispatch(new GetDocumentDownloadDeatils(downloadFilter)).pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: DownloadDocumentDetail) => {
        if (data) {}
      });
  }

  public menuOptionSelected(event: any, data: DocumentLibraryDto): void {
    switch (Number(event.item.properties.id)) {
      case MoreMenuType['Edit']:
        this.editDocument(data);
        break;
      case MoreMenuType['Delete']:
        this.deleteDocument(data);
        break;
      case MoreMenuType['Share']:
        this.ShareDocumewnt(data);
        break;
    }
  }

  private editDocument(data: DocumentLibraryDto) {
    if (data) {
      this.isEditDocument = true;
      this.formDailogTitle = FormDailogTitle.EditDocument;
      this.documentId = data.id;
      this.isAddNewFolder = false;
      this.isUpload = true;
      this.dialogWidth = '800px';
      this.createForm();
      this.getOrganizations();
      this.orgStructureData.statusIds.dataSource = this.statusItems;
      let status = this.statusItems.find((x) => x.text == data.status);
      this.startDate = data.startDate != null ? new Date(data.startDate.toString()) : this.startDate;
      this.documentLibraryform.setValue({
        documentName: data.name,
        organizationIds: [parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string) || []],
        regionIds: [],
        locationIds: [],
        typeIds: data.docType,
        tags: data.tags,
        statusIds: status?.id,
        startDate: data.startDate != null ? new Date(data.startDate.toString()) : this.startDate,
        endDate: data.endDate != null ? new Date(data.endDate.toString()) : null,
        comments: data.comments,
        agencies: null,
        orgnizations: null
      });
      this.store.dispatch(new ShowSideDialog(true));
    }

  }

  private deleteDocument(data: DocumentLibraryDto): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && data.id) {
          const deletedocumentFilter: DeleteDocumentsFilter = {
            documentIds:[data.id],
            businessUnitType: this.businessUnitType,
            businessUnitId: this.businessUnitId
          }
          this.store.dispatch(new DeletDocuments(deletedocumentFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
            this.getDocuments();
          });
        }
        this.removeActiveCssClass();
      });
  }
  public deleteSelectedDocuments(event: any) {
    let selectedRows:any;
    selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0) {
      this.addActiveCssClass(event);
      this.confirmService
        .confirm(DELETE_RECORD_TEXT, {
          title: DELETE_RECORD_TITLE,
          okButtonLabel: 'Delete',
          okButtonClass: 'delete-button'
        })
        .subscribe((confirm) => {
          if (confirm) {
            let selectedIds = selectedRows.map((item:any) => {
              return item.id;
            })
            const deletedocumentFilter: DeleteDocumentsFilter = {
              documentIds: selectedIds,
              businessUnitType: this.businessUnitType,
              businessUnitId: this.businessUnitId
            }
            this.store.dispatch(new DeletDocuments(deletedocumentFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
              this.getDocuments();
            });
          }
          this.removeActiveCssClass();
        });
    }
  }

  private ShareDocumewnt(data: DocumentLibraryDto) {
   
  }

  public shareSelectedDocuments(event: any) {

  }
}
