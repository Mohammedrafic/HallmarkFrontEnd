import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatestWith, filter, Observable, Subject, takeUntil, tap, throttleTime } from 'rxjs';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import {
  GetCredential,
  GetCredentialTypes,
  RemoveCredential,
  SaveCredential,
  SaveCredentialSucceeded,
} from '../../store/organization-management.actions';
import { Credential, CredentialFilter, CredentialFilterDataSources, CredentialPage } from '@shared/models/credential.model';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { SortSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { UserState } from 'src/app/store/user.state';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportCredentialList, GetCredentialsDataSources, SetCredentialsFilterCount, ShowExportCredentialListDialog } from '@organization-management/store/credentials.actions';
import { DatePipe } from '@angular/common';
import { FilterService } from '@shared/services/filter.service';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';
import { CredentialsState } from '@organization-management/store/credentials.state';

@Component({
  selector: 'app-credentials-list',
  templateUrl: './credentials-list.component.html',
  styleUrls: ['./credentials-list.component.scss']
})
export class CredentialsListComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  public gridSortSettings: SortSettingsModel = { columns: [{ field: 'credentialTypeName', direction: 'Ascending' }] };

  @Select(OrganizationManagementState.credentialTypes)
  credentialTypes$: Observable<CredentialType[]> ;
  public credentialTypesFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrganizationManagementState.credentials)
  credentials$: Observable<CredentialPage>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;
  
  @Select(CredentialsState.credentialDataSources)
  credentialDataSources$: Observable<CredentialFilterDataSources>;

  private pageSubject = new Subject<number>();

  public credentialsFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  public editedCredentialId?: number;
  public isEdit: boolean;

  private unsubscribe$: Subject<void> = new Subject();

  public columnsToExport: ExportColumn[] = [
    { text:'Credential Type', column: 'CredentialType'},
    { text:'Credential', column: 'Credential'},
    { text:'Expire Date Applicable', column: 'ExpireDateApplicable'},
    { text:'Comment', column: 'Comment'}
  ];
  public fileName: string;
  public defaultFileName: string;

  public CredentialsFilterFormGroup: FormGroup;
  public filters: CredentialFilter = {
    pageSize: this.pageSize,
    pageNumber: this.currentPage
  };
  public filterColumns: any;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  public optionFields = {
    text: 'name', value: 'id'
  };

  constructor(private store: Store,
              private actions$: Actions,
              private confirmService: ConfirmService,
              private datePipe: DatePipe,
              private filterService: FilterService,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    this.formBuilder = builder;
    this.createCredentialsForm();
  }

  ngOnInit(): void {
    this.filterColumns = {
      searchTerm: { type: ControlTypes.Text, valueType: ValueType.Text },
      credentialIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
      credentialTypeIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
      expireDateApplicable: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkboxTitle: 'Expiry Date Applicable'},
    }
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
      this.getCredentials();
    });
    this.credentialDataSources$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe(data => {
      this.filterColumns.credentialIds.dataSource = data.credentials;
      this.filterColumns.credentialTypeIds.dataSource = data.credentialTypes;
    });

    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.getCredentials();
    });

    this.mapGridData();

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveCredentialSucceeded)).subscribe(() => {
      this.clearFormDetails();
      this.store.dispatch(new GetCredential());
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowExportDialog)).subscribe((val) => {
      if (val.isDialogShown) {
        this.defaultFileName = 'Credentials/Credentials List ' + this.generateDateTime(this.datePipe);
        this.fileName = this.defaultFileName;
      }
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowExportCredentialListDialog)).subscribe((event: { payload: ExportedFileType }) => {
      this.defaultFileName = 'Credentials/Credentials List ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event.payload);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override updatePage(): void {
    this.getCredentials();
  }

  private getCredentials(): void {
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.filters.orderBy = this.orderBy;
    this.store.dispatch([new GetCredential(this.filters), new GetCredentialTypes(), new GetCredentialsDataSources()]);
  }

  public onFilterClose() {
    this.CredentialsFilterFormGroup.setValue({
      searchTerm: this.filters.searchTerm || '',
      credentialIds: this.filters.credentialIds || null,
      credentialTypeIds: this.filters.credentialTypeIds || [],
      expireDateApplicable: this.filters.expireDateApplicable || null,
    });
    this.filteredItems = this.filterService.generateChips(this.CredentialsFilterFormGroup, this.filterColumns, this.datePipe);
    this.store.dispatch(new SetCredentialsFilterCount(this.filteredItems.length));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.CredentialsFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.CredentialsFilterFormGroup.reset();
    this.filteredItems = [];
    this.store.dispatch(new SetCredentialsFilterCount(this.filteredItems.length));
    this.currentPage = 1;
    this.filters = {};
    this.getCredentials();
  }

  public onFilterApply(): void {
    this.filters = this.CredentialsFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.CredentialsFilterFormGroup, this.filterColumns);
    this.store.dispatch(new SetCredentialsFilterCount(this.filteredItems.length));
    this.getCredentials();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public closeExport() {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    const ids = this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null;
    this.store.dispatch(new ExportCredentialList(new ExportPayload(
      fileType, 
      { ...this.filters, ids: ids }, 
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  public expireDateApplicableChange(data: Credential, event: any): void {
    data.expireDateApplicable = event.checked;
    this.store.dispatch(new SaveCredential({
      id: data.id,
      name: data.name,
      credentialTypeId: data.credentialTypeId,
      expireDateApplicable: data.expireDateApplicable,
      comment: data.comment,
    }));
  }

  public onEditButtonClick(credential: Credential, event: any): void {
    this.addActiveCssClass(event);
    this.credentialsFormGroup.setValue({
      credentialTypeId: credential.credentialTypeId,
      name: credential.name,
      expireDateApplicable: credential.expireDateApplicable,
      comment: credential.comment
    });
    this.editedCredentialId = credential.id;
    this.isEdit = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemoveButtonClick(credential: Credential, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm('Are you sure want to delete?', {
        title: 'Delete Record',
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveCredential(credential));
        }
        this.removeActiveCssClass();
      });
  }

  public onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSize = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public onFormCancelClick(): void {
    if (this.credentialsFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => !!confirm))
        .subscribe(() => {
          this.clearFormDetails();
        });
    } else {
      this.clearFormDetails();
    }
  }

  public onFormSaveClick(): void {
    if (this.credentialsFormGroup.valid) {
      if (this.isEdit) {
        const credential = new Credential({
          id: this.editedCredentialId,
          name: this.credentialsFormGroup.controls['name'].value,
          credentialTypeId: this.credentialsFormGroup.controls['credentialTypeId'].value,
          expireDateApplicable: this.credentialsFormGroup.controls['expireDateApplicable'].value,
          comment: this.credentialsFormGroup.controls['comment'].value,
        });

        this.store.dispatch(new SaveCredential(credential));
        this.isEdit = false;
        this.editedCredentialId = undefined;
      } else {
        const credential = new Credential({
          name: this.credentialsFormGroup.controls['name'].value,
          credentialTypeId: this.credentialsFormGroup.controls['credentialTypeId'].value,
          expireDateApplicable: this.credentialsFormGroup.controls['expireDateApplicable'].value,
          comment: this.credentialsFormGroup.controls['comment'].value
        });
        this.store.dispatch(new SaveCredential(credential));
      }
    } else {
      this.credentialsFormGroup.markAllAsTouched();
    }
  }

  private mapGridData(): void {
    this.credentials$.pipe(combineLatestWith(this.credentialTypes$), tap(() => this.gridDataSource = []),
      filter(([credentials, credentialTypes]) => credentials?.items?.length > 0 && credentialTypes.length > 0))
      .subscribe(([credentials, credentialTypes]) => {
        this.lastAvailablePage = credentials.totalPages;
        if (credentialTypes) {
          credentials.items.map(item => {
            let credentialType = credentialTypes.find(type => type.id === item.credentialTypeId);
            item.credentialTypeName = credentialType ? credentialType.name : '';
          });
        }
        this.gridDataSource = this.getRowsPerPage(credentials.items, this.currentPagerPage);
        this.totalDataRecords = credentials.totalCount;
    });
  }

  private clearFormDetails(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.isEdit = false;
    this.editedCredentialId = undefined;
    this.credentialsFormGroup.reset();
    this.removeActiveCssClass();
  }

  private createCredentialsForm(): void {
    this.credentialsFormGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      credentialTypeId: ['', Validators.required],
      expireDateApplicable: [false],
      comment: ['', Validators.maxLength(500)]
    });
    this.CredentialsFilterFormGroup = this.formBuilder.group({
      searchTerm: [''],
      credentialIds: [[]],
      credentialTypeIds: [[]],
      expireDateApplicable: [false],
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(data: object[], currentPage: number): object[] {
    return data.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
  }
}
