import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter } from '@angular/core';

import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { UserState } from 'src/app/store/user.state';
import {
  GetCredentialFiles,
  GetCredentialFilesSucceeded,
  GetGroupedCredentialsFiles,
} from '@agency/store/candidate.actions';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { CredentialFile } from '@shared/models/candidate-credential.model';

import {
  EmployeeCredentialsPage,
  EmployeeCredentialsRequestParams,
  PageSettings,
} from '../../interfaces/employee-credentials-dto.interface';
import { EmployeeCredentialsService } from '../../services/employee-credentials.service';
import { CredentialsPageSettings } from '../../constants';

@Component({
  selector: 'app-employee-credentials-container',
  templateUrl: './employee-credentials-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeCredentialsContainerComponent extends Destroyable implements OnInit {
  credentialsPage: EmployeeCredentialsPage;

  readonly employeeId = this.store.selectSnapshot(UserState.user)?.candidateProfileId as number;

  openFileViewerDialog = new EventEmitter<number>();

  private file: CredentialFile | null;

  constructor(
    private credentialsService: EmployeeCredentialsService,
    private cdr: ChangeDetectorRef,
    private actions$: Actions,
    private store: Store,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getEmployeeCredentials(CredentialsPageSettings);
    this.watchForFilesActions();
  }

  getEmployeeCredentials(pageSettings: PageSettings): void {
    const params: EmployeeCredentialsRequestParams = {
      ...pageSettings,
      candidateProfileId: this.employeeId,
    };

    this.credentialsService.getEmployeeCredentials(params)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((data: EmployeeCredentialsPage) => {
        this.credentialsPage = data;
        this.cdr.markForCheck();
      });
  }

  viewFiles(id: number): void {
    this.store
      .dispatch(new GetGroupedCredentialsFiles(this.employeeId))
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.openFileViewerDialog.emit(id);
        this.cdr.markForCheck();
      });
  }

  downloadCredentialFile(file: CredentialFile): void {
    this.file = file;
    this.store.dispatch(new GetCredentialFiles(this.file.id));
  }

  private watchForFilesActions(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(GetCredentialFilesSucceeded),
        takeUntil(this.componentDestroy())
      )
      .subscribe((files: { payload: Blob }) => {
        if (this.file) {
          downloadBlobFile(files.payload, this.file.name);
          this.file = null;
        }
      });
  }
}
