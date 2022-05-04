import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable } from 'rxjs';

import {
  AbstractGridConfigurationComponent
} from '../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Location } from '../../../../shared/models/location.model';
import { ShowSideDialog, ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '../../../../shared/enums/message-types';
import { RECORD_ADDED } from '../../../../shared/constants/messages';
import { CredentialType } from '../../../../shared/models/credential-type.model';
import { AdminState } from '../../../store/admin.state';
import { Credential } from '../../../../shared/models/credential.model';

@Component({
  selector: 'app-master-credential',
  templateUrl: './master-credential.component.html',
  styleUrls: ['./master-credential.component.scss']
})
export class MasterCredentialComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @Input() isActive: boolean = false;

  @Select(AdminState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;
  credentialTypesFields: FieldSettingsModel = { text: 'name', value: 'id' };

  credentialsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  // TODO: add selector, MasterCredential model
  @Select(AdminState.credentials)
  masterCredentials$: Observable<Credential[]>;

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    this.formBuilder = builder;
    this.createCredentialsForm();
  }

  ngOnInit(): void {
    // this.store.dispatch(new GetMasterCredentialTypes());
    // this.mapGridData();
  }

  onExpiryDateApplicableChange(event: any): void {
//  TODO: implementation
  }

  onEditButtonClick(credential: Location): void {
//  TODO: implementation
  }

  onRemoveButtonClick(credential: Location): void {
//  TODO: implementation
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.masterCredentials$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  onFormCancelClick(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.credentialsFormGroup.reset();
    // TODO: add modal dialog to confirm close
  }

  onFormSaveClick(): void {
    if (this.credentialsFormGroup.valid) {
      const credential: any = { // TODO: add model
        credentialType: this.credentialsFormGroup.controls['credentialType'].value,
        credentialDescription: this.credentialsFormGroup.controls['credentialDescription'].value,
        expiryDateCheckbox: this.credentialsFormGroup.controls['expiryDateCheckbox'].value
      }

      // this.store.dispatch(new SaveCredential(credential)); //   TODO: implementation
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));

      this.store.dispatch(new ShowSideDialog(false));
      this.credentialsFormGroup.reset();
    } else {
      this.credentialsFormGroup.markAllAsTouched();
    }
  }

  mapGridData(): void {
    // TODO: map credential types by id
    this.masterCredentials$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  private createCredentialsForm(): void {
    this.credentialsFormGroup = this.formBuilder.group({
      credentialType: ['', Validators.required],
      credentialDescription: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      expiryDateCheckbox: [false]
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
