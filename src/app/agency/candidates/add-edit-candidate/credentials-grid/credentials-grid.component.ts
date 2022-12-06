import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OutsideZone } from "@core/decorators";

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FileInfo, FilesPropModel, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { debounceTime, delay, filter, merge, Observable, Subject, takeUntil } from 'rxjs';

import { CustomFormGroup, Permission } from '@core/interface';
import { FileSize, UserPermissions } from '@core/enums';
import { DateTimeHelper } from "@core/helpers";
import {
  DownloadCredentialFiles,
  DownloadCredentialFilesSucceeded,
  GetCandidatesCredentialByPage,
  GetCredentialFiles,
  GetCredentialFilesSucceeded,
  GetCredentialStatuses,
  GetCredentialStatusesSucceeded,
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
import { AbstractGridConfigurationComponent }
  from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from '@shared/constants/messages';
import { optionFields } from "@shared/constants";
import { FileStatusCode } from "@shared/enums/file.enum";
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { MessageTypes } from "@shared/enums/message-types";
import { CredentialStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';
import {
  CandidateCredential,
  CandidateCredentialGridItem,
  CandidateCredentialResponse,
  CredentialFile,
} from '@shared/models/candidate-credential.model';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { SetHeaderState, ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
  AllowedCredentialFileExtensions,
  CredentialSelectionSettingsModel,
  StatusFieldSettingsModel,
  DisableEditMessage,
} from './credentials-grid.constants';
import { AddCredentialForm, SearchCredentialForm } from "./credentials-grid.interface";

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
  public readonly disableEditMessage = DisableEditMessage;
  public readonly statusFieldSettingsModel = StatusFieldSettingsModel;
  public readonly typeFieldSettingsModel = optionFields;
  public dropElement: HTMLElement;
  public addCredentialForm: CustomFormGroup<AddCredentialForm>;
  public searchCredentialForm: CustomFormGroup<SearchCredentialForm>;
  public disabledCopy = false;
  public candidateCredentialResponse: CandidateCredentialResponse;
  public gridItems: CandidateCredentialGridItem[] = [];
  public openFileViewerDialog = new EventEmitter<number>();
  public today = new Date();
  public disableAddCredentialButton: boolean;
  public showCertifiedFields: boolean;
  public credentialStatusOptions: FieldSettingsModel[] = [];
  public existingFiles: FilesPropModel[] = [];
  public hideFileSize = false;

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private masterCredentialId: number | null;
  private credentialId: number | null;
  private credentialStatus = CredentialStatus.Pending;
  private removeExistingFiles = false;
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
    return `${this.isAllRowsSelected
      ? 'All' : this.selectedItems.length } ${ this.selectedItems.length === 1 ? 'Row'
      : 'Rows' } Selected`;
  }

  private get isNavigatedFromCandidateProfile(): boolean {
    return !this.orderId;
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
    private credentialGridService: CredentialGridService,
    private confirmService: ConfirmService,
    private readonly ngZone: NgZone,
  ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
    this.candidateProfileId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCandidatesCredentialByPage(
      this.currentPage,
      this.pageSize,
      this.orderId,
      this.candidateProfileId
    ));
    this.store.dispatch(new GetCredentialTypes());
    this.addCredentialForm = this.credentialGridService.createAddCredentialForm();
    this.searchCredentialForm = this.credentialGridService.createSearchCredentialForm();
    this.watchForPageChanges();
    this.watchForCandidateActions();
    this.watchForCredentialStatuses();
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

  public openAddCredentialDialog(): void {
    this.store.dispatch(new GetCredentialStatuses(this.isOrganizationSide ?? true, this.orderId || null));
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
    this.showCertifiedFields = !!expireDateApplicable;
    this.credentialId = id as number;
    this.credentialStatus = status as CredentialStatus;
    this.masterCredentialId = masterCredentialId;
    this.setExistingFiles(credentialFiles);
    this.store.dispatch(new GetCredentialStatuses(
      this.isOrganizationSide ?? true,
      this.orderId || null,
      status as CredentialStatus,
      id as number
    ));
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
    this.removeExistingFiles = !!this.existingFiles.length;
    this.uploadObj.clearAll();
  }

  public selectCredentialFile(event: SelectedEventArgs): void {
    this.removeExistingFiles = false;
    this.hideFileSize = false;
    if (event.filesData[0].statusCode !== FileStatusCode.Valid) {
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
        this.credentialStatus = CredentialStatus.Pending;
        this.masterCredentialId = null;
        this.removeExistingFiles = false;
        this.existingFiles = [];
        this.uploadObj.clearAll();
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

  private setDropElement(): void {
    this.dropElement = document.getElementById('files-droparea') as HTMLElement;
  }

  @OutsideZone
  private addFilesValidationMessage(file: FileInfo) {
    requestAnimationFrame(() => {
      const uploaderErrorMessageElement = document.getElementsByClassName('e-file-status')[0] as HTMLElement;
      if (uploaderErrorMessageElement && file.statusCode === FileStatusCode.Invalid) {
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
      this.setDisableAddCredentialButton();
      this.setGridItems(response);
    });
  }

  private setDefaultStatusValue(): void {
    this.statusControl?.setValue(CredentialStatus.Pending);
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
      this.store.dispatch(new GetCandidatesCredentialByPage(
        this.currentPage,
        this.pageSize,
        this.orderId,
        this.candidateProfileId
      ));
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

        if (this.uploadObj.filesData[0]?.statusCode === FileStatusCode.Valid) {
          this.store.dispatch(new UploadCredentialFiles([this.uploadObj.filesData[0].rawFile as Blob], this.credentialId));
          return;
        }

        if (this.removeExistingFiles) {
          this.store.dispatch(new UploadCredentialFiles([], this.credentialId));
          return;
        }

        this.store.dispatch(new GetCandidatesCredentialByPage(
          this.currentPage,
          this.pageSize,
          this.orderId,
          this.candidateProfileId
        ));
        this.addCredentialForm.markAsPristine();
        this.closeDialog();
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
      this.store.dispatch(new GetCandidatesCredentialByPage(
        this.currentPage,
        this.pageSize,
        this.orderId,
        this.candidateProfileId
      ));
      this.addCredentialForm.markAsPristine();
      this.closeDialog();
    });
    this.actions$.pipe(
      ofActionSuccessful(RemoveCandidatesCredentialSucceeded),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.store.dispatch(new GetCandidatesCredentialByPage(
        this.currentPage,
        this.pageSize,
        this.orderId,
        this.candidateProfileId
      ));
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

  private watchForCredentialStatuses(): void {
    this.actions$.pipe(
      ofActionSuccessful(GetCredentialStatusesSucceeded),
      takeUntil(this.unsubscribe$)
    ).subscribe((payload: { statuses: CredentialStatus[] }) => {
      this.credentialStatusOptions = this.credentialGridService.getCredentialStatusOptions(payload.statuses);
      this.addCredentialForm.patchValue({ status: this.credentialStatus });
    });
  }

  private setDisableAddCredentialButton(): void {
    this.disableAddCredentialButton = !this.areAgencyActionsAllowed
      || !this.hasPermissions()
      || (this.isOrganizationSide && this.isNavigatedFromCandidateProfile);
  }

  private setGridItems(response: CandidateCredentialResponse): void {
    this.gridItems = response?.credentials.items.map((item: CandidateCredential) => {
      return {
        ...item,
        credentialFile: item.credentialFiles?.length ? item.credentialFiles[0] : null,
        disableCopy: this.disableCopy(item),
        disableEdit: this.disableEdit(item),
        showDisableEditTooltip: (item.status === this.statusEnum.Reviewed || item.status === this.statusEnum.Verified)
          && !this.isOrganizationSide,
        disableDelete: this.disableDelete(item),
      };
    });
  }

  private disableCopy(item: CandidateCredential): boolean {
    return !this.areAgencyActionsAllowed || this.disabledCopy || item.id === this.orderCredentialId
      || !this.hasPermissions()
      || (this.isOrganizationSide && this.isNavigatedFromCandidateProfile);
  }

  private disableEdit(item: CandidateCredential): boolean {
    return !this.areAgencyActionsAllowed || item.id === this.orderCredentialId
      || ((item.status === this.statusEnum.Reviewed || item.status === this.statusEnum.Verified) && !this.isOrganizationSide)
      || (this.isOrganizationSide && this.isNavigatedFromCandidateProfile);
  }

  private disableDelete(item: CandidateCredential): boolean {
    return !this.areAgencyActionsAllowed || item.id === this.orderCredentialId
      || !this.hasPermissions()
      || (this.isOrganizationSide && this.isNavigatedFromCandidateProfile);
  }

  private setExistingFiles(credentialFiles: CredentialFile[] = []): void {
    if (credentialFiles.length) {
      this.existingFiles = [this.credentialGridService.getExistingFile(credentialFiles[0])];
      this.hideFileSize = true;
    }
  }

  private hasPermissions(): boolean {
    return this.userPermission[this.userPermissions.CanEditCandidateCredentials]
      || this.userPermission[this.userPermissions.ManageCredentialWithinOrderScope];
  }
}
