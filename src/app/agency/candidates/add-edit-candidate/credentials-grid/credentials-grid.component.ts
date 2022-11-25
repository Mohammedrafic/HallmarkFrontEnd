import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OutsideZone } from "@core/decorators";

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FileInfo, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { debounceTime, delay, filter, merge, Observable, Subject, takeUntil } from 'rxjs';

import { Permission } from '@core/interface';
import { FileSize, UserPermissions } from '@core/enums';
import { DateTimeHelper } from "@core/helpers";
import {
  DownloadCredentialFiles,
  DownloadCredentialFilesSucceeded,
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
} from '@agency/store/candidate.actions';
import { CandidateState } from '@agency/store/candidate.state';
import { CredentialGridService } from "@agency/services/credential-grid.service";
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from '@shared/constants/messages';
import { optionFields } from "@shared/constants";
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { MessageTypes } from "@shared/enums/message-types";
import { CredentialStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';
import { CandidateCredential, CandidateCredentialResponse, CredentialFile, } from '@shared/models/candidate-credential.model';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { SetHeaderState, ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
  agencySideCredentialStatuses,
  orgSideCredentialStatuses,
  orgSideCompletedCredentialStatuses,
  orgSidePendingCredentialStatuses,
  orgSideReviewedCredentialStatuses,
  AllowedCredentialFileExtensions,
  CredentialSelectionSettingsModel,
  StatusFieldSettingsModel,
} from './credentials-grid.constants';

@Component({
  selector: 'app-credentials-grid',
  templateUrl: './credentials-grid.component.html',
  styleUrls: ['./credentials-grid.component.scss'],
  providers: [MaskedDateTimeService],
})
export class CredentialsGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() isNavigatedFromOrganizationArea: boolean;
  @Input() orderId: number | null;
  @Input() areAgencyActionsAllowed: boolean;
  @Input() isCandidateAssigned = false;
  @Input() userPermission: Permission;

  @ViewChild('grid') grid: GridComponent;
  @ViewChild('filesUploader') uploadObj: UploaderComponent;

  public readonly statusEnum = CredentialStatus;
  public readonly userPermissions = UserPermissions;
  public readonly allowedExtensions = AllowedCredentialFileExtensions;
  public readonly selectionOptions = CredentialSelectionSettingsModel;
  public readonly maxFileSize = FileSize.MB_20;
  public readonly orderCredentialId = 0;
  public readonly statusFieldSettingsModel = StatusFieldSettingsModel;
  public readonly typeFieldSettingsModel = optionFields;
  public dropElement: HTMLElement;
  public addCredentialForm: FormGroup;
  public searchCredentialForm: FormGroup;
  public disabledCopy = false;
  public candidateCredentialResponse: CandidateCredentialResponse;
  public openFileViewerDialog = new EventEmitter<number>();
  public today = new Date();

  public showCertifiedFields: boolean;
  public credentialStatusOptions: FieldSettingsModel[] = [];

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private masterCredentialId: number | null;
  private credentialId: number | null;
  private filesDetails: Blob[] = [];
  private hasFiles = false;
  private removeFiles = false;
  private file: CredentialFile | null;
  private readonly candidateProfileId: number;

  @Select(CandidateState.candidateCredential)
  candidateCredential$: Observable<CandidateCredentialResponse>;

  @Select(CandidateState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  @Select(CandidateState.masterCredentials)
  masterCredentials$: Observable<Credential[]>;

  public get selectCredentialError(): boolean {
    return !this.masterCredentialId && this.addCredentialForm.dirty;
  }

  public get disableClearButton(): boolean {
    return !this.uploadObj?.filesData.length && !this.hasFiles;
  }

  public get isEdit(): boolean {
    return !!this.credentialId;
  }

  public get showCompleteDate(): boolean {
    return this.statusControl?.value === CredentialStatus.Completed;
  }

  public get showRejectReason(): boolean {
    return this.statusControl?.value === CredentialStatus.Rejected;
  }

  public get isOrganizationSide(): boolean {
    return this.isOrganization || this.isNavigatedFromOrganizationArea;
  }

  public get bulkDownloadAmountText(): string {
    return `${this.isAllRowsSelected ? 'All' : this.selectedItems.length } ${ this.selectedItems.length === 1 ? 'Row' : 'Rows' } Selected`;
  }

  private get statusControl(): AbstractControl | null {
    return this.addCredentialForm.get('status');
  }

  private get searchTermControl(): AbstractControl | null {
    return this.searchCredentialForm.get('searchTerm');
  }

  private get credentialTypeIdControl(): AbstractControl | null {
    return this.searchCredentialForm.get('credentialTypeId');
  }

  private get isOrganization(): boolean {
    return this.store.selectSnapshot(UserState.user)?.businessUnitType === BusinessUnitType.Organization;
  }

  private get isAllRowsSelected(): boolean {
    return this.selectedItems.length === this.pageSize;
  }

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private actions$: Actions,
    private fb: FormBuilder,
    private credentialGridService: CredentialGridService,
    private confirmService: ConfirmService,
    private readonly ngZone: NgZone,
  ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
    this.candidateProfileId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize, this.orderId, this.candidateProfileId));
    this.store.dispatch(new GetCredentialTypes());
    this.watchForPageChanges();
    this.watchForCandidateActions();
    this.createAddCredentialForm();
    this.createSearchCredentialForm();
    this.watchForSearchUpdate();
    this.watchForCandidateCredential();
    this.watchForDownloadCredentialFiles();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public browse(): void {
    document
      .getElementById('credentials-files')
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')
      ?.click();
  }

  public addNew(): void {
    this.setCredentialStatusOptions(
      this.isOrganization || this.isNavigatedFromOrganizationArea
        ? orgSideCredentialStatuses
        : agencySideCredentialStatuses
    );

    this.store.dispatch(new GetMasterCredentials('', ''));
    this.store.dispatch(new ShowSideDialog(true)).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.setDropElement();
      this.setDefaultStatusValue();
    });
  }

  public dataBound(): void {
    this.contentLoadedHandler();
    this.grid.hideScroll();
  }

  public setCompleteDate(event: ChangeEventArgs): void {
    this.addCredentialForm
      .get('completedDate')
      ?.setValue(event.value === CredentialStatus.Completed ? new Date().toISOString() : null);
  }

  public closeDialog(): void {
    if (this.addCredentialForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => confirm),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          this.closeSideDialog();
        });
    } else {
      this.closeSideDialog();
    }
  }

  public saveFormValue(): void {
    if (this.masterCredentialId && (this.addCredentialForm.valid || this.addCredentialForm.disabled)) {
      this.saveCredential(this.addCredentialForm.getRawValue());
    } else {
      this.addCredentialForm.markAsDirty();
    }
  }

  public selectRowsPerPage(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public selectPage(event: { currentPage: number; value: number }): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public copyCredential(event: MouseEvent, data: CandidateCredential) {
    event.stopPropagation();
    this.disabledCopy = true;
    this.masterCredentialId = data.masterCredentialId;
    this.saveCredential({
      ...data,
      status: CredentialStatus.Pending,
      completedDate: null,
    });
  }

  public viewFiles(event: MouseEvent, id: number) {
    event.stopPropagation();
    this.store.dispatch(new GetGroupedCredentialsFiles()).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.openFileViewerDialog.emit(id);
    });
  }

  public downloadFile(event: MouseEvent, file: CredentialFile) {
    event.stopPropagation();
    this.file = file;
    this.store.dispatch(new GetCredentialFiles(this.file.id));
  }

  public editCredential(
    event: MouseEvent,
    {
      status,
      insitute,
      createdOn,
      number,
      experience,
      createdUntil,
      completedDate,
      masterCredentialId,
      id,
      credentialFiles,
      expireDateApplicable,
      credentialTypeName,
      masterName,
      rejectReason,
    }: CandidateCredential
  ) {
    event.stopPropagation();
    this.updateCredentialStatusOptions(status as CredentialStatus);
    this.showCertifiedFields = !!expireDateApplicable;
    this.credentialId = id as number;
    this.masterCredentialId = masterCredentialId;
    this.hasFiles = !!credentialFiles?.length;
    this.store.dispatch(new ShowSideDialog(true)).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.setDropElement();
    });
    this.searchCredentialForm.patchValue({
      searchTerm: masterName,
      credentialTypeId: credentialTypeName,
    });
    this.addCredentialForm.patchValue({
      status,
      insitute,
      createdOn,
      number,
      experience,
      createdUntil,
      completedDate,
      rejectReason,
    });
  }

  public clearFiles(): void {
    this.removeFiles = true;
    this.hasFiles = false;
    this.filesDetails = [];
    this.uploadObj.clearAll();
  }

  public selectCredentialFile(event: SelectedEventArgs): void {
    if (event.filesData[0].statusCode !== '1') {
      this.addFilesValidationMessage(event.filesData[0]);
    }
  }

  public removeCredential(event: MouseEvent, data: any) {
    event.stopPropagation();
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter((confirm: boolean) => confirm),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.store.dispatch(new RemoveCandidatesCredential(data));
      });
  }

  public bulkDownload(): void {
    const rowsWithFiles = this.credentialGridService.getCredentialRowsWithFiles(this.selectedItems);

    if (!rowsWithFiles.length && !this.isAllRowsSelected) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, 'Selected rows do not have files'));
      return;
    }

    if (this.isAllRowsSelected) {
      this.store.dispatch(new DownloadCredentialFiles(this.candidateProfileId, []));
    } else {
      const fileIds = this.credentialGridService.getCandidateCredentialFileIds(rowsWithFiles);
      this.store.dispatch(new DownloadCredentialFiles(this.candidateProfileId, fileIds));
    }
  }

  public selectMasterCredentialId(event: { data: Credential }): void {
    this.masterCredentialId = event.data.id as number;
    this.showCertifiedFields = event.data.expireDateApplicable;
  }

  public clearMasterCredentialId(): void {
    this.masterCredentialId = null;
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find((item) => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  private closeSideDialog(): void {
    this.store
      .dispatch(new ShowSideDialog(false))
      .pipe(
        delay(500),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.addCredentialForm.reset();
        this.addCredentialForm.enable();
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
      insitute: new FormControl(null, [Validators.maxLength(100)]),
      createdOn: new FormControl(null),
      number: new FormControl(null, [Validators.maxLength(100)]),
      experience: new FormControl(null, [Validators.maxLength(20)]),
      createdUntil: new FormControl(null),
      completedDate: new FormControl(null),
      rejectReason: new FormControl(null),
    });
  }

  private createSearchCredentialForm(): void {
    this.searchCredentialForm = this.fb.group({
      searchTerm: new FormControl(''),
      credentialTypeId: new FormControl(''),
    });
  }

  private saveCredential({
    status,
    number,
    insitute,
    experience,
    createdOn,
    createdUntil,
    completedDate, rejectReason,
  }: CandidateCredential): void {
    if (this.masterCredentialId) {
      if (createdOn != null) {
        createdOn = DateTimeHelper.toUtcFormat(createdOn);
      }

      if (createdUntil != null) {
        createdUntil = DateTimeHelper.toUtcFormat(createdUntil);
      }
      this.store.dispatch(
        new SaveCandidatesCredential({
          status,
          number,
          insitute,
          experience,
          createdOn,
          createdUntil,
          completedDate,
          rejectReason,
          masterCredentialId: this.masterCredentialId,
          id: this.credentialId as number,
          orderId: this.orderId,
        })
      );
    }
  }

  private watchForSearchUpdate(): void {
    merge(
      (this.searchTermControl as AbstractControl).valueChanges,
      (this.credentialTypeIdControl as AbstractControl).valueChanges
    )
      .pipe(
        filter(() => !this.isEdit),
        debounceTime(300),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.store.dispatch(
          new GetMasterCredentials(this.searchTermControl?.value || '', this.credentialTypeIdControl?.value || '')
        );
      });
  }

  private uploadFiles(credentialId: number): void {
    if (this.uploadObj.filesData[0]?.statusCode === '1') {
      this.filesDetails.push(this.uploadObj.filesData[0].rawFile as Blob);
    }

    if (this.filesDetails.length || this.removeFiles) {
      this.store.dispatch(new UploadCredentialFiles(this.filesDetails, credentialId));
    }
  }

  private setDropElement(): void {
    this.dropElement = document.getElementById('files-droparea') as HTMLElement;
  }

  @OutsideZone
  private addFilesValidationMessage(file: FileInfo) {
    requestAnimationFrame(() => {
      const uploaderErrorMessageElement = document.getElementsByClassName('e-file-status')[0] as HTMLElement;
      if (uploaderErrorMessageElement && file.statusCode === '0') {
        uploaderErrorMessageElement.innerText = file.size > this.maxFileSize
          ? 'The file should not exceed 20MB.'
          : 'The file should be in pdf, jpg, jpeg, png format.';
      }
    });
  }

  private watchForCandidateCredential(): void {
    this.candidateCredential$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((response: CandidateCredentialResponse) => {
      this.candidateCredentialResponse = response;
    });
  }

  private setDefaultStatusValue(): void {
    this.statusControl?.setValue(CredentialStatus.Pending);
  }

  private setCredentialStatusOptions(statuses: CredentialStatus[], currentStatus?: CredentialStatus): void {
    const credentialStatuses = !currentStatus || statuses.includes(currentStatus) ? statuses : [currentStatus, ...statuses];

    this.credentialStatusOptions = credentialStatuses.map((item: CredentialStatus) => {
      return {
        text: CredentialStatus[item],
        id: item,
      };
    });
  }

  private updateCredentialStatusOptions(status: CredentialStatus): void {
    if (this.isOrganizationSide) {
      switch (status) {
        case CredentialStatus.Completed:
          this.setCredentialStatusOptions(orgSideCompletedCredentialStatuses, status);
          break;
        case CredentialStatus.Pending:
          this.setCredentialStatusOptions(orgSidePendingCredentialStatuses, status);
          break;
        case CredentialStatus.Reviewed:
          this.setCredentialStatusOptions(orgSideReviewedCredentialStatuses, status);
          break;
        default:
          this.setCredentialStatusOptions(orgSideCredentialStatuses, status);
      }
    } else {
      this.setCredentialStatusOptions(agencySideCredentialStatuses, status);
    }
  }

  private watchForDownloadCredentialFiles(): void {
    this.actions$.pipe(
      ofActionSuccessful(DownloadCredentialFilesSucceeded),
      takeUntil(this.unsubscribe$)
    ).subscribe((payload: { file: Blob, candidateName: string }) => {
      const dateTime = DateTimeHelper.formatDateUTC(DateTimeHelper.toUtcFormat(new Date()), 'MM/dd/YYYY HH:mm');
      downloadBlobFile(payload.file, `${payload.candidateName} Credentials ${dateTime}.zip`);
    });
  }

  private watchForPageChanges(): void {
    this.pageSubject.pipe(
      debounceTime(1),
      takeUntil(this.unsubscribe$)
    ).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize, this.orderId, this.candidateProfileId));
    });
  }

  private watchForCandidateActions(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(SaveCandidatesCredentialSucceeded),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((credential: { payload: CandidateCredential }) => {
        this.credentialId = credential.payload.id as number;
        this.disabledCopy = false;
        this.selectedItems = [];
        this.uploadFiles(this.credentialId);

        if (!this.removeFiles) {
          this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize, this.orderId, this.candidateProfileId));
          this.addCredentialForm.markAsPristine();
          this.closeDialog();
        }
      });

    this.actions$.pipe(
      ofActionSuccessful(SaveCandidatesCredentialFailed),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.disabledCopy = false;
    });
    this.actions$.pipe(
      ofActionSuccessful(UploadCredentialFilesSucceeded),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize, this.orderId, this.candidateProfileId));
      this.addCredentialForm.markAsPristine();
      this.closeDialog();
    });
    this.actions$.pipe(
      ofActionSuccessful(RemoveCandidatesCredentialSucceeded),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize, this.orderId, this.candidateProfileId));
    });
    this.actions$.pipe(
      ofActionSuccessful(GetCredentialFilesSucceeded),
      takeUntil(this.unsubscribe$)
    ).subscribe((files: { payload: Blob }) => {
      if (this.file) {
        downloadBlobFile(files.payload, this.file.name);
        this.file = null;
      }
    });
  }
}
