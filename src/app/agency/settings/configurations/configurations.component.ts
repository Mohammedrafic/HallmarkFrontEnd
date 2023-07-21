import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { distinctUntilChanged, filter, Observable, Subject, take, takeUntil } from 'rxjs';

import { OutsideZone } from '@core/decorators';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { OrganizationSettingControlType } from '@shared/enums/organization-setting-control-type';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import {
  ConfigurationChild,
  Configuration,
  ConfigurationDTO,
} from '@shared/models/organization-settings.model';
import { ConfirmService } from '@shared/services/confirm.service';

import {
  SettingsAppliedToPermissions,
} from './configurations.constant';
import { UserState } from 'src/app/store/user.state';
import { SettingsDataAdapter } from '@shared/helpers/settings-data.adapter';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { ConfigurationsService } from './services/configurations.service';
import { UserPermissions } from '@core/enums';
import { CurrentUserPermission } from '@shared/models/permission.model';

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss'],
})
export class ConfigurationsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  @Select(UserState.currentUserPermissions)
  currentUserPermissions$: Observable<CurrentUserPermission[]>;

  readonly configurationControlType = OrganizationSettingControlType;
  public configurationFormGroup: FormGroup;

  public isFormShown = false;
  public hasPermissions: Record<string, boolean> = {};
  public dialogHeader = 'Edit Configurations';

  private readonly settingsAppliedToPermissions = SettingsAppliedToPermissions;
  private organizationHierarchy: number;
  private organizationHierarchyId: number;
  private dataSource: Configuration[];
  public configurations: Configuration[] = [];
  private unsubscribe$: Subject<void> = new Subject();
  get switcherValue(): string {
    return this.configurationFormGroup.controls['value'].value ? 'on' : 'off';
  }

  constructor(
    protected override store: Store,
    private formBuilder: FormBuilder,
    private confirmService: ConfirmService,
    private configurationsService: ConfigurationsService,
    private readonly ngZone: NgZone,
  ) {
    super(store);
    this.createSettingsForm();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForOrgId();
    this.subscribeOnPermissions();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  openEditSettingDialog(
    data: {
      parentRecord: Configuration,
      childRecord: ConfigurationChild | undefined,
      event: MouseEvent
    }
  ): void {
    const {parentRecord, childRecord, event} = data;
    this.isFormShown = true;
    this.addActiveCssClass(event);
    this.setFormValuesForEdit(parentRecord, childRecord || null);
    this.store.dispatch(new ShowSideDialog(true));
  }

  cancelSettingChanges(): void {
    if (
      this.configurationFormGroup.dirty
    ) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm: boolean) => confirm),
          take(1)
        ).subscribe(() => {
          this.closeSettingDialog();
        });
    } else {
      this.closeSettingDialog();
    }
  }

  public saveSetting(): void {
    if (this.configurationFormGroup.valid) {
      this.sendForm();
    } else {
      this.configurationFormGroup.markAllAsTouched();
    }
  }

  private subscribeOnPermissions(): void {
    this.getPermissionStream()
      .pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        this.setPermissionsToManageSettings();
      });
  }

  private getConfigurations(): void {
    this.configurationsService.getAllConfigurations()
      .pipe(
        takeUntil(this.unsubscribe$),
      )
      .subscribe((data: Configuration[]) => {
        this.configurations = data;
        const settingData = this.getRowsPerPage(data, this.currentPagerPage);
        this.gridDataSource = settingData;
        this.totalDataRecords = data.length;
        this.dataSource = data;
      });
  }

  private sendForm(): void {
    const dynamicValue = this.configurationFormGroup.controls['value'].value
          ? this.configurationFormGroup.controls['value'].value.toString()
          : 'false';

    const setting: ConfigurationDTO = {
      settingValueId: this.configurationFormGroup.controls['settingValueId'].value,
      settingKey: this.configurationFormGroup.controls['settingKey'].value,
      hierarchyId: this.organizationHierarchyId,
      hierarchyLevel: this.organizationHierarchy,
      value: dynamicValue,
    };

    this.configurationsService.saveConfiguration(setting).subscribe(() => {
      this.store.dispatch(new ShowSideDialog(false));
      this.removeActiveCssClass();
      this.clearFormDetails();
      this.isFormShown = false;
      this.getConfigurations();
    });
  }

  private setFormValuesForEdit(parentData: Configuration, childData: ConfigurationChild | null): void {
    const parentDataValue = SettingsDataAdapter.getParentSettingValue(parentData, false);
    const dynamicValue = parentDataValue === 'true';
    this.updateFormOutsideZone(parentData, childData, dynamicValue);
  }

  private clearFormDetails(): void {
    this.configurationFormGroup.reset();
  }

  private createSettingsForm(): void {
    this.configurationFormGroup = this.formBuilder.group({
      settingValueId: [null],
      settingKey: [null],
      controlType: [null],
      name: [{ value: '', disabled: true }],
      value: [null],
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(data: Configuration[], currentPage: number): Configuration[] {
    return data.slice(
      currentPage * this.getActiveRowsPerPage() - this.getActiveRowsPerPage(),
      currentPage * this.getActiveRowsPerPage()
    );
  }

  private setPermissionsToManageSettings(): void {
    this.settingsAppliedToPermissions.forEach((key) => {
      this.hasPermissions[key] = this.userPermission[UserPermissions.CanEditAgencySettings];
    });
  }

  private watchForOrgId(): void {
    this.lastSelectedAgencyId$.pipe(
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.getConfigurations();
    });
  }

  private closeSettingDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.removeActiveCssClass();
    this.clearFormDetails();
    this.isFormShown = false;
  }

  @OutsideZone
  private updateFormOutsideZone(
    parentData: Configuration,
    childData: ConfigurationChild | null,
    dynamicValue: boolean,
  ): void {
    setTimeout(() => {
      this.configurationFormGroup.setValue({
        settingValueId: null,
        settingKey: parentData.settingKey,
        controlType: parentData.controlType,
        name: parentData.name,
        value: dynamicValue,
      });
    });
  }
}
