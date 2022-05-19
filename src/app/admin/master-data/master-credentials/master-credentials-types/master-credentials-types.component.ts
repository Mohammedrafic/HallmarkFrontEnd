import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { filter, Observable } from 'rxjs';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';

import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog, ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  CANCEL_COFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  RECORD_ADDED
} from '@shared/constants/messages';
import { CredentialType } from '@shared/models/credential-type.model';
import { ConfirmService } from '@shared/services/confirm.service';

import { AdminState } from '@admin/store/admin.state';
import { GetCredentialTypes, RemoveCredentialType, SaveCredentialType, UpdateCredentialType } from '@admin/store/admin.actions';

@Component({
  selector: 'app-master-credentials-types',
  templateUrl: './master-credentials-types.component.html',
  styleUrls: ['./master-credentials-types.component.scss']
})
export class MasterCredentialsTypesComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @Select(AdminState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  credentialTypeFormGroup: FormGroup;
  formBuilder: FormBuilder;

  isEdit: boolean;
  editedCredentialTypeId?: number;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createTypeForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCredentialTypes());
    this.mapGridData();
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
      })
      .subscribe((confirm) => {
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
      this.credentialType$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  onFormCancelClick(): void {
    this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.credentialTypeFormGroup.reset();
        this.isEdit = false;
        this.removeActiveCssClass();
      });
  }

  onFormSaveClick(): void {
    if (this.credentialTypeFormGroup.valid) {
      const type: CredentialType = {
        id: this.editedCredentialTypeId,
        name: this.credentialTypeFormGroup.controls['credentialTypeName'].value
      }

      if (this.isEdit) {
        this.store.dispatch(new UpdateCredentialType(type));
      } else {
        this.store.dispatch(new SaveCredentialType(type));
      }

      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      this.store.dispatch(new ShowSideDialog(false));
      this.credentialTypeFormGroup.reset();
      this.isEdit = false;
      this.removeActiveCssClass();
    } else {
      this.credentialTypeFormGroup.markAllAsTouched();
    }
  }

  mapGridData(): void {
    this.credentialType$.subscribe(data => {
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
