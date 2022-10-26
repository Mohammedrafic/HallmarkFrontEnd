import { CellClickedEvent, FilterChangedEvent, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { map, Observable, Subject, take, takeUntil, takeWhile } from 'rxjs';
import { SpecialProjectMessages } from '../../../../../organization-management/specialproject/constants/specialprojects.constant';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { SetHeaderState, ShowDocPreviewSideDialog, ShowSideDialog, ShowToast } from '../../../../../store/app.actions';
import { BUSINESS_UNITS_VALUES, BUSSINES_DATA_FIELDS, DISABLED_GROUP, DocumentLibraryColumnsDefinition, UNIT_FIELDS } from '../../../constants/documents.constant';
import { DeleteDocumentsFilter, DocumentFolder, DocumentLibraryDto, Documents, DocumentsFilter, DocumentsLibraryPage, DocumentTags, DocumentTypeFilter, DocumentTypes, DownloadDocumentDetail, DownloadDocumentDetailFilter, NodeItem, ShareDocumentDto, ShareDocumentInfoFilter, ShareDocumentInfoPage, ShareDocumentsFilter, UnShareDocumentsFilter } from '../../../store/model/document-library.model';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { DocumentLibraryState } from '../../../store/state/document-library.state';
import {
  DeletDocuments, GetDocumentById, GetDocumentDownloadDeatils, GetDocuments,
  GetDocumentsSelectedNode, GetDocumentTypes, GetFoldersTree, GetSharedDocuments,
  IsAddNewFolder, SaveDocumentFolder, SaveDocuments, ShareDocuments, UnShareDocuments,
  GetLocationsByRegions, GetRegionsByOrganizations
} from '../../../store/actions/document-library.actions';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { documentsColumnField, FileType, FormControlNames, FormDailogTitle, MoreMenuType, StatusEnum } from '../../../enums/documents.enum';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Document } from '@shared/models/document.model';
import { UserState } from '../../../../../store/user.state';
import { SecurityState } from '../../../../../security/store/security.state';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { Location } from '@shared/models/location.model';
import { Region } from '@shared/models/region.model';
import { datesValidator } from '@shared/validators/date.validator';
import { GetBusinessByUnitType } from '../../../../../security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, ORG_ID_STORAGE_KEY } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { MessageTypes } from '@shared/enums/message-types';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  MagnificationService,
  NavigationService,
  PdfViewerComponent,
  TextSelectionService,
  ToolbarService
} from '@syncfusion/ej2-angular-pdfviewer';
import {
  DocumentEditorComponent,
  EditorHistoryService,
  EditorService,
  SearchService
} from '@syncfusion/ej2-angular-documenteditor';
import { User } from '../../../../../shared/models/user-managment-page.model';
import { regionFilter } from '../../../store/model/document-library.model';
import { LocationsByRegionsFilter } from '../../../store/model/document-library.model';


