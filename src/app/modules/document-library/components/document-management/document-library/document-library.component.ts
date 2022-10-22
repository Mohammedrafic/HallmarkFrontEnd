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
  public isHalmarkSelected: boolean = false;;

  @Select(SecurityState.businessUserData)
  public businessUserData$: Observable<(type: number) => BusinessUnit[]>;

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
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

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
      if (value != BusinessUnitType.Hallmark) {
        this.isHalmarkSelected = false;
      }
      else {
        this.isHalmarkSelected = true;
      }
      if (!this.isBusinessFormDisabled) {
        this.filterBbusinessControl.patchValue(0);
      }
    });
    this.filterBbusinessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (value) {
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
      businessUnitType: this.user?.businessUnitType != undefined ? this.user?.businessUnitType : 0,
      businessUnitId: selectedBusinessUnitId
    }
    this.store.dispatch(new GetDocumentTypes(documentTypesFilter));
  }
  private getFolderTree(selectedBusinessUnitId: number | null) {
    this.store.dispatch(new GetFoldersTree({ businessUnitType: this.user?.businessUnitType != undefined ? this.user?.businessUnitType:0, businessUnitId: selectedBusinessUnitId }));

  }
}
