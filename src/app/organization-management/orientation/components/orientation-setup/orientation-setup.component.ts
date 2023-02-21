import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TakeUntilDestroy } from '@core/decorators';
import { Select, Store } from '@ngxs/store';
import { OrientationTypeDataSource } from '@organization-management/orientation/enums/orientation-type.enum';
import { OrientationService } from '@organization-management/orientation/services/orientation.service';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, takeUntil } from 'rxjs';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-orientation-setup',
  templateUrl: './orientation-setup.component.html',
  styleUrls: ['./orientation-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@TakeUntilDestroy
export class OrientationSetupComponent extends AbstractPermissionGrid implements OnInit {

  public orientationTypeSettingsForm: FormGroup = new FormGroup({
    isEnabled: new FormControl(false),
    type: new FormControl(null, [Validators.required])
  });
  public fields: FieldSettingsModel = { text: 'text', value: 'id' };
  public orientationTypeDataSource = OrientationTypeDataSource;

  public switcherValue = 'Off';
  public settingIsOff = true;

  protected componentDestroy: () => Observable<unknown>;

  @Select(UserState.lastSelectedOrganizationId)
  public readonly organizationId$: Observable<number>;
  
  constructor(
    protected override store: Store,
    private cd: ChangeDetectorRef,
    private orientationService: OrientationService
  ) {
    super(store);
    this.subscribeOnFormChange();
    this.dropdownHandler();
    this.watchForOrgChange();
  }

  private watchForOrgChange(): void {
    this.organizationId$
    .pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.getOrientationSettings();
      //this.clearFilterForm();
    });
  }

  private getOrientationSettings(): void {
    this.orientationService.getOrientationSetting().subscribe(setting => {
      if (setting) {
        this.orientationTypeSettingsForm.patchValue(setting);
      } else {
        this.orientationTypeSettingsForm.reset();
      }
    });
  }

  private saveOrientationSettings(): void {
    const { isEnabled, type } = this.orientationTypeSettingsForm.getRawValue();
    this.orientationService.saveOrientationSetting({ isEnabled, type }).subscribe(() => {
      this.orientationTypeSettingsForm.markAsPristine();
      this.cd.markForCheck();
    });
  }

  private dropdownHandler(): void {
    if (this.settingIsOff) {
      this.orientationTypeSettingsForm.controls['type'].disable();
    } else {
      this.orientationTypeSettingsForm.controls['type'].enable();
    }
  }

  public subscribeOnFormChange(): void {
    this.orientationTypeSettingsForm.controls['isEnabled'].valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((val) => {
      this.switcherValue = val ? 'On' : 'Off';
      this.settingIsOff = !val;
      this.dropdownHandler();
      this.cd.markForCheck();
    });
    this.orientationTypeSettingsForm.controls['type'].valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((val) => {
      this.cd.markForCheck();
    });
  }

  public saveOrientationSettingsHandler(): void {
    if (this.orientationTypeSettingsForm.invalid) {
      this.orientationTypeSettingsForm.markAllAsTouched();
    } else {
      this.saveOrientationSettings();
    }
  }
  
}
