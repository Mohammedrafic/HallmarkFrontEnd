import {
  GetCandidatesCredentialByPage,
  GetCredentialTypes,
  GetMasterCredentials,
  RemoveCandidatesCredential,
  RemoveCandidatesCredentialSucceeded,
  SaveCandidatesCredential,
  SaveCandidatesCredentialSucceeded,
} from "@agency/store/candidate.actions";
import { CandidateState } from "@agency/store/candidate.state";
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { CANCEL_COFIRM_TEXT, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from "@shared/constants/messages";
import { CredentialVerifiedStatus } from "@shared/enums/status";
import { CandidateCredential, CandidateCredentialPage } from "@shared/models/candidate-credential.model";
import { CredentialType } from "@shared/models/credential-type.model";
import { ConfirmService } from "@shared/services/confirm.service";
import { valuesOnly } from "@shared/utils/enum.utils";
import { FieldSettingsModel } from "@syncfusion/ej2-angular-dropdowns";
import { GridComponent } from "@syncfusion/ej2-angular-grids";
import { debounceTime, delay, filter, merge, Observable, Subject, takeUntil } from "rxjs";
import { SetHeaderState, ShowSideDialog } from "src/app/store/app.actions";

@Component({
  selector: 'app-credentials-grid',
  templateUrl: './credentials-grid.component.html',
  styleUrls: ['./credentials-grid.component.scss']
})
export class CredentialsGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  public dropElement: HTMLElement;
  public title = 'Add';
  public addCredentialForm: FormGroup;
  public searchCredentialForm: FormGroup;
  public credentialTypesFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public credentialTypes: CredentialType[];
  public optionFields = { text: 'text', value: 'id' };
  public verifiedStatuses = Object.values(CredentialVerifiedStatus)
    .filter(valuesOnly)
    .map((text, id) => ({ text, id }));

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  @Select(CandidateState.candidateCredential)
  candidateCredential$: Observable<CandidateCredentialPage>;

  @Select(CandidateState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  @Select(CandidateState.masterCredentials)
  masterCredentials$: Observable<Credential[]>;

  get searchTermControl(): AbstractControl | null {
    return this.searchCredentialForm.get('searchTerm');
  }

  get credentialTypeIdControl(): AbstractControl | null {
    return this.searchCredentialForm.get('credentialTypeId');
  }

  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
  }

  ngOnInit(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
    this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(ofActionSuccessful(SaveCandidatesCredentialSucceeded)).subscribe(() => {
      this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
      this.addCredentialForm.markAsPristine();
      this.closeDialog();
    });
    this.actions$.pipe(ofActionSuccessful(RemoveCandidatesCredentialSucceeded)).subscribe(() => {
      this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
    });
    this.createAddCredentialForm();
    this.createSearchCredentialForm();
    this.subscribeOnSearchUpdate();
    this.credentialType$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(types => this.credentialTypes = types);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public browse() : void {
    document.getElementsByClassName('e-file-select-wrap')[0]?.querySelector('button')?.click();
  }

  public addNew(): void {
    this.store.dispatch(new GetMasterCredentials("", ""));
    this.store.dispatch(new GetCredentialTypes());
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onFilter(): void {

  }

  public dataBound(): void {
    this.grid.hideScroll();
  }

  public closeDialog(): void {
    if (this.addCredentialForm.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT)
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.closeSideDialog()
        });
    } else {
      this.closeSideDialog()
    }
  }

  public onSaveCredential(): void {
    if (this.addCredentialForm.valid) {
      this.saveCredential(this.addCredentialForm.getRawValue());
    } else {
      this.addCredentialForm.markAllAsTouched();
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize  = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public onCopy(event: MouseEvent, data: any) {
    event.stopPropagation();
    this.saveCredential(data);
  }

  public onDownload(event: MouseEvent, data: any) {
    event.stopPropagation();
    // TODO
  }

  public onEdit(event: MouseEvent, data: any) {
    event.stopPropagation();
    // TODO
  }


  public onRemove(event: MouseEvent, data: any) {
    event.stopPropagation();
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new RemoveCandidatesCredential(data));
      });
  }

  public getCredentialTypeName(id: number): string {
    return this.credentialTypes.find(item => item.id === id)?.name || 'Undefined type';
  }

  private closeSideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
      this.addCredentialForm.reset();
    });
  }

  private createAddCredentialForm(): void {
    this.addCredentialForm = this.fb.group({
      status: new FormControl(null, [Validators.required]),
      insitute: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      createdOn: new FormControl(null, [Validators.required]),
      number: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      experience: new FormControl(null, [Validators.required, Validators.maxLength(20)]),
      createdUntil: new FormControl(null, [Validators.required]),
      completedDate: new FormControl(null, [Validators.required])
    });
  }

  private createSearchCredentialForm(): void {
    this.searchCredentialForm = this.fb.group({
      searchTerm: new FormControl(''),
      credentialTypeId: new FormControl('')
    });
  }

  private saveCredential({ status, number, insitute, experience, createdOn, createdUntil, completedDate }: CandidateCredential): void {
    this.store.dispatch(new SaveCandidatesCredential({
      status, number, insitute, experience, createdOn, createdUntil, completedDate,
      candidateProfileId: 1, // TODO
      masterCredentialId: 1, // TODO
    }));
  }

  private subscribeOnSearchUpdate(): void {
    merge(
      (this.searchTermControl as AbstractControl).valueChanges,
      (this.credentialTypeIdControl as AbstractControl).valueChanges
    )
      .pipe(takeUntil(this.unsubscribe$), debounceTime(300))
      .subscribe(() => {
        this.store.dispatch(new GetMasterCredentials(
          this.searchTermControl?.value,
          this.credentialTypeIdControl?.value || ''
        ));
      });
  }
}
