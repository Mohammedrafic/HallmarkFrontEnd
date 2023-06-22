import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';

import { ShowExportDialog, ShowSideDialog, ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  RECORD_ADDED,
  RECORD_MODIFIED
} from '@shared/constants/messages';
import { CredentialType } from '@shared/models/credential-type.model';
import { ConfirmService } from '@shared/services/confirm.service';

import { AdminState } from '@admin/store/admin.state';
import {
  ExportCredentialTypes,
  GetCredentialTypes,
  RemoveCredentialType,
  SaveCredentialType,
  UpdateCredentialType
} from '@admin/store/admin.actions';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { TakeUntilDestroy } from '@core/decorators';

@Component({
  selector: 'app-master-credentials-types',
  templateUrl: './master-credentials-types.component.html',
  styleUrls: ['./master-credentials-types.component.scss']
})
@TakeUntilDestroy
export class MasterCredentialsTypesComponent extends AbstractPermissionGrid implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @Select(AdminState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  public credentialTypeFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  public isEdit: boolean;
  public editedCredentialTypeId?: number;

  public fileName: string;
  public defaultFileName: string;

  public columnsToExport: ExportColumn[] = [
    { text:'Types', column: 'Name'}
  ];

  protected componentDestroy: () => Observable<unknown>;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(protected override store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe) {
    super(store);
    this.formBuilder = builder;
    this.createTypeForm();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(new GetCredentialTypes());
    this.mapGridData();
  }

  public override customExport(): void {
    this.defaultFileName = 'Credential Types ' + this.generateDateTime(this.datePipe);
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
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
    this.defaultFileName = 'Credential Types ' + this.generateDateTime(this.datePipe);
    this.store.dispatch(new ExportCredentialTypes(new ExportPayload(
      fileType,
      { },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  onAddCredentialTypeClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  onEditButtonClick(credentialType: CredentialType, event: any): void {
    this.addActiveCssClass(event);
    this.credentialTypeFormGroup.setValue({
      credentialTypeName: credentialType.name
    });
    this.editedCredentialTypeId = credentialType.id;
    this.isEdit = true;

    this.store.dispatch(new ShowSideDialog(true));
  }

  onRemoveButtonClick(credentialType: CredentialType, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      }).pipe(
        takeUntil(this.componentDestroy())
      ).subscribe((confirm) => {
        if (confirm && credentialType.id) {
          this.store.dispatch(new RemoveCredentialType(credentialType));
        }
        this.removeActiveCssClass();
      });
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.credentialType$.pipe(takeUntil(this.componentDestroy())).subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  onFormCancelClick(): void {
    if (this.credentialTypeFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(
          filter(confirm => !!confirm),
          takeUntil(this.componentDestroy()),
        ).subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.credentialTypeFormGroup.reset();
          this.isEdit = false;
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.credentialTypeFormGroup.reset();
      this.isEdit = false;
      this.removeActiveCssClass();
    }
  }

  onFormSaveClick(): void {
    if (this.credentialTypeFormGroup.valid) {
      const type: CredentialType = {
        id: this.editedCredentialTypeId,
        name: this.credentialTypeFormGroup.controls['credentialTypeName'].value
      }

      if (this.isEdit) {
        this.store.dispatch(new UpdateCredentialType(type));
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      } else {
        this.store.dispatch(new SaveCredentialType(type));
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      }

      this.store.dispatch(new ShowSideDialog(false));
      this.credentialTypeFormGroup.reset();
      this.isEdit = false;
      this.removeActiveCssClass();
    } else {
      this.credentialTypeFormGroup.markAllAsTouched();
    }
  }

  mapGridData(): void {
    this.credentialType$.pipe(takeUntil(this.componentDestroy())).subscribe(data => {
      if (data) {
        this.lastAvailablePage = this.getLastPage(data);
        this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
        this.totalDataRecords = data.length;
      }
    });
  }

  private createTypeForm(): void {
    this.credentialTypeFormGroup = this.formBuilder.group({
      credentialTypeName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(data: object[], currentPage: number): object[] {
    return data.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
  }

  private getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }
}
