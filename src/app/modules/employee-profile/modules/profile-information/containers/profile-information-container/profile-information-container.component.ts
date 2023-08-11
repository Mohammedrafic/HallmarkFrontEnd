import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { Store } from '@ngxs/store';
import { takeUntil, zip } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { DropdownOption } from '@core/interface';
import { UserState } from 'src/app/store/user.state';

import { EmployeeDTO, EmployeeProfileData } from '../../interfaces';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-information-container',
  templateUrl: './profile-information-container.component.html',
  styleUrls: ['./profile-information-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInformationContainerComponent extends Destroyable implements OnInit {

  employeeProfileData: EmployeeProfileData;
  photo: Blob;

  private readonly employeeId = this.store.selectSnapshot(UserState.user)?.candidateProfileId as number;

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private store: Store,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getEmployeeProfileData();
    this.getEmployeePhoto();
  }

  private getEmployeeProfileData(): void {
    zip(
      this.profileService.getEmployee(this.employeeId),
      this.profileService.getAssignedSkills(),
      this.profileService.getStates(),
    )
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(([employeeDTO, skills, states]: [EmployeeDTO, DropdownOption[], string[]]) => {
        this.employeeProfileData = {
          countries: this.profileService.getCountries(),
          states,
          employeeDTO,
          skills,
        };
        this.cdr.markForCheck();
      });
  }

  private getEmployeePhoto(): void {
    this.profileService.getEmployeePhoto(this.employeeId)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((value: Blob) => {
        this.photo = value;
        this.cdr.markForCheck();
      });
  }
}
