import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { delay, filter, Observable, Subject, takeUntil } from 'rxjs';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { User } from '@shared/models/user-managment-page.model';
import {
  Organisation,
  Region,
  Location,
  Department,
  UserVisibilitySetting,
  VisibilitySettingControls,
} from '@shared/models/visibility-settings.model';
import {
  GetOrganizationsStructureAll,
  SaveUserVisibilitySettings,
  SaveUserVisibilitySettingsSucceeded,
} from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-add-edit-visibility',
  templateUrl: './add-edit-visibility.component.html',
  styleUrls: ['./add-edit-visibility.component.scss'],
})
export class AddEditVisibilityComponent extends DestroyableDirective implements OnInit, OnDestroy {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('regionMultiselect') regionMultiselect: MultiSelectComponent;

  @Input() openEvent: Subject<UserVisibilitySetting | null>;

  @Input() set user(user: User | null) {
    this.isOrganisationUser = user?.businessUnitType === BusinessUnitType.Organization;
    this.createdUser = user;
  }

  public isOrganisationUser = false;
  public createdUser: User | null;
  public width = '434px';
  public title = '';
  public targetElement: HTMLElement = document.body;
  public form: FormGroup;
  public optionFields = { text: 'name', value: 'uniqId' };
  public organisationFields = { text: 'name', value: 'organizationId' };
  public organisations: Organisation[];
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public showForm: boolean;

  private editVisibility: UserVisibilitySetting | null;
  private readonly allOrganisationId = -1;

  @Select(SecurityState.organisations)
  organizations$: Observable<Organisation[]>;

  get organisationsControl(): AbstractControl {
    return this.form.get('organisationIds')!;
  }

  get regionsControl(): AbstractControl {
    return this.form.get('regionIds')!;
  }

  get locationsControl(): AbstractControl {
    return this.form.get('locationIds')!;
  }

  get departmentsControl(): AbstractControl {
    return this.form.get('departmentIds')!;
  }

  constructor(private store: Store, private actions$: Actions, private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
    this.createVisibilityForm();
    this.onOrganizationControlChanges();
    this.onRegionsControlChanges();
    this.onLocationControlChanges();
    this.subscribeOnOrganizations();
    this.subscribeOnSaveUserVisibilitySettings();
  }

