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
import { DeletDocuments, GetDocumentById, GetDocumentDownloadDeatils, GetDocuments, GetDocumentsSelectedNode, GetDocumentTypes, GetFoldersTree, GetSharedDocuments, IsAddNewFolder, SaveDocumentFolder, SaveDocuments, ShareDocuments, UnShareDocuments } from '../../../store/actions/document-library.actions';
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
    this.disableFilterBusinessControls(this.user);
    this.filterBusinessUnitControl.patchValue(this.user?.businessUnitType);
    this.filterBbusinessControl.patchValue(this.isBusinessFormDisabled ? this.user?.businessUnitId : 0);


    this.action$.pipe(ofActionDispatched(GetDocumentsSelectedNode), takeUntil(this.unsubscribe$)).subscribe((payload) => {
      this.selectedNodeText = '';
      if (payload.payload) {
        if (this.previousFolderId != payload.payload.id) {
          this.previousFolderId = payload.payload.id;
          this.selectedDocumentNode = payload.payload;
          this.gridApi?.setRowData([]);
          if (this.selectedDocumentNode?.text != undefined) {
            this.selectedNodeText = (this.selectedDocumentNode?.fileType != undefined && this.selectedDocumentNode?.fileType == 'folder') ? this.selectedDocumentNode?.text : '';
            setTimeout(() => {
              if (this.selectedDocumentNode?.id != -1)
                this.getDocuments(this.filterSelectedBusinesUnitId);
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
      }

    });
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    this.previousFolderId = -2;
    this.isAlive = false;
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
      }
    });
    this.filterBbusinessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (value) {
        this.filterSelectedBusinesUnitId = value;
        this.getDocumentTypes(value);
        this.getFolderTree(value);
      }
    });
  }
  private disableFilterBusinessControls(user: User) {
    if (user?.businessUnitType) {
      this.isBusinessFormDisabled = DISABLED_GROUP.includes(user?.businessUnitType);
      this.isBusinessFormDisabled && this.businessFilterForm.disable();
    }
    if (user?.businessUnitType === BusinessUnitType.MSP) {
      const [Hallmark, ...rest] = this.businessUnits;
      this.businessUnits = rest;
    }
  }
  private getDocumentTypes(selectedBusinessUnitId:number | null) {
    let documentTypesFilter: DocumentTypeFilter = {
      businessUnitType: this.filterSelecetdBusinesType,
      businessUnitId: selectedBusinessUnitId
    }
    this.store.dispatch(new GetDocumentTypes(documentTypesFilter));
  }
  private getFolderTree(selectedBusinessUnitId: number | null) {
    this.store.dispatch(new GetFoldersTree({ businessUnitType: this.filterSelecetdBusinesType, businessUnitId: selectedBusinessUnitId }));

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
       // this.documentPreview(e.data);
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

  private getShareDocumentInfoFilter() {
    const documentFilter: ShareDocumentInfoFilter = {
      documentId: this.selectedDocumentNode?.fileType == FileType.File ? (this.selectedDocumentNode?.id != undefined ? this.selectedDocumentNode?.id : null) : null,
      businessUnitType: this.filterSelecetdBusinesType,
      businessUnitId: this.selectedDocumentNode?.businessUnitId != undefined ? this.selectedDocumentNode?.businessUnitId : null,
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

  public getSharedDocuments(): void {
    this.store.dispatch(new GetSharedDocuments(this.getShareDocumentInfoFilter()));
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
  }

  public deleteSelectedDocuments(event: any) {
    
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
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/jpg;base64,${file.fileAsBase64}`
        );
        break;
      case '.png':
        this.isPdf = false;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/png;base64,${file.fileAsBase64}`
        );
        break;
      case '.docx':
        this.isPdf = false;
        this.loadDocument(file.fileAsBase64);
        //this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        //  `https://view.officeapps.live.com/op/embed.aspx?src=${x.sasUrl}`
        //);
        break;
      case '.xlsx':
        this.isPdf = false;
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

  public downloadDocuemt(docItem: DocumentLibraryDto) {
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
        this.ShareDocumewnt(data);
        break;
      case MoreMenuType['UnShare']:
        this.UnShareDocumewnt(data);
        break;
    }
  }

  private editDocument(docItem: DocumentLibraryDto) {
  }

  private deleteDocument(data: DocumentLibraryDto): void {
  }

  private ShareDocumewnt(data: DocumentLibraryDto) {
  }

  private UnShareDocumewnt(data: DocumentLibraryDto) {
  }
}
