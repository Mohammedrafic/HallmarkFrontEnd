import {
  GetCandidatesCredentialByPage,
  GetCredentialFiles,
  GetCredentialFilesSucceeded,
  GetCredentialTypes,
  GetGroupedCredentialsFiles,
  GetMasterCredentials,
  RemoveCandidatesCredential,
  RemoveCandidatesCredentialSucceeded,
  SaveCandidatesCredential,
  SaveCandidatesCredentialFailed,
  SaveCandidatesCredentialSucceeded,
  UploadCredentialFiles,
  UploadCredentialFilesSucceeded,
} from "@agency/store/candidate.actions";
import { CandidateState } from "@agency/store/candidate.state";
import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import {
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE
} from "@shared/constants/messages";
import { CredentialVerifiedStatus, STATUS_COLOR_GROUP } from "@shared/enums/status";
import { CandidateCredential, CandidateCredentialPage, CredentialFile } from "@shared/models/candidate-credential.model";
import { CredentialType } from "@shared/models/credential-type.model";
import { ConfirmService } from "@shared/services/confirm.service";
import { valuesOnly } from "@shared/utils/enum.utils";
import { downloadBlobFile } from "@shared/utils/file.utils";
import { FieldSettingsModel } from "@syncfusion/ej2-angular-dropdowns";
import { GridComponent } from "@syncfusion/ej2-angular-grids";
import { FileInfo, SelectedEventArgs, UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { debounceTime, delay, filter, merge, Observable, Subject, takeUntil } from "rxjs";
import { SetHeaderState, ShowSideDialog } from "src/app/store/app.actions";

@Component({
  selector: 'app-credentials-grid',
  templateUrl: './credentials-grid.component.html',
  styleUrls: ['./credentials-grid.component.scss']
})
export class CredentialsGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('filesUploader') uploadObj: UploaderComponent;

  public readonly statusEnum = CredentialVerifiedStatus;
  public readonly allowedExtensions: string = '.pdf, .doc, .docx';
  public readonly maxFileSize = 10485760; // 10 mb
  public uploaderErrorMessageElement: HTMLElement;
  public dropElement: HTMLElement;
  public addCredentialForm: FormGroup;
  public searchCredentialForm: FormGroup;
  public disabledCopy = false;
  public candidateCredentialPage: CandidateCredentialPage;
  public openFileViewerDialog = new EventEmitter<void>();
  public credentialTypesFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public optionFields = { text: 'text', value: 'id' };
  public verifiedStatuses = Object.values(CredentialVerifiedStatus)
    .filter(valuesOnly)
    .map((text, id) => ({ text, id }));

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private readonly candidateProfileId: number;
  private masterCredentialId: number | null;
  private credentialId: number | null;
  private filesDetails: Blob[] = []
  private hasFiles = false;
  private removeFiles = false;
  private file: CredentialFile | null;

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

  get selectCredentialError(): boolean {
    return !this.masterCredentialId && this.addCredentialForm.dirty;
  }

  get disableClearButton(): boolean {
    return  !this.uploadObj?.filesData.length && !this.hasFiles;
  }

  get isEdit(): boolean {
    return !!this.credentialId;
  }

  constructor(private store: Store,
              private route: ActivatedRoute,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
    this.candidateProfileId = parseInt(route.snapshot.paramMap.get('id') as string);
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(ofActionSuccessful(SaveCandidatesCredentialSucceeded)).subscribe((credential: { payload: CandidateCredential }) => {
      this.credentialId = credential.payload.id as number;
      this.disabledCopy = false;
      this.uploadFiles(this.credentialId);

      if (!this.removeFiles) {
        this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
        this.addCredentialForm.markAsPristine();
        this.closeDialog();
      }
    });
    this.actions$.pipe(ofActionSuccessful(SaveCandidatesCredentialFailed)).subscribe(() => {
      this.disabledCopy = false;
    });
    this.actions$.pipe(ofActionSuccessful(UploadCredentialFilesSucceeded)).subscribe(() => {
      this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
      this.addCredentialForm.markAsPristine();
      this.closeDialog();
    });
    this.actions$.pipe(ofActionSuccessful(RemoveCandidatesCredentialSucceeded)).subscribe(() => {
      this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(ofActionSuccessful(GetCredentialFilesSucceeded)).subscribe((files: { payload: Blob }) => {
      if (this.file) {
        downloadBlobFile(files.payload, this.file.name);
        this.file = null;
      }
    });
    this.createAddCredentialForm();
    this.createSearchCredentialForm();
    this.subscribeOnSearchUpdate();
    this.subscribeOnCandidateCredential();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public browse() : void {
    document.getElementById('credentials-files')
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')
      ?.click();
  }

  public addNew(): void {
    this.store.dispatch(new GetMasterCredentials('', ''));
    this.store.dispatch(new GetCredentialTypes());
    this.store.dispatch(new ShowSideDialog(true)).subscribe(() => this.setDropElement());
  }

  public onFilter(): void {

  }

  public dataBound(): void {
    this.grid.hideScroll();
  }

  public closeDialog(): void {
    if (this.addCredentialForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
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
    this.disabledCopy = true;
    this.masterCredentialId = data.masterCredentialId;
    this.saveCredential(data);
  }

  public onViewFiles() {
    this.store.dispatch(new GetGroupedCredentialsFiles()).subscribe(() => this.openFileViewerDialog.emit());
  }

  public onDownload(event: MouseEvent, file: CredentialFile) {
    event.stopPropagation();
    this.file = file;
    this.store.dispatch(new GetCredentialFiles(this.file.id));
  }

  public onEdit(event: MouseEvent,
                { status, insitute, createdOn, number, experience, createdUntil,
                  completedDate, masterCredentialId, id, credentialFiles }: CandidateCredential) {
    event.stopPropagation();
    this.credentialId = id as number;
    this.masterCredentialId = masterCredentialId;
    this.hasFiles = !!credentialFiles?.length;
    this.store.dispatch(new GetMasterCredentials('', ''));
    this.store.dispatch(new GetCredentialTypes());
    this.store.dispatch(new ShowSideDialog(true)).subscribe(() => this.setDropElement());
    this.addCredentialForm.patchValue({
      status, insitute, createdOn, number,
      experience, createdUntil, completedDate
    });
  }

  public clearFiles(): void {
    this.removeFiles = true;
    this.hasFiles = false;
    this.filesDetails = []
    this.uploadObj.clearAll();
  }


  public onFileSelected(args : SelectedEventArgs) : void {
    // Filter the 3 files only to showcase
    args.filesData.splice(3);
    let filesData : FileInfo[] = this.uploadObj.getFilesData();
    let allFiles : FileInfo[] = filesData.concat(args.filesData);
    if (allFiles.length > 3) {
      for (let i : number = 0; i < allFiles.length; i++) {
        if (allFiles.length > 3) {
          allFiles.shift();
        }
      }
      args.filesData = allFiles;
      // set the modified custom data
      args.modifiedFilesData = args.filesData;
    }
    args.isModified = true;
    allFiles.forEach((file, index) => this.addFilesValidationMessage(file, index));
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

  public selectMasterCredentialId(event: any): void {
    this.masterCredentialId = event.data.id;
  }

  public clearMasterCredentialId(): void {
    this.masterCredentialId = null;
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find(item => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  private closeSideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
      this.addCredentialForm.reset();
      this.searchCredentialForm.reset();
      this.addCredentialForm.markAsPristine();
      this.credentialId = null;
      this.masterCredentialId = null;
      this.removeFiles = false;
      this.filesDetails = [];
      this.uploadObj.clearAll();
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
    if (this.masterCredentialId) {
      this.store.dispatch(new SaveCandidatesCredential({
        status, number, insitute, experience, createdOn, createdUntil, completedDate,
        candidateProfileId: this.candidateProfileId,
        masterCredentialId: this.masterCredentialId,
        id: this.credentialId as number
      }));
    }
  }

  private subscribeOnSearchUpdate(): void {
    merge(
      (this.searchTermControl as AbstractControl).valueChanges,
      (this.credentialTypeIdControl as AbstractControl).valueChanges
    )
      .pipe(takeUntil(this.unsubscribe$), debounceTime(300))
      .subscribe(() => {
        this.store.dispatch(new GetMasterCredentials(
          this.searchTermControl?.value || '',
          this.credentialTypeIdControl?.value || ''
        ));
      });
  }

  private uploadFiles(credentialId: number): void {
    this.uploadObj.filesData.forEach((item, index) => {
      if (this.uploadObj.filesData[index].statusCode === '1' && this.filesDetails.length < 3) {
        this.filesDetails.push(this.uploadObj.filesData[index].rawFile as Blob);
      }
    });

    if (this.filesDetails.length || this.removeFiles) {
      this.store.dispatch(new UploadCredentialFiles(this.filesDetails, credentialId));
    }
  }

  private setDropElement(): void {
    this.dropElement = document.getElementById('files-droparea') as HTMLElement;
  }

  private addFilesValidationMessage(file: FileInfo, fileIndex: number) {
    requestAnimationFrame(() => {
      this.uploaderErrorMessageElement = document.getElementsByClassName('e-validation-fails')[fileIndex] as HTMLElement;
      if (this.uploaderErrorMessageElement) {
        this.uploaderErrorMessageElement.innerText = file.size > this.maxFileSize
          ? 'The file exceeds the limitation, max allowed 10 MB.'
          : 'The file should be in Pdf, Doc, Docx format.';
      }
    });
  }

  private subscribeOnCandidateCredential(): void {
    this.candidateCredential$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((page: CandidateCredentialPage) => this.candidateCredentialPage = page);
  }
}
