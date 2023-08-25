import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OutsideZone } from '@core/decorators';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FileInfo, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { debounceTime, delay, filter, merge, Observable, Subject, takeUntil, combineLatest, EMPTY } from 'rxjs';

import { CustomFormGroup, Permission } from '@core/interface';
import { FileSize, UserPermissions } from '@core/enums';
import { DateTimeHelper } from '@core/helpers';
import {
  ClearCandidatesCredentials,
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
  VerifyCandidatesCredentials,
  VerifyCandidatesCredentialsFailed,
  VerifyCandidatesCredentialsSucceeded,
} from '@agency/store/candidate.actions';
import { CandidateState } from '@agency/store/candidate.state';
import { CredentialGridService } from '@agency/services/credential-grid.service';
import { AbstractGridConfigurationComponent } from
  '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, RECORD_ADDED, RECORD_MODIFIED } from
  '@shared/constants/messages';
import { optionFields } from '@shared/constants';
import { FileStatusCode } from '@shared/enums/file.enum';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { MessageTypes } from '@shared/enums/message-types';
import { CredentialStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';
import {
  CandidateCredential,
  CandidateCredentialGridItem,
  CandidateCredentialResponse,
  CredentialFile,
  CredentialRequestParams,
} from '@shared/models/candidate-credential.model';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
  AllowedCredentialFileExtensions,
  CredentialSelectionSettingsModel,
  DisableEditMessage,
  StatusFieldSettingsModel,
} from './credentials-grid.constants';
import { AddCredentialForm, CredentialFiles, SearchCredentialForm } from './credentials-grid.interface';
import { AppState } from '../../../store/app.state';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { CandidateService } from '@agency/services/candidates.service';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';

