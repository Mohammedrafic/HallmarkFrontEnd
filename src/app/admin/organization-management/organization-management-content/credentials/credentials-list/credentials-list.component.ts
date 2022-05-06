import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { filter, Observable, of } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import {
  AbstractGridConfigurationComponent
} from '../../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog, ShowToast } from '../../../../../store/app.actions';
import { MessageTypes } from '../../../../../shared/enums/message-types';
import { RECORD_ADDED } from '../../../../../shared/constants/messages';
import { GetCredentialTypes, RemoveCredential, SaveCredential, UpdateCredential } from '../../../../store/admin.actions';
import { Credential } from '../../../../../shared/models/credential.model';
import { AdminState } from '../../../../store/admin.state';
import { CredentialType } from '../../../../../shared/models/credential-type.model';
import { ConfirmService } from '../../../../../shared/services/confirm.service';

export const MESSAGE_CANNOT_BE_DELETED = 'Credential cannot be deleted';

@Component({
  selector: 'app-credentials-list',
  templateUrl: './credentials-list.component.html',
  styleUrls: ['./credentials-list.component.scss']
})
export class CredentialsListComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @Input() isActive: boolean = false;

  // @Select(AdminState.credentialTypes) // TODO: uncomment after BE implementation
  credentialType$: Observable<CredentialType[]> = of([{name: 'MockCredType 1', id: 1}]); // TODO: fix after BE implementation
  credentialTypesFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(AdminState.credentials)
  credentials$: Observable<Credential[]>;

  credentialsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  editedCredentialId?: number;
  isEdit: boolean;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private store: Store,
              private confirmService: ConfirmService,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    this.formBuilder = builder;
    this.createCredentialsForm();
  }

  ngOnInit(): void {
    // this.store.dispatch(new GetCredentials()); // TODO: uncomment after BE implementation
    // this.store.dispatch(new GetCredentialTypes()); // TODO: uncomment after BE implementation
    this.mapGridData();
  }

  onEditButtonClick(credential: Credential): void {
    this.credentialsFormGroup.setValue({
      credentialTypeId: credential.credentialTypeId,
      credentialDescription: credential.name,
      // TODO: ExpiryDate checkbox state
    });
    this.editedCredentialId = credential.id;
    this.isEdit = true;
  }

  onRemoveButtonClick(credential: Credential): void {
    if (credential.id) { // TODO: add verification to prevent remove if credential is used elsewhere
      this.confirmService
        .confirm('Are you sure want to delete?', {
          title: 'Delete Record',
          okButtonLabel: 'Delete',
          okButtonClass: 'delete-button'
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new RemoveCredential(credential));
        });
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, MESSAGE_CANNOT_BE_DELETED));
    }
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.credentials$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  onFormCancelClick(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.isEdit = false;
    this.editedCredentialId = undefined;
    this.credentialsFormGroup.reset();
    // TODO: add modal dialog to confirm close
  }

  onFormSaveClick(): void {
    if (this.credentialsFormGroup.valid) {
      const credential: Credential = {
        id: this.editedCredentialId,
        credentialTypeId: this.credentialsFormGroup.controls['credentialTypeId'].value,
        name: this.credentialsFormGroup.controls['credentialDescription'].value,
        // TODO: add checkbox for expiry date applicable
      }

      if (this.isEdit) {
        this.store.dispatch(new UpdateCredential(credential));
        this.isEdit = false;
        this.editedCredentialId = undefined;
      } else {
        this.store.dispatch(new SaveCredential(credential));
      }

      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      this.store.dispatch(new ShowSideDialog(false));
      this.credentialsFormGroup.reset();
    } else {
      this.credentialsFormGroup.markAllAsTouched();
    }
  }

  mapGridData(): void {
    // TODO: map credential types by id
    this.credentials$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  private createCredentialsForm(): void {
    this.credentialsFormGroup = this.formBuilder.group({
      credentialTypeId: ['', Validators.required],
      credentialDescription: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      expiryDate: [false]
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
