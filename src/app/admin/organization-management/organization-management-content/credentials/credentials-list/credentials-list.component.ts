import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';

import {
  AbstractGridConfigurationComponent
} from '../../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog, ShowToast } from '../../../../../store/app.actions';
import { MessageTypes } from '../../../../../shared/enums/message-types';
import { MESSAGE_RECORD_HAS_BEEN_ADDED } from '../../../../../shared/constants/messages';
import { Location } from '../../../../../shared/models/location.model';
import { Credential } from '../../../../../shared/models/credential.model';
import { AdminState } from '../../../../store/admin.state';
import { CredentialType } from '../../../../../shared/models/credential-type.model';

@Component({
  selector: 'app-credentials-list',
  templateUrl: './credentials-list.component.html',
  styleUrls: ['./credentials-list.component.scss']
})
export class CredentialsListComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @Input() isActive: boolean = false;

  @Select(AdminState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  @Select(AdminState.credentials)
  credentials$: Observable<Credential[]>;

  credentialsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    this.formBuilder = builder;
    this.createCredentialsForm();
  }

  ngOnInit(): void {
  }

  onEditButtonClick(credential: Location): void {

  }

  onRemoveButtonClick(credential: Location): void {

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

  onExpiryDateApplicableChange(event: any): void {
    //   TODO: implementation
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
      this.store.dispatch(new ShowToast(MessageTypes.Success, MESSAGE_RECORD_HAS_BEEN_ADDED));

      this.store.dispatch(new ShowSideDialog(false));
      this.credentialsFormGroup.reset();
    } else {
      this.credentialsFormGroup.markAllAsTouched();
    }
  }

  onCredentialTypeDropDownChanged(event: any): void {
//  TODO: implementation
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