@Component({
  selector: 'app-credentials-grid',
  templateUrl: './credentials-grid.component.html',
  styleUrls: ['./credentials-grid.component.scss'],
  providers: [MaskedDateTimeService],
})
// TODO: the component is reused, all logic needs to be rewritten
export class CredentialsGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() isNavigatedFromOrganizationArea: boolean;
  @Input() orderId: number | null;
  @Input() areAgencyActionsAllowed: boolean;
  @Input() isCandidateAssigned = false;
  @Input() userPermission: Permission;
  @Input() employee: string | null;
  @Input() isIRP = false;
  @Input() isActive = true;
  @Input() isMobileLoginOn = false;
  @Input() set employeeId(value: number | null | undefined) {
    if (value) {
      this.candidateProfileId = value;
    }
  }

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
  public disableAddCredentialButton: boolean;
  public requiredCertifiedFields: boolean;
  public credentialStatusOptions: FieldSettingsModel[] = [];
  public existingFiles: CredentialFiles[] = [];
  public isOrganizationAgencyArea: IsOrganizationAgencyAreaStateModel;

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private masterCredentialId: number | null;
  private credentialId: number | null;
  private credentialStatus = CredentialStatus.Pending;
  private removeExistingFiles = false;
  private file: CredentialFile | null;
  private candidateProfileId: number;
  private credentialType: CredentialType;
  private isOrgOnlyIRPEnabled:boolean=false;
  private isOrgVMSEnabled:boolean=false;

  @Select(CandidateState.candidateCredential)
  candidateCredential$: Observable<CandidateCredentialResponse>;

  @Select(CandidateState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  @Select(CandidateState.masterCredentials)
  masterCredentials$: Observable<Credential[]>;

  @Select(AppState.isOrganizationAgencyArea)
  isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  @Select(AppState.isMobileScreen)
  public readonly isMobile$: Observable<boolean>;

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
    return `${this.isAllRowsSelected ? 'All' : this.selectedItems.length} ${
      this.selectedItems.length === 1 ? 'Row' : 'Rows'
    } Selected`;
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

  private get organizatonId(): number | null {
    return this.isOrganizationSide ? this.store.selectSnapshot(UserState.lastSelectedOrganizationId) : null;
  }

  private get createdOnControl(): AbstractControl | null {
    return this.addCredentialForm.get('createdOn');
  }

  private get createdUntilControl(): AbstractControl | null {
    return this.addCredentialForm.get('createdUntil');
  }

  private get credentialRequestParams(): CredentialRequestParams {
    return this.credentialGridService.getCredentialRequestParams(
      this.currentPage,
      this.pageSize,
      this.orderId,
      this.organizatonId,
      this.candidateProfileId
    );
  }

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private actions$: Actions,
    private credentialGridService: CredentialGridService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef,
    private candidateService: CandidateService,
    private ngZone: NgZone,
  ) {
    super();
    this.candidateProfileId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCandidatesCredentialByPage(this.credentialRequestParams, this.candidateProfileId));
    this.store.dispatch(new GetCredentialTypes());
    this.addCredentialForm = this.credentialGridService.createAddCredentialForm();
    this.searchCredentialForm = this.credentialGridService.createSearchCredentialForm();
    this.watchForPageChanges();
    this.watchForCandidateActions();
    this.watchForCredentialStatuses();
    this.watchForSearchUpdate();
    this.watchForCandidateCredential();
    this.watchForDownloadCredentialFiles();
    this.watchWorkingArea();
    this.watchForCertifiedOnUntilControls();
    this.getOrganizationSettings();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearCandidatesCredentials());
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
    this.store.dispatch(new GetCredentialStatuses(this.isOrganizationSide, this.orderId || null));
    this.store.dispatch(new GetMasterCredentials('', '', this.orderId, this.isIRP));

    this.store
      .dispatch(new ShowSideDialog(true))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.setDropElement();
        this.setDefaultStatusValue();
      });
  }

  public dataBound(): void {
    this.contentLoadedHandler(this.cdr);
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
      this.addCredentialForm.markAllAsTouched();
    }
  }
  public verifyCredentials(): void {
    const rowsWithFiles = this.selectedItems;

    if (rowsWithFiles.length>0) {
     var list= rowsWithFiles.map((cred)=>this.mapCredential(cred));
     var request={candidateCredentials:list};
     this.store.dispatch(
      new VerifyCandidatesCredentials(request)
    );

    }

  }
  public mapCredential(cred:CandidateCredential):CandidateCredential
  {
    if (cred.masterCredentialId) {
      cred.status=CredentialStatus.Verified;
      if (cred.createdOn != null) {
        cred.createdOn = DateTimeHelper.setUtcTimeZone(cred.createdOn);
      }

      if (cred.createdUntil != null) {
        cred.createdUntil = DateTimeHelper.setUtcTimeZone(cred.createdUntil);
      }

      cred.orderId= this.orderId;

    }
    return cred;
  }

  public selectRowsPerPage(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public selectPage(page: number): void {
    this.pageSubject.next(page);
  }

  public copyCredential(event: MouseEvent, data: CandidateCredential) {
    event.stopPropagation();
    this.disabledCopy = true;
    this.masterCredentialId = data.masterCredentialId;
    this.credentialType = data.credentialType as CredentialType;
    this.saveCredential({
      ...data,
      status: CredentialStatus.Pending,
      completedDate: null,
    });
  }

  public viewFiles(event: MouseEvent, id: number) {
    event.stopPropagation();
    this.store
      .dispatch(new GetGroupedCredentialsFiles(this.candidateProfileId))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.openFileViewerDialog.emit(id);
        this.cdr.markForCheck();
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
      credentialTypeId,
      credentialTypeName,
      masterName,
      rejectReason,
    }: CandidateCredential
  ) {
    event.stopPropagation();
    this.checkCertifiedFields(!!expireDateApplicable);
    this.credentialId = id as number;
    this.credentialStatus = status as CredentialStatus;
    this.masterCredentialId = masterCredentialId;
    this.credentialType = { id: credentialTypeId, name: credentialTypeName as string };
    this.setExistingFiles(credentialFiles);

    this.store.dispatch(
      new GetCredentialStatuses(
        this.isOrganizationSide ?? true,
        this.orderId || null,
        status as CredentialStatus,
        id as number
      )
    );

    this.store
      .dispatch(new ShowSideDialog(true))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.setDropElement();
      });

    this.searchCredentialForm.patchValue({
      searchTerm: masterName,
      credentialTypeId: credentialTypeName,
    });

    this.addCredentialForm.patchValue({
      insitute,
      createdOn: createdOn && DateTimeHelper.setCurrentTimeZone(createdOn.toString()),
      number,
      experience,
      createdUntil: createdUntil && DateTimeHelper.setCurrentTimeZone(createdUntil.toString()),
      completedDate,
      rejectReason,
    });
  }

  public clearFiles(): void {
    this.removeExistingFiles = !!this.existingFiles.length;
    this.existingFiles = [];
    this.uploadObj.clearAll();
  }

  public selectCredentialFile(event: SelectedEventArgs): void {
    this.removeExistingFiles = false;
    this.existingFiles = [];

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
      this.store.dispatch(new DownloadCredentialFiles(this.candidateProfileId, fileIds, this.employee!));
    }
  }

  public selectMasterCredentialId(event: { data: Credential }): void {
    const { id, credentialTypeId, credentialTypeName } = event.data;

    this.masterCredentialId = id as number;
    this.credentialType = { id: credentialTypeId, name: credentialTypeName as string };
    this.checkCertifiedFields(event.data.expireDateApplicable);
  }

  public clearMasterCredentialId(): void {
    this.masterCredentialId = null;
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find((item) => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  public addMissingCredentials(): void {
    this.candidateService.getMissingCredentials(this.candidateProfileId).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.store.dispatch(new GetCandidatesCredentialByPage(this.credentialRequestParams, this.candidateProfileId));
    });
  }

  private closeSideDialog(): void {
    this.store
      .dispatch(new ShowSideDialog(false))
      .pipe(delay(500), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.addCredentialForm.reset();
        this.addCredentialForm.enable();
        this.searchCredentialForm.reset();
        this.addCredentialForm.markAsPristine();
        this.credentialId = null;
        this.credentialStatus = CredentialStatus.Pending;
        this.masterCredentialId = null;
        this.removeExistingFiles = false;
        this.credentialType = {} as CredentialType;
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
    completedDate,
    rejectReason,
  }: CandidateCredential): void {
    if (this.masterCredentialId) {
      if (createdOn) {
        createdOn = DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(createdOn));
      }

      if (createdUntil) {
        createdUntil = DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(createdUntil));
      }

      if (this.isOrganizationAgencyArea.isAgencyArea) {
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
            organizationId: this.organizatonId,
          })
        );
      } else {
        this.store.dispatch(
          new SaveCandidatesCredential({
            candidateProfileId: this.candidateProfileId,
            masterCredentialId: this.masterCredentialId,
            id: this.credentialId as number,
            status,
            rejectReason,
            credentialNumber: number,
            certifiedOn: createdOn,
            certifiedUntil: createdUntil,
            completedDate,
            credentialType: this.credentialType,
          })
        );
      }
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
          new GetMasterCredentials(
            this.searchTermControl?.value || '',
            this.credentialTypeIdControl?.value || '',
            this.orderId,
            this.isIRP,
          )
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
        uploaderErrorMessageElement.innerText =
          file.size > this.maxFileSize
            ? 'The file should not exceed 20MB.'
            : 'The file should be in pdf, jpg, jpeg, png format.';
      }
    });
  }

  private watchForCandidateCredential(): void {
    this.candidateCredential$
    .pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    )
    .subscribe((response: CandidateCredentialResponse) => {
      this.candidateCredentialResponse = response;
      this.setDisableAddCredentialButton();
      this.setGridItems(response);
      this.cdr.markForCheck();
    });
  }

  private setDefaultStatusValue(): void {
    this.statusControl?.setValue(CredentialStatus.Pending);
  }

  private watchForDownloadCredentialFiles(): void {
    this.actions$
      .pipe(ofActionSuccessful(DownloadCredentialFilesSucceeded), takeUntil(this.unsubscribe$))
      .subscribe((payload: { file: Blob; candidateName: string }) => {
        let dateTime = DateTimeHelper.formatDateUTC(DateTimeHelper.setUtcTimeZone(new Date()), 'MM/dd/YYYY HH:mm');
        dateTime=dateTime.replace(/[/: ]/g, '_');
        downloadBlobFile(payload.file, `${payload.candidateName} Credentials ${dateTime}.pdf`);
      });
  }

  private watchForPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1), takeUntil(this.unsubscribe$)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetCandidatesCredentialByPage(this.credentialRequestParams, this.candidateProfileId));
    });
  }

  private watchForCandidateActions(): void {
    this.actions$
      .pipe(ofActionSuccessful(SaveCandidatesCredentialSucceeded), takeUntil(this.unsubscribe$))
      .subscribe((credential: { payload: CandidateCredential }) => {
        const isEdit = this.isEdit;
        this.credentialId = credential.payload.id as number;
        this.disabledCopy = false;
        this.selectedItems = [];
        if (this.uploadObj.filesData[0]?.statusCode === FileStatusCode.Valid) {
          this.store.dispatch(
            new UploadCredentialFiles([this.uploadObj.filesData[0].rawFile as Blob], this.credentialId)
          );
          return;
        }

        if (this.removeExistingFiles) {
          this.store.dispatch(new UploadCredentialFiles([], this.credentialId));
          return;
        }

        this.store.dispatch(new ShowToast(MessageTypes.Success, !isEdit ? RECORD_ADDED : RECORD_MODIFIED));
        this.store.dispatch(new GetCandidatesCredentialByPage(this.credentialRequestParams, this.candidateProfileId));
        this.addCredentialForm.markAsPristine();
        this.closeDialog();
      });

    this.actions$
      .pipe(ofActionSuccessful(SaveCandidatesCredentialFailed), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.disabledCopy = false;
      });
    this.actions$
      .pipe(ofActionSuccessful(UploadCredentialFilesSucceeded), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.store.dispatch(new GetCandidatesCredentialByPage(this.credentialRequestParams, this.candidateProfileId));
        this.addCredentialForm.markAsPristine();
        this.closeDialog();
      });
    this.actions$
      .pipe(ofActionSuccessful(RemoveCandidatesCredentialSucceeded), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.store.dispatch(new GetCandidatesCredentialByPage(this.credentialRequestParams, this.candidateProfileId));
      });
    this.actions$
      .pipe(ofActionSuccessful(GetCredentialFilesSucceeded), takeUntil(this.unsubscribe$))
      .subscribe((files: { payload: Blob }) => {
        if (this.file) {
          downloadBlobFile(files.payload, this.file.name);
          this.file = null;
        }
      });
    this.actions$
      .pipe(ofActionSuccessful(VerifyCandidatesCredentialsSucceeded), takeUntil(this.unsubscribe$))
      .subscribe((credential: { payload: CandidateCredential[] }) => {
        this.selectedItems = [];
        this.store.dispatch(new GetCandidatesCredentialByPage(this.credentialRequestParams, this.candidateProfileId));
      });
    this.actions$
      .pipe(ofActionSuccessful(VerifyCandidatesCredentialsFailed), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.disabledCopy = false;
      });
  }

  private watchForCredentialStatuses(): void {
    this.actions$
      .pipe(ofActionSuccessful(GetCredentialStatusesSucceeded), takeUntil(this.unsubscribe$))
      .subscribe((payload: { statuses: CredentialStatus[] }) => {
        this.credentialStatusOptions = this.credentialGridService.getCredentialStatusOptions(payload.statuses, this.isIRP);
        this.addCredentialForm.patchValue({ status: this.credentialStatus });
      });
  }
  private getOrganizationSettings() {
    const id = this.store.selectSnapshot(UserState.user)?.businessUnitId as number;

    this.store.dispatch(new GetOrganizationById(id)).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      const { isIRPEnabled, isVMCEnabled } =
        this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};
        this.isOrgOnlyIRPEnabled=isIRPEnabled!&&!isVMCEnabled!;
        this.isOrgVMSEnabled=isVMCEnabled!;
    })
  }
  private setDisableAddCredentialButton(): void {
    this.disableAddCredentialButton =
      !this.areAgencyActionsAllowed
      || (this.isOrgVMSEnabled && !this.hasPermissions())
      || (this.isOrganizationSide && this.isNavigatedFromCandidateProfile && !this.isIRP)
      || (this.isOrgOnlyIRPEnabled && !this.userPermission[this.userPermissions.ManageIrpCandidateProfile]);
  }

  private setGridItems(response: CandidateCredentialResponse): void {
    this.gridItems = response?.credentials.items.map((item: CandidateCredential) => {
      return {
        ...item,
        credentialFile: item.credentialFiles?.length ? item.credentialFiles[0] : null,
        disableCopy: this.disableCopy(item),
        disableEdit: this.disableEdit(item),
        disableViewDocument:this.disableViewDocument(item),
        showDisableEditTooltip:
          (item.status === this.statusEnum.Reviewed) &&
          !this.isOrganizationSide,
        disableDelete: this.disableDelete(item),
        credentialTypeName: item.credentialType?.name,
        credentialTypeId: item.credentialType?.id,
      };
    });

    super.setHeightForMobileGrid(this.gridItems?.length);
  }
 private disableViewDocument(item:CandidateCredential):boolean{
  let length= item.credentialFiles==null?0:item.credentialFiles?.length;
  return length<=0;
 }
  private disableCopy(item: CandidateCredential): boolean {
    return (
      !this.areAgencyActionsAllowed
      || this.disabledCopy
      || item.id === this.orderCredentialId
      || !this.hasPermissions()
      || (this.isOrganizationSide && this.isNavigatedFromCandidateProfile && !this.isIRP)
      || (this.isIRP && !this.userPermission[this.userPermissions.ManageIrpCandidateProfile])
    );
  }

  private disableEdit(item: CandidateCredential): boolean {
    return (
      !this.areAgencyActionsAllowed
      || item.id === this.orderCredentialId
      || ((item.status === this.statusEnum.Reviewed) && !this.isOrganizationSide)
      || (this.isOrganizationSide && this.isNavigatedFromCandidateProfile && !this.isIRP)
      || (this.isIRP && !this.userPermission[this.userPermissions.ManageIrpCandidateProfile])
      );
  }

  private disableDelete(item: CandidateCredential): boolean {
    return (
      !this.areAgencyActionsAllowed
      || item.id === this.orderCredentialId
      || !this.hasPermissions()
      || (this.isOrganizationSide && this.isNavigatedFromCandidateProfile && !this.isIRP)
      || (this.isIRP && !this.userPermission[this.userPermissions.ManageIrpCandidateProfile])
    );
  }

  private setExistingFiles(credentialFiles: CredentialFile[] = []): void {
    if (credentialFiles.length) {
      this.existingFiles = [this.credentialGridService.getExistingFile(credentialFiles[0])];
    }
  }

  private hasPermissions(): boolean {
    return (
      this.userPermission[this.userPermissions.CanEditCandidateCredentials] ||
      this.userPermission[this.userPermissions.ManageCredentialWithinOrderScope]
    );
  }

  private checkCertifiedFields(expireDateApplicable: boolean): void {
    this.requiredCertifiedFields = expireDateApplicable;

    if (this.requiredCertifiedFields) {
      this.createdOnControl?.setValidators([Validators.required]);
      this.createdUntilControl?.setValidators([Validators.required]);
    } else {
      this.createdOnControl?.setValidators([]);
      this.createdUntilControl?.setValidators([]);
      this.createdOnControl?.setValue(null);
      this.createdUntilControl?.setValue(null);
    }

    this.createdOnControl?.updateValueAndValidity();
    this.createdUntilControl?.updateValueAndValidity();
  }

  private watchWorkingArea(): void {
    this.isOrganizationAgencyArea$.pipe(takeUntil(this.unsubscribe$)).subscribe((area) => {
      this.isOrganizationAgencyArea = area;
    });
  }

  private watchForCertifiedOnUntilControls(): void {
    combineLatest([
      this.createdOnControl?.valueChanges || EMPTY,
      this.createdUntilControl?.valueChanges || EMPTY,
    ])
.pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.cdr.markForCheck());
  }
}