  public onFormSaveClick(): void {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      const value = this.form.getRawValue();
      this.store.dispatch(
        new SaveUserVisibilitySettings({
          regionIds: value.regionIds.length === this.regions.length ? [] : value.regionIds,
          locationIds: value.locationIds.length === this.locations.length ? [] : value.locationIds,
          departmentIds: value.departmentIds.length === this.departments.length ? [] : value.departmentIds,
          organisationIds: value.organisationIds === this.allOrganisationId ? [] : [value.organisationIds],
          userId: this.createdUser?.id as string,
          id: (this.editVisibility?.id as number) || null,
        })
      );
    }
  }

  public onFormCancelClick(): void {
    if (this.form.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  private subscribeOnOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.showForm = true;
      this.store.dispatch(new GetOrganizationsStructureAll(this.createdUser?.id as string)).subscribe(() => {
        if (data) {
          this.title = 'Edit';
          this.editVisibility = { ...data };
          this.organisationsControl?.setValue(
            this.editVisibility.organizationId === null ? this.allOrganisationId : this.editVisibility.organizationId
          );
        } else {
          this.title = 'Add';
          if (this.isOrganisationUser) {
            this.organisationsControl?.setValue(this.organisations[0].organizationId);
          }
        }

        this.sideDialog.show();
      });
    });
  }

  private createVisibilityForm(): void {
    this.form = new FormGroup({
      organisationIds: new FormControl('', [Validators.required]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentIds: new FormControl([]),
    });
  }

  private onOrganizationControlChanges(): void {
    this.organisationsControl?.valueChanges.pipe(delay(100), takeUntil(this.destroy$)).subscribe((value: number) => {
      if (value || value === null) {
        this.regionMultiselect.refresh();
        const selectedOrganisation = this.organisations.find(
          (organisation: Organisation) => organisation.organizationId === value
        );
        let regionsList: Region[] = [];

        if (selectedOrganisation?.organizationId === this.allOrganisationId) {
          this.organisations.forEach((organisation: Organisation) => {
            const filteredRegions = this.getFilteredControlValues(
              organisation.regions,
              'organisationName',
              selectedOrganisation
            );
            regionsList = [...regionsList, ...filteredRegions] as Region[];
          });
        } else {
          const filteredRegions = this.getFilteredControlValues(
            selectedOrganisation?.regions!,
            'organisationName',
            selectedOrganisation!
          );
          regionsList = [...regionsList, ...filteredRegions] as Region[];
        }

        this.regions = [...regionsList];
        this.setControlValue(this.regionsControl as FormControl, this.regions, this.editVisibility?.regionId);
      } else {
        this.regionsControl?.setValue([]);
        this.regions = [];
      }
      this.form.markAsUntouched();
    });
  }

  private onRegionsControlChanges(): void {
    this.regionsControl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((values: string[]) => {
      if (values?.length) {
        const controlValues = this.mapCorrectControlValueIds(values);

        let selectedRegions: Region[] = this.getSelectedFilteredValues(this.regions, controlValues) as Region[];
        let locations: Location[] = [];

        selectedRegions.forEach((region: Region) => {
          const filteredLocation = this.getFilteredControlValues(region.locations, 'locationName', region);
          locations = [...locations, ...filteredLocation] as Location[];
        });
        this.locations = [...locations];
        this.setControlValue(this.locationsControl as FormControl, this.locations, this.editVisibility?.locationId);
      } else {
        this.locationsControl?.setValue([]);
        this.locations = [];
      }
      this.form.markAsUntouched();
    });
  }

  private onLocationControlChanges(): void {
    this.locationsControl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((values: string[]) => {
      if (values?.length) {
        const controlValues = this.mapCorrectControlValueIds(values);
        let selectedLocations: Location[] = this.getSelectedFilteredValues(this.locations, controlValues) as Location[];
        let departments: Department[] = [];

        selectedLocations.forEach((location: Location) => {
          const filteredDepartments = this.getFilteredControlValues(location.departments, 'locationName', location);
          departments = [...departments, ...filteredDepartments] as Department[];
        });

        this.departments = [...departments];
        this.setControlValue(
          this.departmentsControl as FormControl,
          this.departments,
          this.editVisibility?.departmentId
        );
      } else {
        this.departmentsControl?.setValue([]);
        this.departments = [];
      }
      this.form.markAsUntouched();
    });
  }

  private getSelectedFilteredValues(
    selectedValues: VisibilitySettingControls[],
    valuesIds: number[]
  ): VisibilitySettingControls[] {
    return selectedValues.filter((selectedValue: VisibilitySettingControls) =>
      valuesIds.includes(selectedValue.id as number)
    );
  }

  private mapCorrectControlValueIds(values: string[]): number[] {
    return [...values].map((id: string) => +id.split('-')[1]);
  }

  private getFilteredControlValues(
    values: VisibilitySettingControls[],
    option: string,
    selectedValue: VisibilitySettingControls
  ): VisibilitySettingControls[] {
    return this.createUniqId(values).map((value: VisibilitySettingControls) => ({
      ...value,
      [option]: selectedValue.name,
    }));
  }

  private createUniqId(values: VisibilitySettingControls[]): VisibilitySettingControls[] {
    return values.map((value: VisibilitySettingControls) => ({
      ...value,
      uniqId: `${value.organizationId}-${value.id}`,
    }));
  }

  private setControlValue(control: FormControl, controlDataSource: any[], value?: number): void {
    if (!!value || value === null) {
      control.setValue(controlDataSource.map((item) => item.uniqId));
      return;
    }

    control.setValue(value ? [value] : []);
  }

  private subscribeOnSaveUserVisibilitySettings(): void {
    this.actions$
      .pipe(ofActionSuccessful(SaveUserVisibilitySettingsSucceeded), takeUntil(this.destroy$))
      .subscribe(() => this.closeDialog());
  }

  private subscribeOnOrganizations(): void {
    this.organizations$.pipe(takeUntil(this.destroy$)).subscribe((organisations: Organisation[]) => {
      this.organisations =
        this.isOrganisationUser || organisations.length < 2
          ? [...organisations]
          : [{ name: 'All', organizationId: this.allOrganisationId, regions: [] }, ...organisations];
    });
  }

  private closeDialog(): void {
    this.sideDialog.hide();
    this.editVisibility = null;
    this.form.reset();
    this.showForm = false;
  }
}
