import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';

import {
  AbstractGridConfigurationComponent
} from '../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog, ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '../../../../shared/enums/message-types';
import { RECORD_ADDED } from '../../../../shared/constants/messages';
import { AdminState } from '../../../store/admin.state';
import { CredentialType } from '../../../../shared/models/credential-type.model';
import { SaveCredentialType, UpdateCredentialType } from '../../../store/admin.actions';

@Component({
  selector: 'app-master-credentials-types',
  templateUrl: './master-credentials-types.component.html',
  styleUrls: ['./master-credentials-types.component.scss']
})
export class MasterCredentialsTypesComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @Input() isActive: boolean = false;

  @Select(AdminState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  credentialTypeFormGroup: FormGroup;
  formBuilder: FormBuilder;

  isEdit: boolean;
  editedCredentialTypeId?: number;

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    this.formBuilder = builder;
    this.createTypeForm();
    this.mapGridData();
  }

  ngOnInit(): void {
    // this.store.dispatch(new GetMasterCredentialTypes());
  }

  onEditButtonClick(credentialType: CredentialType): void {
    this.credentialTypeFormGroup.setValue({
      credentialTypeName: credentialType.name
    });
    this.editedCredentialTypeId = credentialType.id;
    this.isEdit = true;

    this.store.dispatch(new ShowSideDialog(true));
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
    this.store.dispatch(new ShowSideDialog(false));
    this.credentialTypeFormGroup.reset();
    // TODO: add modal dialog to confirm close
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
    } else {
      this.credentialTypeFormGroup.markAllAsTouched();
    }
  }

  mapGridData(): void {
    // TODO: map credential types by id
    this.credentialType$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  private createTypeForm(): void {
    this.credentialTypeFormGroup = this.formBuilder.group({
      credentialTypeName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
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