@Component({
  selector: 'app-document-library',
  templateUrl: './document-library.component.html',
  styleUrls: ['./document-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ToolbarService, NavigationService, TextSelectionService, MagnificationService, EditorHistoryService, EditorService, SearchService ]
})
export class DocumentLibraryComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy, AfterViewInit {

  public businessFilterForm: FormGroup;
  public user: User;
  get filterBusinessUnitControl(): AbstractControl {
    return this.businessFilterForm.get('filterBusinessUnit') as AbstractControl;
  }
  get filterBbusinessControl(): AbstractControl {
    return this.businessFilterForm.get('filterBusiness') as AbstractControl;
  }
  public unitFields = UNIT_FIELDS;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  private isAlive = true;
  public isBusinessFormDisabled = false;
  public title: string = "Documents";
  public isHalmarkSelected: boolean = false;
  private unsubscribe$: Subject<void> = new Subject();
  public selectedNodeText: string = '';
  public previousFolderId: number = 0;
  selectedDocumentNode: NodeItem | null;
  filterSelecetdBusinesType: number;
  filterSelectedBusinesUnitId: number | null;
  public isIncludeSharedWithMe: boolean = false;
  public dialogWidth: string = '434px';
  public previewTitle: string = "Document Preview";
  public isPdf: boolean = true;
  public previewUrl: SafeResourceUrl | null;
  public downloadedFileName: string = '';
  public service: string =
    'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';
  public document: string = 'PDF_Succinctly.pdf';
  public documentLibraryform: FormGroup;
  public isAddNewFolder: boolean = false;
  public isUpload: boolean = false;
  public formDailogTitle: string = '';
  public today = new Date();
  public startDate: any = new Date();
  public selectedFile: Blob | null;
  public isEditDocument: boolean = false;
  public documentId: number = 0;
  public isShare: boolean = false;
  public shaeDocumentIds: number[] = [];
  public startDateField: AbstractControl;
  public endDateField: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public isWordDoc:boolean=false;
  public isAgency:boolean=false;


  public gridApi!: GridApi;
  public rowData: DocumentLibraryDto[] = [];
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public editMenuItems: ItemModel[] = [
    { text: MoreMenuType[0], id: '0' },
    { text: MoreMenuType[1], id: '1' },
    { text: MoreMenuType[2], id: '2' }
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
     this.downloadDocument(params);
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

  @ViewChild('pdfViewer', { static: true })
  public pdfViewer: PdfViewerComponent;

  @ViewChild('documentPreview')
  public documentEditor: DocumentEditorComponent;

  @Select(SecurityState.businessUserData)
  public businessUserData$: Observable<(type: number) => BusinessUnit[]>;
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
  @Select(DocumentLibraryState.regions)
  public regions$: Observable<Region[]>;
  selectedRegions: Region[];
  @Select(DocumentLibraryState.locations)
  public locations$: Observable<Location[]>;
  selectedLocations: Location[];
  @Select(DocumentLibraryState.savedDocumentLibraryDto)
  savedDocumentLibraryDto$: Observable<DocumentLibraryDto>;


  constructor(private store: Store, private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private sanitizer: DomSanitizer,
    private action$: Actions) {
    super();
    
  }

  ngOnInit(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Documents', iconName: 'folder' }));
    this.businessFilterForm = this.generateFilterBusinessForm();
    this.onFilterBusinessUnitValueChanged();
    this.user = this.store.selectSnapshot(UserState.user) as User;
    if (this.user?.businessUnitType == BusinessUnitType.Hallmark) {
      this.isHalmarkSelected = true;
    }
    this.filterBusinessUnitControl.patchValue(this.user?.businessUnitType);

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
          this.documentLibraryform.reset();
          this.isAddNewFolder = false;
          this.isUpload = false;
          this.isEditDocument = false;
          this.selectedFile = null;
          this.isShare = false;
          this.previousFolderId = -2;
          this.changeDetectorRef.markForCheck();
          this.store.dispatch(new ShowSideDialog(false));
        }
      }
    });


    this.action$.pipe(ofActionDispatched(GetDocumentsSelectedNode), takeUntil(this.unsubscribe$)).subscribe((payload) => {
      this.selectedNodeText = '';
      if (payload.payload) {
        if (this.previousFolderId != payload.payload.id) {
          this.selectedNodeText = '';
          this.previousFolderId = payload.payload.id;
          this.selectedDocumentNode = payload.payload;
          this.gridApi?.setRowData([]);
          if (this.selectedDocumentNode?.text != undefined) {
            this.selectedNodeText = (this.selectedDocumentNode?.fileType != undefined && this.selectedDocumentNode?.fileType == 'folder') ? this.selectedDocumentNode?.text : '';
            setTimeout(() => {
              if (this.selectedDocumentNode?.id != -1 && this.selectedDocumentNode?.parentID!=-1)
                this.getDocuments(this.filterSelectedBusinesUnitId);
              else if (this.selectedDocumentNode?.id == -1 || this.selectedDocumentNode.parentID==-1) {
                this.getSharedDocuments(this.filterSelectedBusinesUnitId);
              }
            }, 1000);
          }
          else {
            if(payload.payload.id=0)
            this.selectedNodeText = 'Documents';
          }
        }
        this.changeDetectorRef.markForCheck();
      }

    });

    if (this.user?.businessUnitType === BusinessUnitType.MSP) {
      const [Hallmark, ...rest] = this.businessUnits;
      this.businessUnits = rest;
    }
    if (this.user?.businessUnitType === BusinessUnitType.Organization || this.user?.businessUnitType === BusinessUnitType.Agency) {
      this.businessFilterForm.disable();
      this.filterBbusinessControl.patchValue(this.user?.businessUnitId);
    }
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    this.previousFolderId = -2;
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  public columnDefinitions: ColumnDefinitionModel[] = DocumentLibraryColumnsDefinition(this.actionCellrenderParams, this.datePipe);

  get bussinesUserData$(): Observable<BusinessUnit[]> {
    return this.businessUserData$.pipe(map((fn) => fn(this.filterBbusinessControl?.value)));
  }

  private generateFilterBusinessForm(): FormGroup {
    return new FormGroup({
      filterBusinessUnit: new FormControl(),
      filterBusiness: new FormControl(0),
    });
  }
  private onFilterBusinessUnitValueChanged(): void {
    //ToDo: To Check for Org User and Hallmark User while toggle
    this.filterBusinessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      value && this.store.dispatch(new GetBusinessByUnitType(value));
      if (value) {
        this.filterSelecetdBusinesType = value;
        if (value != BusinessUnitType.Hallmark) {
          this.isHalmarkSelected = false;
        }
        else {
          this.isHalmarkSelected = true;
        }
        if (!this.isBusinessFormDisabled) {
          this.filterBbusinessControl.patchValue(0);
        }
        if(this.filterSelecetdBusinesType == BusinessUnitType.Agency)
            this.isAgency =true;
        else
            this.isAgency =false;
      }
    });
    this.filterBbusinessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (value) {
        this.filterSelectedBusinesUnitId = value;
        this.onLoadRegionsLocationsOnUnitChange(value);
        this.getDocumentTypes(value);
        this.getFolderTree(value);
      }
    });
  }

  public onLoadRegionsLocationsOnUnitChange(selectedBusinessUnitId: number) {
    this.isUpload = true;
    this.createForm();
    this.regionIdControl = this.documentLibraryform.get(FormControlNames.RegionIds) as AbstractControl;
    if (selectedBusinessUnitId == BusinessUnitType.Organization || selectedBusinessUnitId == BusinessUnitType.Agency) {
      let regionFilter: regionFilter = {
        businessUnitId:selectedBusinessUnitId,
        getAll: true,
        ids: [selectedBusinessUnitId]
      };
      this.store.dispatch(new GetRegionsByOrganizations(regionFilter));
      this.changeDetectorRef.markForCheck();

      this.regionIdControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
        if (this.regionIdControl?.value?.length > 0) {
          let locationFilter: LocationsByRegionsFilter = {
            ids: data,
            getAll: true,
            businessUnitId: selectedBusinessUnitId
          };
          this.store.dispatch(new GetLocationsByRegions(locationFilter));
          this.changeDetectorRef.markForCheck();
        }
      });

    }
    else {
      this.clearRegionsLocations();
    }
  }

  public clearRegionsLocations() {
    this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue([]);
    this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue([]);
  }

  
  private getDocumentTypes(selectedBusinessUnitId: number | null) {
    let documentTypesFilter: DocumentTypeFilter = {
      businessUnitType: this.filterSelecetdBusinesType,
      businessUnitId: selectedBusinessUnitId
    }
    this.store.dispatch(new GetDocumentTypes(documentTypesFilter));
  }
  private getFolderTree(selectedBusinessUnitId: number | null) {
    this.store.dispatch(new GetFoldersTree({ businessUnitType: this.filterSelecetdBusinesType, businessUnitId: selectedBusinessUnitId }));
  }

  public createForm(): void {
    this.documentLibraryform = new FormGroup({})
    this.addRemoveFormcontrols();
  }

  public addRemoveFormcontrols() {
    if (this.isAddNewFolder) {
      this.documentLibraryform.addControl(FormControlNames.FolderName, new FormControl(null, [Validators.required, Validators.maxLength(216), Validators.minLength(3)]));
      if (this.documentLibraryform.contains(FormControlNames.DocumentName)) this.documentLibraryform.removeControl(FormControlNames.DocumentName);
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
      this.documentLibraryform.addControl(FormControlNames.RegionIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.LocationIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.TypeIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.Tags, new FormControl('', []));
      this.documentLibraryform.addControl(FormControlNames.StatusIds, new FormControl(null, [Validators.required]));
      this.documentLibraryform.addControl(FormControlNames.StartDate, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.EndDate, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.Comments, new FormControl('', []));
    }
    else if (this.isShare) {
      if (this.documentLibraryform.contains(FormControlNames.RegionIds)) this.documentLibraryform.removeControl(FormControlNames.RegionIds);
      if (this.documentLibraryform.contains(FormControlNames.LocationIds)) this.documentLibraryform.removeControl(FormControlNames.LocationIds);
      this.documentLibraryform.addControl(FormControlNames.RegionIds, new FormControl(null, []));
      this.documentLibraryform.addControl(FormControlNames.LocationIds, new FormControl(null, []));

    }
    if(this.isAgency)
    {
        if (this.documentLibraryform.contains(FormControlNames.RegionIds)) this.documentLibraryform.removeControl(FormControlNames.RegionIds);
        if (this.documentLibraryform.contains(FormControlNames.LocationIds)) this.documentLibraryform.removeControl(FormControlNames.LocationIds);
    }
    this.documentLibraryform.addControl(FormControlNames.Agencies, new FormControl(null, []));
    this.documentLibraryform.addControl(FormControlNames.Orgnizations, new FormControl(null, []));
  }

  private applyDateValidations() {
    this.startDateField = this.documentLibraryform.get(FormControlNames.StartDate) as AbstractControl;
    this.endDateField = this.documentLibraryform.get(FormControlNames.EndDate) as AbstractControl;
    this.startDateField.valueChanges.subscribe(() => {
      if (this.endDateField?.value != null) {
        this.startDate = new Date(this.startDateField?.value?.toString());
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
    this.changeDetectorRef.markForCheck();
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
    rowSelection: this.rowSelection,
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

  private getDocumentFilter(selectedBusinessUnitId: number | null) {
    const documentFilter: DocumentsFilter = {
      documentId: this.selectedDocumentNode?.fileType == FileType.File ? (this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null) : null,
      businessUnitType: this.filterSelecetdBusinesType, 
      businessUnitId: selectedBusinessUnitId,
      regionId: null,
      locationId: null,
      folderId: this.selectedDocumentNode?.fileType == FileType.Folder ? (this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null) : null,
      includeSharedWithMe: this.isIncludeSharedWithMe,
      showAllPages: true
    }
    return documentFilter;
  }

  private getShareDocumentInfoFilter(selectedBusinessUnitId: number | null) {
    const documentFilter: ShareDocumentInfoFilter = {
      documentId: this.selectedDocumentNode?.fileType == FileType.File ? (this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null) : null,
      businessUnitType: this.filterSelecetdBusinesType,
      businessUnitId: this.selectedDocumentNode?.businessUnitId != undefined ? this.selectedDocumentNode?.businessUnitId : selectedBusinessUnitId,
      regionId: null,
      locationId: null,
      folderId: this.selectedDocumentNode?.fileType == FileType.Folder ? (this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null) : null,
      getAll: true
    }
    return documentFilter;
  }


  public onIncludeSharedWithMe(event: any) {
    this.isIncludeSharedWithMe = !this.isIncludeSharedWithMe;
    this.changeDetectorRef.markForCheck();
    this.getDocuments(this.filterSelectedBusinesUnitId);
  }

  public getSharedDocuments(selectedBusinessUnitId: number | null): void {
    this.store.dispatch(new GetSharedDocuments(this.getShareDocumentInfoFilter(selectedBusinessUnitId)));
    this.shareDocumentInfoPage$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
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



  public getDocuments(selectedBusinessUnitId: number | null) {
    this.store.dispatch(new GetDocuments(this.getDocumentFilter(selectedBusinessUnitId)));
    this.documentsPage$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
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
      businessUnitType: this.filterSelecetdBusinesType,
      businessUnitId: this.filterSelectedBusinesUnitId
    }
    this.store.dispatch(new GetDocumentDownloadDeatils(downloadFilter));
    this.documentDownloadDetail$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: DownloadDocumentDetail) => {
        if (data) {
          if (this.downloadedFileName != data.fileName) {
            this.downloadedFileName = data.fileName;
            if (data.fileAsBase64 && data.fileAsBase64 != '') {
              this.getPreviewUrl(data);
              this.dialogWidth = "1000px";
              this.store.dispatch(new ShowDocPreviewSideDialog(true));
            }
            this.changeDetectorRef.markForCheck();
          }
        }
      });
  }


  load(url: string) {
    this.pdfViewer?.load(url, '');
  }

  getPreviewUrl(file: any) {

    let extension = (file != null) ? file.extension : null;
    switch (extension) {
      case '.pdf':
        this.isPdf = true;
        this.load(`data:application/pdf;base64,${file.fileAsBase64}`);
        break;
      case '.jpg':
        this.isPdf = false;
        this.isWordDoc=false;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/jpg;base64,${file.fileAsBase64}`
        );
        break;
      case '.png':
        this.isPdf = false;
        this.isWordDoc=false;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/png;base64,${file.fileAsBase64}`
        );
        break;
      case '.docx':
        this.isPdf = false;
        this.isWordDoc=true;
        this.loadDocument(file.fileAsBase64);
        break;
      case '.xlsx':
        this.isPdf = false;
        this.isWordDoc=false;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://view.officeapps.live.com/op/embed.aspx?src=${file.sasUrl}`
        );
        break;
      default:

    }
    this.changeDetectorRef.markForCheck();
  }
  loadDocument(fileAsBase64: string) {
    this.documentEditor.height = window.innerHeight * 0.7 + 'px';
    this.documentEditor.isReadOnly = true;
    this.documentEditor.pageOutline = '#d3d3d3';
    this.documentEditor.open(decodeURIComponent(escape(atob(fileAsBase64))));

  }

  public onClosePreview(): void {
    this.previewUrl = null;
    this.downloadedFileName = '';
    this.changeDetectorRef.markForCheck();
    this.store.dispatch(new ShowDocPreviewSideDialog(false));

  }

  public downloadDocument(docItem: DocumentLibraryDto) {
    const downloadFilter: DownloadDocumentDetailFilter = {
      documentId: docItem.id,
      businessUnitType: this.filterSelecetdBusinesType,
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
        this.ShareDocument(data);
        break;
      case MoreMenuType['UnShare']:
        this.UnShareDocumewnt(data);
        break;
    }
  }

  public handleOnUploadBtnClick() {
    this.isAddNewFolder = false;
    this.isUpload = true;
    this.documentId = 0;
    this.isEditDocument = false;
    this.dialogWidth = '800px';
    this.addRemoveFormcontrols();
    this.formDailogTitle = FormDailogTitle.Upload;
    if (
      this.selectedNodeText='Documents'||
      this.selectedDocumentNode != null 
      && this.selectedDocumentNode?.id != undefined 
      && this.selectedDocumentNode?.id != -1
      && this.selectedDocumentNode?.parentID != -1)
      this.store.dispatch(new ShowSideDialog(true));
    else
      this.store.dispatch([new ShowToast(MessageTypes.Warning, "Please select BusinessUnit and select folder.")]);
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
      this.documentLibraryform.reset();
      this.onLoadRegionsLocationsOnUnitChange(docItem.businessUnitId != null ? docItem.businessUnitId:0);
      let status = this.statusItems.find((x) => x.text == docItem.status);
      this.startDate = docItem.startDate != null ? new Date(docItem.startDate.toString()) : this.startDate;
      this.store.dispatch(new GetDocumentById(docItem.id));
      this.documentLibraryDto$.pipe(takeUntil(this.unsubscribe$))
        .subscribe((data: DocumentLibraryDto) => {
          if (data) {
            const editRegionIds = data?.regionId?.split(',').map(Number) != undefined ? data?.regionId?.split(',').map(Number) : [];
            this.setRegionsOnEdit(editRegionIds);
            const editLocationIds = data?.locationId?.split(',').map(Number) != undefined ? data?.locationId?.split(',').map(Number) : [];
            this.setLocationsOnEdit(editLocationIds);
            this.changeDetectorRef.markForCheck();
            this.documentLibraryform.get(FormControlNames.DocumentName)?.setValue(data.name);
            this.documentLibraryform.get(FormControlNames.TypeIds)?.setValue(data.docType);
            this.documentLibraryform.get(FormControlNames.Tags)?.setValue(data.tags);
            this.documentLibraryform.get(FormControlNames.StatusIds)?.setValue(status?.id);
            this.documentLibraryform.get(FormControlNames.StartDate)?.setValue(data.startDate != null ? new Date(data.startDate.toString()) : this.startDate);
            this.documentLibraryform.get(FormControlNames.EndDate)?.setValue(data.endDate != null ? new Date(data.endDate.toString()) : null);
            this.documentLibraryform.get(FormControlNames.Comments)?.setValue(data.comments);
            this.store.dispatch(new ShowSideDialog(true));
          }
        });
    }
  }

  public setRegionsOnEdit(editRegionIds: any) {

    if (editRegionIds.length > 0 && editRegionIds[0] == -1) {
      this.regions$.subscribe((data) => {
        const allRegionsIds = data.map(region => region.id);
        this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue(allRegionsIds);
      });
    } else {
      this.documentLibraryform.get(FormControlNames.RegionIds)?.setValue(editRegionIds);
    }
  }

  public setLocationsOnEdit(editLocationIds:any) {
    if (editLocationIds.length > 0 && editLocationIds[0] == -1) {
      this.locations$.subscribe((data) => {
        const allLocIds = data.map(loc => loc.id);
        this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue(allLocIds);
      });
    } else {
      this.documentLibraryform.get(FormControlNames.LocationIds)?.setValue(editLocationIds);
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
            businessUnitType: this.filterSelecetdBusinesType,
            businessUnitId: this.filterSelectedBusinesUnitId
          }
          this.store.dispatch(new DeletDocuments(deletedocumentFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
            this.store.dispatch(new GetFoldersTree({ businessUnitType: this.filterSelecetdBusinesType, businessUnitId: this.filterSelecetdBusinesType }));
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
              businessUnitType: this.filterSelecetdBusinesType,
              businessUnitId: this.filterSelectedBusinesUnitId
            }
            this.store.dispatch(new DeletDocuments(deletedocumentFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
              this.closeDialog();
              this.store.dispatch(new GetFoldersTree({ businessUnitType: this.filterSelecetdBusinesType, businessUnitId: this.filterSelectedBusinesUnitId }));
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

  public handleOnSave() {
    this.documentLibraryform.markAllAsTouched();
    if (this.documentLibraryform.invalid) {
      return;
    }
    this.SaveFolderOrDocument();
  }

  public setDictionaryRegionMappings() {
    let mapping: { [id: number]: number[]; } = {};
    let isAllRegions: boolean = false;
    let isAllLocations: boolean = false;
    let regionsData: Region[] = [];
    let locationsData: Region[] = [];
    this.regions$.subscribe((data) => {
      regionsData = data;
      this.locations$.subscribe((locData: any) => {
        locationsData = locData;
      });
    });
    if(this.isAgency)
    {
      return mapping;
    }
      isAllRegions = this.documentLibraryform.controls[FormControlNames.RegionIds].value.length === regionsData.length;
      isAllLocations = this.documentLibraryform.controls[FormControlNames.LocationIds].value.length === locationsData.length;
  
    if (isAllRegions && !isAllLocations) {
      mapping[-1] = this.documentLibraryform.controls[FormControlNames.LocationIds].value;
    }
    else if (!isAllRegions && isAllLocations) {
      const selectedRegions = this.documentLibraryform.get(FormControlNames.RegionIds)?.value;
      selectedRegions.forEach((regionItem: any) => {
        mapping[regionItem] = [-1];
      });
    }
    else {
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
    }
    return mapping;
  }


  public SaveFolderOrDocument() {
    if (this.isAddNewFolder) {
      const documentFolder: DocumentFolder = {
        id: 0,
        name: this.documentLibraryform.get(FormControlNames.FolderName)?.value,
        parentFolderId: this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null,
        businessUnitType: this.filterSelecetdBusinesType,
        businessUnitId: this.filterSelectedBusinesUnitId,
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
        this.store.dispatch(new GetFoldersTree({ businessUnitType: this.filterSelecetdBusinesType, businessUnitId: this.filterSelectedBusinesUnitId }));
      });
    }
    else if (this.isUpload || this.isEditDocument) {
      const document: Documents = {
        id: this.documentId,
        businessUnitType: this.filterSelecetdBusinesType,
        businessUnitId: this.filterSelectedBusinesUnitId,
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
      this.store.dispatch(new SaveDocuments(document));
      this.savedDocumentLibraryDto$.pipe(takeUntil(this.unsubscribe$)).subscribe((retrunDocument) => {
        if (retrunDocument) {
          this.shaeDocumentIds = [retrunDocument.id];
          this.documentLibraryform.reset();
          this.closeDialog();
          this.store.dispatch(new GetFoldersTree({ businessUnitType: this.filterSelecetdBusinesType, businessUnitId: this.filterSelectedBusinesUnitId }));
        }
      });
    }
    else if (this.isShare) {
    }
  }

  public closeDialog() {
    this.documentLibraryform.reset();
    this.isAddNewFolder = false;
    this.isUpload = false;
    this.isEditDocument = false;
    this.selectedFile = null;
    this.isShare = false;
    this.previousFolderId = -2;
    if (this.isAddNewFolder) {
      this.store.dispatch(new IsAddNewFolder(false));
    }
    else {
      this.store.dispatch(new ShowSideDialog(false));
    }
  }


  private ShareDocument(data: DocumentLibraryDto) {
    if (data) {
      this.formDailogTitle = "";
      this.isAddNewFolder = false;
      this.isUpload = false;
      this.isEditDocument = false;
      this.isShare = true;
      this.dialogWidth = '600px'
      this.createForm();
      this.shaeDocumentIds = [data.id];
      this.store.dispatch(new ShowSideDialog(true));
    }
  }

  private UnShareDocumewnt(data: DocumentLibraryDto) {
    if (data) {
      let unShareDocumentsFilter: UnShareDocumentsFilter = { documentIds: [data.id] };
      this.store.dispatch(new UnShareDocuments(unShareDocumentsFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.getDocuments(this.filterSelectedBusinesUnitId);
      });
    }
  }
}
