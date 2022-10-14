import { CellClickedEvent, FilterChangedEvent, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SpecialProjectMessages } from '../../../../../organization-management/specialproject/constants/specialprojects.constant';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { SetHeaderState, ShowDocPreviewSideDialog, ShowSideDialog, ShowToast } from '../../../../../store/app.actions';
import { DocumentLibraryColumnsDefinition } from '../../../constants/documents.constant';
import { DeleteDocumentsFilter, DocumentFolder, DocumentLibraryDto, Documents, DocumentsFilter, DocumentsLibraryPage, DocumentTags, DocumentTypeFilter, DocumentTypes, DownloadDocumentDetail, DownloadDocumentDetailFilter, NodeItem, ShareDocumentDto, ShareDocumentInfoFilter, ShareDocumentInfoPage, ShareDocumentsFilter } from '../../../store/model/document-library.model';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { DocumentLibraryState } from '../../../store/state/document-library.state';
import { DeletDocuments, GetDocumentById, GetDocumentDownloadDeatils, GetDocuments, GetDocumentsSelectedNode, GetDocumentTypes, GetFoldersTree, GetSharedDocuments, IsAddNewFolder, SaveDocumentFolder, SaveDocuments, ShareDocuments } from '../../../store/actions/document-library.actions';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { documentsColumnField, FileType, FormControlNames, FormDailogTitle, MoreMenuType, StatusEnum } from '../../../enums/documents.enum';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Document } from '@shared/models/document.model';
import { UserState } from '../../../../../store/user.state';
import { SecurityState } from '../../../../../security/store/security.state';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { Location, LocationsByRegionsFilter } from '@shared/models/location.model';
import { Region, regionFilter } from '@shared/models/region.model';
import { GetLocationsByRegions, GetRegionsByOrganizations } from '../../../../../organization-management/store/logi-report.action';
import { LogiReportState } from '../../../../../organization-management/store/logi-report.state';
import { datesValidator } from '@shared/validators/date.validator';
import { GetBusinessByUnitType } from '../../../../../security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, ORG_ID_STORAGE_KEY } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { MessageTypes } from '@shared/enums/message-types';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-document-library',
  templateUrl: './document-library.component.html',
  styleUrls: ['./document-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentLibraryComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy, AfterViewInit {

  public title: string = "Documents";
  private unsubscribe$: Subject<void> = new Subject();

  @Select(DocumentLibraryState.documentsPage)
  documentsPage$: Observable<DocumentsLibraryPage>;

  @Select(DocumentLibraryState.shareDocumentInfoPage)
  shareDocumentInfoPage$: Observable<ShareDocumentInfoPage>;

  @Select(DocumentLibraryState.documentsTypes)
  documentsTypes$: Observable<DocumentTypes[]>;

  @Select(DocumentLibraryState.documentsTags)
  documentsTags$: Observable<DocumentTags[]>;

  @Select(DocumentLibraryState.documentDownloadDetail)
  documentDownloadDetail$: Observable<DownloadDocumentDetail>;

  @Select(DocumentLibraryState.documentLibraryDto)
  documentLibraryDto$: Observable<DocumentLibraryDto>;

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
    select: (event: any, params: DocumentLibraryDto) => {
      this.menuOptionSelected(event, params)
    },
    handleOnDownLoad: (params: DocumentLibraryDto) => {
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
  public mspSwitch: boolean = false;
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
  public shareOrganizationControl: AbstractControl;
  public shareAgencyControl: AbstractControl;
  public startDateField: AbstractControl;
  public endDateField: AbstractControl;
  public today = new Date();
  public startDate: any = new Date();
  public businessUnitType: number = 0;
  public businessUnitId: number = parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string);
  public agencyData: BusinessUnit[] = [];
  public mspData: BusinessUnit[] = [];
  public selectedFile: Blob | null;
  public isEditDocument: boolean = false;
  public documentId: number = 0;
  public isShare: boolean = false;
  public shaeDocumentIds: number[] = [];
  public downloadedFileName: string = '';
  public previewUrl: SafeResourceUrl | null;
  public previewTitle: string = "Document Preview";
  public selectedNodeText: string = '';
  public editOrganizationIds: number[] = [];
  public editRegionIds: number[] = [];
  public editLocationIds: number[] = [];


  constructor(private store: Store, private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private sanitizer: DomSanitizer,
    private action$: Actions) {
    super();
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.businessUnitType = user?.businessUnitType;
      switch (user?.businessUnitType) {
        case BusinessUnitType.Hallmark:
          this.halmarkSwitch = true;
          break;
        case BusinessUnitType.Agency:
          this.agencySwitch = true;
          break;
        case BusinessUnitType.Organization:
          this.organizationSwitch = true;
          break;
        default:
          break;
      }
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
      let documentTypesFilter: DocumentTypeFilter = {
        businessUnitType: this.businessUnitType,
        businessUnitId: this.businessUnitId
      }
      this.store.dispatch(new GetDocumentTypes(documentTypesFilter));
    }
    this.today.setHours(0, 0, 0);
  }
  public columnDefinitions: ColumnDefinitionModel[] = DocumentLibraryColumnsDefinition(this.actionCellrenderParams, this.datePipe);

  ngOnInit(): void {
    this.startDate = null;
    this.store.dispatch(new SetHeaderState({ title: 'Documents', iconName: 'folder' }));
    this.orgStructureDataSetup();
    this.createForm();
    this.action$.pipe(ofActionDispatched(IsAddNewFolder), takeUntil(this.unsubscribe$)).subscribe((payload) => {
      if (payload.payload != undefined) {
        this.isAddNewFolder = payload.payload;
        if (this.isAddNewFolder) {
          this.addRemoveFormcontrols();
          this.dialogWidth = '434px';
          this.formDailogTitle = FormDailogTitle.AddNewFolder;
          this.changeDetectorRef.markForCheck();
          this.store.dispatch(new ShowSideDialog(true));
        }
        else {
          this.isUpload = false;
          this.isAddNewFolder = false;
          this.isEditDocument = false;
          this.isShare = false;
          this.changeDetectorRef.markForCheck();
          this.store.dispatch(new ShowSideDialog(false));
        }
      }
    });

    this.action$.pipe(ofActionDispatched(GetDocumentsSelectedNode), takeUntil(this.unsubscribe$)).subscribe((payload) => {
      this.selectedNodeText = '';
      if (payload.payload) {
        this.selectedDocumentNode = payload.payload;
        this.gridApi?.setRowData([]);
        if (this.selectedDocumentNode?.text != undefined) {
          this.selectedNodeText = (this.selectedDocumentNode?.fileType != undefined && this.selectedDocumentNode?.fileType == 'folder') ? this.selectedDocumentNode?.text : '';
          setTimeout(() => {
            if (this.selectedDocumentNode?.id != -1)
              this.getDocuments();
            else if (this.selectedDocumentNode?.id == -1) {
              this.getSharedDocuments();
            }
          }, 1000);
        }
        else {
          this.selectedNodeText = '';
        }
      }
      this.changeDetectorRef.markForCheck();
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
      this.documentLibraryform.addControl(FormControlNames.FolderName, new FormControl(null, [Validators.required, Validators.maxLength(216), Validators.minLength(3)]));
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
    else if (this.isUpload || this.isEditDocument) {
      if (this.documentLibraryform.contains(FormControlNames.FolderName)) this.documentLibraryform.removeControl(FormControlNames.FolderName);
      this.documentLibraryform.addControl(FormControlNames.DocumentName, new FormControl(null, [Validators.required, Validators.maxLength(216), Validators.minLength(3)]));
      this.documentLibraryform.addControl(FormControlNames.OrgnizationIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.RegionIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.LocationIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.TypeIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.Tags, new FormControl('', []));
      this.documentLibraryform.addControl(FormControlNames.StatusIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.StartDate, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.EndDate, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.Comments, new FormControl('', []));
      this.applyDateValidations();
    }
    else if (this.isShare) {
      if (this.documentLibraryform.contains(FormControlNames.RegionIds)) this.documentLibraryform.removeControl(FormControlNames.RegionIds);
      if (this.documentLibraryform.contains(FormControlNames.LocationIds)) this.documentLibraryform.removeControl(FormControlNames.LocationIds);
      this.documentLibraryform.addControl(FormControlNames.RegionIds, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.LocationIds, new FormControl(null, []));

    }
    this.documentLibraryform.addControl(FormControlNames.Agencies, new FormControl(null, []));
    this.documentLibraryform.addControl(FormControlNames.Orgnizations, new FormControl(null, []));
    this.documentLibraryform.addControl(FormControlNames.MSP, new FormControl(null, []));
  }

  private applyDateValidations() {
    this.startDateField = this.documentLibraryform.get(FormControlNames.StartDate) as AbstractControl;
    this.endDateField = this.documentLibraryform.get(FormControlNames.EndDate) as AbstractControl;
    this.startDateField.valueChanges.subscribe(() => {
      if (this.endDateField?.value != null) {
        this.startDate = new Date(this.startDateField?.value?.toString());
        this.changeDetectorRef.markForCheck();
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
    const fileData: any = file;
    this.documentLibraryform.get(FormControlNames.DocumentName)?.setValue(fileData?.name.split('.').slice(0, -1).join('.'));
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
    },
    suppressRowClickSelection: true,
    onCellClicked: (e: CellClickedEvent) => {
      const column: any = e.column;
      if (column?.colId == documentsColumnField.FileName) {
        this.documentPreview(e.data);
      }
    }
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
  }
  private getDocumentFilter() {
    const documentFilter: DocumentsFilter = {
      documentId: this.selectedDocumentNode?.fileType == FileType.File ? (this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null) : null,
      businessUnitType: this.businessUnitType,
      businessUnitId: parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string),
      regionId: null,
      locationId: null,
      folderId: this.selectedDocumentNode?.fileType == FileType.Folder ? (this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null) : null,
      getAll: true
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

  private getShareDocumentInfoFilter() {
    const documentFilter: ShareDocumentInfoFilter = {
      documentId: this.selectedDocumentNode?.fileType == FileType.File ? (this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null) : null,
      businessUnitType: this.businessUnitType,
      businessUnitId: this.selectedDocumentNode?.businessUnitId != undefined ? this.selectedDocumentNode?.businessUnitId : null,
      regionId: null,
      locationId: null,
      folderId: this.selectedDocumentNode?.fileType == FileType.Folder ? (this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null) : null,
      getAll: true
    }
    return documentFilter;
  }

  public getSharedDocuments(): void {
    this.store.dispatch(new GetSharedDocuments(this.getShareDocumentInfoFilter()));
    this.shareDocumentInfoPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.gridApi?.setRowData([]);
      if (!data || !data?.items.length) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
        const documentData = [...new Set(data.items.map((item: ShareDocumentDto) => item.document))]
        this.rowData = documentData;
        this.gridApi?.setRowData(this.rowData);
      }
    });
  }

  public closeDialog() {
    this.orgStructureData.organizationIds.dataSource = [];
    this.orgStructureData.regionIds.dataSource = [];
    this.orgStructureData.locationIds.dataSource = [];
    this.orgStructureData.statusIds.dataSource = [];
    this.editOrganizationIds = [];
    this.editRegionIds = [];
    this.editLocationIds = [];
    this.documentLibraryform.reset();
    this.isAddNewFolder = false;
    this.isUpload = false;
    this.isEditDocument = false;
    this.selectedFile = null;
    this.isShare = false;
    if (this.isAddNewFolder) {
      this.store.dispatch(new IsAddNewFolder(false));
    }
    else {
      this.halmarkSwitch = false;
      this.agencySwitch = false;
      this.organizationSwitch = false;
      this.mspSwitch = false;
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
      if (this.documentLibraryform.get(FormControlNames.FolderName)?.value.trim() == '') {
        this.documentLibraryform.get(FormControlNames.FolderName)?.setValue(this.documentLibraryform.get(FormControlNames.FolderName)?.value.trim());
        this.documentLibraryform.markAllAsTouched();
        return;
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
        regionLocationMappings: this.setDictionaryRegionMappings(),
        documentName: this.documentLibraryform.get(FormControlNames.DocumentName)?.value,
        folderId: this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : 1,
        startDate: this.documentLibraryform.get(FormControlNames.StartDate)?.value,
        endDate: this.documentLibraryform.get(FormControlNames.EndDate)?.value,
        docTypeId: this.documentLibraryform.get(FormControlNames.TypeIds)?.value,
        tags: this.documentLibraryform.get(FormControlNames.Tags)?.value,
        comments: this.documentLibraryform.get(FormControlNames.Comments)?.value,
        selectedFile: this.selectedFile,
        isEdit: this.isEditDocument
      }
      if (this.documentLibraryform.get(FormControlNames.DocumentName)?.value.trim() == '') {
        this.documentLibraryform.get(FormControlNames.DocumentName)?.setValue(this.documentLibraryform.get(FormControlNames.DocumentName)?.value.trim());
        this.documentLibraryform.markAllAsTouched();
        return;
      }
      this.store.dispatch(new SaveDocuments(document)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
        this.documentLibraryform.reset();
        this.closeDialog();
        this.getDocuments();
      });
    }
    else if (this.isShare) {
      let unitType = BusinessUnitType.Hallmark;
      let unitId: number | null = null;
      if (this.mspSwitch) {
        unitType = BusinessUnitType.MSP;
        unitId = this.documentLibraryform.get(FormControlNames.MSP)?.value;
      }
      else if (this.agencySwitch) {
        unitType = BusinessUnitType.Agency;
        unitId = this.documentLibraryform.get(FormControlNames.Agencies)?.value;
      }
      else if (this.organizationSwitch) {
        unitType = BusinessUnitType.Organization;
        unitId = this.documentLibraryform.get(FormControlNames.Orgnizations)?.value;
      }
      let mapping: { [id: number]: number[]; } = {};
      const shareDocumentsFilter: ShareDocumentsFilter = {
        documentIds: this.shaeDocumentIds,
        businessUnitType: unitType,
        businessUnitId: unitId,
        regionLocationMappings: mapping
      }
      this.store.dispatch(new ShareDocuments(shareDocumentsFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
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
        dataSource: [{ id: 1, name: 'Active' }],
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
      this.documentLibraryform.get(FormControlNames.Orgnizations)?.setValue(null);
      this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
      this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
      this.documentLibraryform.get(FormControlNames.Agencies)?.setValue(null);
    }
    this.changeDetectorRef.markForCheck();
  }
  public onMspSwitcher(event: any) {
    this.mspSwitch = !this.mspSwitch;
    if (this.mspSwitch) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.MSP));
      this.halmarkSwitch = false;
      this.organizationSwitch = false;
      this.agencySwitch = false;
      this.documentLibraryform.get(FormControlNames.Orgnizations)?.setValue(null);
      this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
      this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
      this.documentLibraryform.get(FormControlNames.Agencies)?.setValue(null);
      this.documentLibraryform.get(FormControlNames.MSP)?.setValue(null);
    }
    this.changeDetectorRef.markForCheck();
  }
  public onAgencySwitcher(event: any) {
    this.agencySwitch = !this.agencySwitch;
    if (this.agencySwitch) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Agency));
      this.halmarkSwitch = false;
      this.organizationSwitch = false;
      this.documentLibraryform.get(FormControlNames.Orgnizations)?.setValue(null);
      this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
      this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
      this.documentLibraryform.get(FormControlNames.Agencies)?.setValue(null);
      this.documentLibraryform.get(FormControlNames.Agencies)?.setValue(parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string) || null);
    }
    this.changeDetectorRef.markForCheck();
  }
  public onOrganizationSwitcher(event: any) {
    this.organizationSwitch = !this.organizationSwitch;
    if (this.organizationSwitch) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
      this.documentLibraryform.get(FormControlNames.Orgnizations)?.setValue(parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string));
      this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
      this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
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
      else if (this.mspSwitch) {
        this.mspData = data;
      }
      else {
        this.orgStructureData.organizationIds.dataSource = data;
      }
      this.onOrganizationChangeHandler();
      if (!this.isShare) {
        this.documentLibraryform.get(FormControlNames.OrgnizationIds)?.setValue([parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string) || []]);
      }
      this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
      this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
      this.changeDetectorRef.markForCheck();
    });
  }

  public onOrganizationChangeHandler(): void {
    this.organizationControl = this.documentLibraryform.get(FormControlNames.OrgnizationIds) as AbstractControl;
    this.regionIdControl = this.documentLibraryform.get(FormControlNames.RegionIds) as AbstractControl;
    this.locationIdControl = this.documentLibraryform.get(FormControlNames.LocationIds) as AbstractControl;
    if (this.isShare) {
      this.shareOrganizationControl = this.documentLibraryform.get(FormControlNames.Orgnizations) as AbstractControl;
      this.shareAgencyControl = this.documentLibraryform.get(FormControlNames.Agencies) as AbstractControl;
      this.shareOrganizationControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val: number) => {
        this.regionIdControl?.setValue([]);
        this.orgStructureData.regionIds.dataSource = []
        if (this.shareOrganizationControl?.value > 0) {
          this.selectedOrganizations = this.orgStructureData.organizationIds.dataSource.filter((x: any) => val == x.id);
          let regionFilter: regionFilter = {
            ids: [val],
            getAll: true
          };
          this.store.dispatch(new GetRegionsByOrganizations(regionFilter));
          this.changeDetectorRef.markForCheck();
        }
      });

      this.shareAgencyControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val: number) => {
        this.regionIdControl?.setValue([]);
        this.orgStructureData.regionIds.dataSource = []
        if (this.shareAgencyControl?.value > 0) {
          this.selectedOrganizations = this.agencyData.filter((x: any) => val == x.id);
          let regionFilter: regionFilter = {
            ids: [val],
            getAll: true
          };
          this.store.dispatch(new GetRegionsByOrganizations(regionFilter));
          this.changeDetectorRef.markForCheck();
        }
      });
    }
    else {
      this.organizationControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val: number[]) => {
        if (!this.isEditDocument) {
          this.regionIdControl?.setValue([]);
          this.orgStructureData.regionIds.dataSource = []
        }
        if (this.organizationControl?.value?.length > 0) {
          this.selectedOrganizations = this.orgStructureData.organizationIds.dataSource.filter((x: any) => val?.includes(x.id));
          let regionFilter: regionFilter = {
            ids: val,
            getAll: true
          };
          this.store.dispatch(new GetRegionsByOrganizations(regionFilter)).subscribe(() => {
            if (this.isEditDocument) {
              this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue(this.editRegionIds);
            }
          });
          this.changeDetectorRef.markForCheck();
        }
      });
    }
    this.regionIdControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      if (!this.isEditDocument) {
        this.locationIdControl?.setValue([]);
        this.orgStructureData.locationIds.dataSource = [];
      }
      if (this.regionIdControl?.value?.length > 0) {
        this.selectedRegions = this.orgStructureData.regionIds.dataSource?.filter((object: any) => data?.includes(object.id));
        let locationFilter: LocationsByRegionsFilter = {
          ids: data,
          getAll: true
        };

        this.store.dispatch(new GetLocationsByRegions(locationFilter)).subscribe(() => {
          if (this.isEditDocument) {
            this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue(this.editLocationIds);
          }
        });
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  public downloadDocuemt(docItem: DocumentLibraryDto) {
    const downloadFilter: DownloadDocumentDetailFilter = {
      documentId: docItem.id,
      businessUnitType: this.businessUnitType,
      businessUnitId: docItem.businessUnitId
    }
    this.store.dispatch(new GetDocumentDownloadDeatils(downloadFilter));
    this.documentDownloadDetail$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: DownloadDocumentDetail) => {
        if (data) {
          if (this.downloadedFileName != data.fileName) {
            this.downloadedFileName = data.fileName;
            this.createLinkToDownload(data.fileAsBase64, data.fileName, data.contentType);
          }
        }
      });
    this.changeDetectorRef.markForCheck();
  }
  createLinkToDownload(base64String: string, fileName: string, contentType: string) {
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      const byteChar = atob(base64String);
      const byteArray = new Array(byteChar.length);
      for (let i = 0; i < byteChar.length; i++) {
        byteArray[i] = byteChar.charCodeAt(i);
      }
      const uIntArray = new Uint8Array(byteArray);
      const blob = new Blob([uIntArray], { type: contentType });
      (window.navigator as any).msSaveOrOpenBlob(blob, `${fileName}`);
    } else {
      const source = `data:${contentType};base64,${base64String}`;
      const link = document.createElement('a');
      link.href = source;
      link.download = `${fileName}`;
      link.click();
    }
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

  private editDocument(docItem: DocumentLibraryDto) {
    if (docItem) {
      this.isEditDocument = true;
      this.formDailogTitle = FormDailogTitle.EditDocument;
      this.documentId = docItem.id;
      this.isAddNewFolder = false;
      this.isShare = false;
      this.isUpload = true;
      this.dialogWidth = '800px';
      this.createForm();
      this.getOrganizations();
      this.orgStructureData.statusIds.dataSource = this.statusItems;
      let status = this.statusItems.find((x) => x.text == docItem.status);
      this.startDate = docItem.startDate != null ? new Date(docItem.startDate.toString()) : this.startDate;
      this.businessData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        this.orgStructureData.organizationIds.dataSource = data;
        this.onOrganizationChangeHandler();
        this.store.dispatch(new GetDocumentById(docItem.id));
        this.documentLibraryDto$.pipe(takeUntil(this.unsubscribe$))
          .subscribe((data: DocumentLibraryDto) => {
            if (data) {
              if (data.documentVisibilities?.length > 0) {
                const uniqueBusinessUinitIds: any[] = [...new Set(data.documentVisibilities.map((item: any) => item.businessUnitId))];
                const uniqueRegionIds: any[] = [...new Set(data.documentVisibilities.map((item: any) => item.regionId))];
                const uniqueLocationIds: any[] = [...new Set(data.documentVisibilities.map((item: any) => item.locationId))];
                this.editOrganizationIds = uniqueBusinessUinitIds;
                this.editRegionIds = uniqueRegionIds;
                this.editLocationIds = uniqueLocationIds;
              }
              this.documentLibraryform.get(FormControlNames.DocumentName)?.setValue(data.name);
              this.documentLibraryform.get(FormControlNames.TypeIds)?.setValue(data.docType);
              this.documentLibraryform.get(FormControlNames.Tags)?.setValue(data.tags);
              this.documentLibraryform.get(FormControlNames.StatusIds)?.setValue(status?.id);
              this.documentLibraryform.get(FormControlNames.StartDate)?.setValue(data.startDate != null ? new Date(data.startDate.toString()) : this.startDate);
              this.documentLibraryform.get(FormControlNames.EndDate)?.setValue(data.endDate != null ? new Date(data.endDate.toString()) : null);
              this.documentLibraryform.get(FormControlNames.Comments)?.setValue(data.comments);
              this.changeDetectorRef.markForCheck();
              this.store.dispatch(new ShowSideDialog(true));
            }
          });
      });
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
            documentIds: [data.id],
            businessUnitType: this.businessUnitType,
            businessUnitId: data.businessUnitId
          }
          this.store.dispatch(new DeletDocuments(deletedocumentFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
            this.getDocuments();
          });
        }
        this.removeActiveCssClass();
      });
  }
  public deleteSelectedDocuments(event: any) {
    let selectedRows: any;
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
            let selectedIds = selectedRows.map((item: any) => {
              return item.id;
            })
            const deletedocumentFilter: DeleteDocumentsFilter = {
              documentIds: selectedIds,
              businessUnitType: this.businessUnitType,
              businessUnitId: this.businessUnitId
            }
            this.store.dispatch(new DeletDocuments(deletedocumentFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
              this.closeDialog();
              this.getDocuments();
            });
          }
          this.removeActiveCssClass();
        });
    }
    else {
      this.store.dispatch([
        new ShowToast(MessageTypes.Warning, "Please select atleast one document."),
      ]);
    }
  }

  private ShareDocumewnt(data: DocumentLibraryDto) {
    if (data) {
      this.formDailogTitle = "";
      this.isAddNewFolder = false;
      this.isUpload = false;
      this.isEditDocument = false;
      this.isShare = true;
      this.dialogWidth = '600px'
      this.createForm();
      this.getOrganizations();
      this.shaeDocumentIds = [data.id];
      this.store.dispatch(new ShowSideDialog(true));
    }

  }

  public setDictionaryRegionMappings() {
    let mapping: { [id: number]: number[]; } = {};
    const selectedRegions = this.documentLibraryform.get(FormControlNames.RegionIds)?.value;
    if (selectedRegions.length > 0) {
      selectedRegions.forEach((regionItem: any) => {
        let mappingLocItems: number[] = [];
        const selectedLoactions = this.documentLibraryform.get(FormControlNames.LocationIds)?.value;
        let x = this.locations$.subscribe((data: any) => {
          if (selectedLoactions.length > 0) {
            selectedLoactions.forEach((selLocItem: any) => {
              let selectedLocation = data.filter((locItem: any) => { return locItem.id == selLocItem && locItem.regionId == regionItem });
              if (selectedLocation.length > 0)
                mappingLocItems.push(selectedLocation[0].id);
            });
            mapping[regionItem] = mappingLocItems;
          }
          else {
            mapping[regionItem] = [];
          }
        });
       
      });
    }
    return mapping;
  }

  public shareSelectedDocuments(event: any) {
    this.formDailogTitle = "";
    let selectedRows: any;
    selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0) {
      let selectedIds = selectedRows.map((item: any) => {
        return item.id;
      })
      this.isAddNewFolder = false;
      this.isUpload = false;
      this.isEditDocument = false;
      this.isShare = true;
      this.dialogWidth = '600px'
      this.createForm();
      this.getOrganizations();
      this.shaeDocumentIds = selectedIds;
      this.store.dispatch(new ShowSideDialog(true));
    }
    else {
      this.store.dispatch([
        new ShowToast(MessageTypes.Warning, "Please select atleast one document."),
      ]);
    }
  }

  public documentPreview(docItem: any) {
    this.downloadedFileName = '';
    const downloadFilter: DownloadDocumentDetailFilter = {
      documentId: docItem.id,
      businessUnitType: this.businessUnitType,
      businessUnitId: docItem.businessUnitId
    }
    this.store.dispatch(new GetDocumentDownloadDeatils(downloadFilter));
    this.documentDownloadDetail$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: DownloadDocumentDetail) => {
        if (data) {
          if (this.downloadedFileName != data.fileName) {
            this.downloadedFileName = data.fileName;
            if (data.fileAsBase64 && data.fileAsBase64!='') {
              this.getPreviewUrl(data);
              this.dialogWidth = "1000px";
              this.store.dispatch(new ShowDocPreviewSideDialog(true));
            }
            this.changeDetectorRef.markForCheck();
          }
        }
      });
  }
  getPreviewUrl(x: any) {
    let extension = (x != null) ? x.extension : null;
    switch (extension) {
      case '.pdf':
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:application/pdf;base64,${x.fileAsBase64}`
        );
        break;
      case '.jpg':
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/jpg;base64,${x.fileAsBase64}`
        );
        break;
      case '.png':
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/png;base64,${x.fileAsBase64}`
        );
        break;
      case '.docx':
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://view.officeapps.live.com/op/embed.aspx?src=${x.sasUrl}`
        );
        break;
      case '.xlsx':
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://view.officeapps.live.com/op/embed.aspx?src=${x.sasUrl}`
        );
        break;
      default:

    }
  }

  public onClosePreview(): void {
    this.previewUrl = null;
    this.downloadedFileName = '';
    this.changeDetectorRef.markForCheck();
    this.store.dispatch(new ShowDocPreviewSideDialog(false));
  }
}
