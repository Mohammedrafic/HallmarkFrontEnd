import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { UserState } from 'src/app/store/user.state';

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

  private readonly employeeId = this.store.selectSnapshot(UserState.user)?.candidateProfileId as number;

  constructor(
    private credentialsService: EmployeeCredentialsService,
    private cdr: ChangeDetectorRef,
    private store: Store,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getEmployeeCredentials(CredentialsPageSettings);
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
}
