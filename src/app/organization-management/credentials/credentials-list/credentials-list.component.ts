import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatestWith, filter, Observable, Subject, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog } from '../../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import {
  GetCredential,
  GetCredentialTypes,
  RemoveCredential,
  SaveCredential,
  SaveCredentialSucceeded,
} from '../../store/organization-management.actions';
import { Credential } from '@shared/models/credential.model';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { SortSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

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
  credentials$: Observable<Credential[]>;

  public credentialsFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  public editedCredentialId?: number;
  public isEdit: boolean;

  private unsubscribe$: Subject<void> = new Subject();

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private store: Store,
              private actions$: Actions,
              private confirmService: ConfirmService,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    this.formBuilder = builder;
    this.createCredentialsForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCredential());
    this.store.dispatch(new GetCredentialTypes());
    this.mapGridData();
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveCredentialSucceeded)).subscribe(() => {
      this.clearFormDetails();
      this.store.dispatch(new GetCredential());
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.credentials$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  public onFormCancelClick(): void {
    this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.clearFormDetails();
      });
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
    this.credentials$.pipe(combineLatestWith(this.credentialTypes$),
      filter(([credentials, credentialTypes]) => credentials?.length > 0 && credentialTypes.length > 0))
      .subscribe(([credentials, credentialTypes]) => {
        this.lastAvailablePage = this.getLastPage(credentials);
        if (credentialTypes) {
          credentials.map(item => {
            let credentialType = credentialTypes.find(type => type.id === item.credentialTypeId);
            item.credentialTypeName = credentialType ? credentialType.name : '';
          });
        }
        this.gridDataSource = this.getRowsPerPage(credentials, this.currentPagerPage);
        this.totalDataRecords = credentials.length;
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
