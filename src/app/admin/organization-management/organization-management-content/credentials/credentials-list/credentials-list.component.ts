import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatestWith, filter, Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog } from '../../../../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { GetCredential, GetCredentialTypes, RemoveCredential, SaveCredential, UpdateCredential } from '@admin/store/admin.actions';
import { Credential } from '@shared/models/credential.model';
import { AdminState } from '@admin/store/admin.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { ConfirmService } from '@shared/services/confirm.service';

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
  credentialTypes$: Observable<CredentialType[]> ;
  credentialTypesFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(AdminState.credentials)
  credentials$: Observable<Credential[]>;

  credentialsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  editedCredentialId?: number;
  isEdit: boolean;

  fakeOrganizationId = 2;

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
    this.store.dispatch(new GetCredential(this.fakeOrganizationId));
    this.store.dispatch(new GetCredentialTypes());
    this.mapGridData();
  }

  onEditButtonClick(credential: Credential, event: any): void {
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

  onRemoveButtonClick(credential: Credential, event: any): void {
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
    this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.isEdit = false;
        this.editedCredentialId = undefined;
        this.credentialsFormGroup.reset();
        this.removeActiveCssClass();
      });
  }

  onFormSaveClick(): void {
    if (this.credentialsFormGroup.valid) {
      if (this.isEdit) {
        const credential = new Credential({
          id: this.editedCredentialId,
          name: this.credentialsFormGroup.controls['name'].value,
          credentialTypeId: this.credentialsFormGroup.controls['credentialTypeId'].value,
          expireDateApplicable: this.credentialsFormGroup.controls['expireDateApplicable'].value,
          comment: this.credentialsFormGroup.controls['comment'].value,
        });

        this.store.dispatch(new UpdateCredential(credential, this.fakeOrganizationId));
        this.isEdit = false;
        this.editedCredentialId = undefined;
      } else {
        const credential = new Credential({
          name: this.credentialsFormGroup.controls['name'].value,
          credentialTypeId: this.credentialsFormGroup.controls['credentialTypeId'].value,
          expireDateApplicable: this.credentialsFormGroup.controls['expireDateApplicable'].value,
          comment: this.credentialsFormGroup.controls['comment'].value,
          businessUnitId: this.fakeOrganizationId  // TODO: replace with valid value after BE implementation
        });
        this.store.dispatch(new SaveCredential(credential));
      }

      this.store.dispatch(new ShowSideDialog(false));
      this.credentialsFormGroup.reset();
      this.removeActiveCssClass();
    } else {
      this.credentialsFormGroup.markAllAsTouched();
    }
  }

  mapGridData(): void {
    this.credentials$.pipe(combineLatestWith(this.credentialTypes$),
      filter(([credentials, credentialTypes]) => credentials.length > 0 && credentialTypes.length > 0))
      .subscribe(([credentials, credentialTypes]) => {
        this.lastAvailablePage = this.getLastPage(credentials);
        if (credentialTypes) {
          credentials.map(item => {
            let credentialType = credentialTypes.find(type => type.id === item.credentialTypeId);
            item.credentialTypeName = credentialType ? credentialType.name : '';
          });
          // TODO: remove line below after credential type would have verification before removing if used elsewhere
          credentials = credentials.filter(credential => credential.credentialTypeName !== '');
        }
        this.gridDataSource = this.getRowsPerPage(credentials, this.currentPagerPage);
        this.totalDataRecords = credentials.length;
    });
  }

  private createCredentialsForm(): void {
    this.credentialsFormGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      credentialTypeId: ['', Validators.required],
      expireDateApplicable: [false],
      comment: ['', Validators.maxLength(500)]
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
