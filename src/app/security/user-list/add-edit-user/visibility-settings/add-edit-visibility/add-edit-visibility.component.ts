import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from "@shared/constants";
import { ConfirmService } from "@shared/services/confirm.service";
import { MultiSelectComponent } from "@syncfusion/ej2-angular-dropdowns";
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { delay, filter, Observable, Subject, takeUntil } from "rxjs";

import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { User } from "@shared/models/user-managment-page.model";
import { Organisation, Region, Location, Department, UserVisibilitySetting } from "@shared/models/visibility-settings.model";
import {
  GetOrganizationsStructureAll,
  SaveUserVisibilitySettings,
  SaveUserVisibilitySettingsSucceeded
} from "src/app/security/store/security.actions";
import { SecurityState } from "src/app/security/store/security.state";

@Component({
  selector: 'app-add-edit-visibility',
  templateUrl: './add-edit-visibility.component.html',
  styleUrls: ['./add-edit-visibility.component.scss']
})
export class AddEditVisibilityComponent implements OnInit, OnDestroy {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('regionMultiselect') regionMultiselect: MultiSelectComponent;

  @Input() openEvent: Subject<UserVisibilitySetting | null>;

  @Input() set user (user: User | null) {
    this.isOrganisationUser = user?.businessUnitType === BusinessUnitType.Organization;
    this.createdUser = user;
  }

  public isOrganisationUser = false;
  public createdUser: User | null;
  public width = '434px';
  public title = '';
  public targetElement: HTMLElement = document.body;
  public form: FormGroup;
  public optionFields = { text: 'name', value: 'id' };
  public organisationFields = { text: 'name', value: 'organizationId' };
  public organisations: Organisation[];
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public showForm: boolean;

  private unsubscribe$: Subject<void> = new Subject();
  private editVisibility: UserVisibilitySetting | null;
  private readonly allOrganisationId = -1;

  @Select(SecurityState.organisations)
  organizations$: Observable<Organisation[]>;

  get organisationsControl() {
    return this.form.get('organisationIds');
  }

  get regionsControl() {
    return this.form.get('regionIds');
  }

  get locationsControl() {
    return this.form.get('locationIds');
  }

  get departmentsControl() {
    return this.form.get('departmentIds');
  }

  constructor(private store: Store,
              private actions$: Actions,
              private confirmService: ConfirmService) {}

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
    this.createVisibilityForm();
    this.subscribeOnFormValuesChanges();
    this.organizations$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(organisations => {
        this.organisations = this.isOrganisationUser || organisations.length < 2
          ? [...organisations]
          : [{ name: 'All', organizationId: this.allOrganisationId, regions: [] }, ...organisations];
      });
    this.actions$.pipe(ofActionSuccessful(SaveUserVisibilitySettingsSucceeded), takeUntil(this.unsubscribe$))
      .subscribe(() => this.closeDialog());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFormSaveClick(): void {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      const value = this.form.getRawValue();
      this.store.dispatch(new SaveUserVisibilitySettings({
        regionIds: value.regionIds.length === this.regions.length ? [] : value.regionIds,
        locationIds: value.locationIds.length === this.locations.length ? [] : value.locationIds,
        departmentIds: value.departmentIds.length === this.departments.length ? [] : value.departmentIds,
        organisationIds: value.organisationIds === this.allOrganisationId ? [] : [value.organisationIds],
        userId: this.createdUser?.id as string,
        id: this.editVisibility?.id as number || null
      }));
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
          this.closeDialog()
        });
    } else {
      this.closeDialog()
    }
  }

  private subscribeOnOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.showForm = true;
      this.store.dispatch(new GetOrganizationsStructureAll(this.createdUser?.id as string)).subscribe(() => {
        if (data) {
          this.title = 'Edit';
          this.editVisibility = { ...data };
          this.organisationsControl?.setValue(
            this.editVisibility.organizationId === null
              ? this.allOrganisationId
              : this.editVisibility.organizationId
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
      departmentIds: new FormControl([])
    });
  }

  private subscribeOnFormValuesChanges(): void {
    this.organisationsControl?.valueChanges.pipe(takeUntil(this.unsubscribe$), delay(100)).subscribe((value: number) => { // TODO: find better approach than delay
      this.regionMultiselect.refresh();
      if (value || value === null) {
        const selectedOrganisation: Organisation = this.organisations.find(org => org.organizationId === value) as Organisation;
        const regions: Region[] = [];

        if (value === null || selectedOrganisation?.organizationId === this.allOrganisationId ) {
          this.organisations.forEach(org => {
            org.regions?.forEach(region => region.organisationName = org.name);
            regions.push(...org.regions);
          });
        } else {
          selectedOrganisation.regions?.forEach(region => region.organisationName = selectedOrganisation.name);
          regions.push(...selectedOrganisation.regions);
        }

        this.regions = [...regions];
        this.setControlValue(this.regionsControl as FormControl, this.regions, this.editVisibility?.regionId);
      } else {
        this.regionsControl?.setValue([]);
        this.regions = [];
      }
      this.form.markAsUntouched();
    });

    this.regionsControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((values: number[]) => {
      if (values?.length) {
        const selectedRegions: Region[] = [];
        const locations: Location[] = [];
        this.regions.forEach(reg => {
          values.forEach(id => {
            if (reg.id === id) {
              selectedRegions.push(reg);
            }
          });
        });
        selectedRegions.forEach(reg => {
          reg.locations?.forEach(location => location.regionName = reg.name);
          locations.push(...reg.locations);
        });
        this.locations = [...locations];
        this.setControlValue(this.locationsControl as FormControl, this.locations, this.editVisibility?.locationId);
      } else {
        this.locationsControl?.setValue([]);
        this.locations = [];
      }
      this.form.markAsUntouched();
    });

    this.locationsControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((values: number[]) => {
      if (values?.length) {
        const selectedLocations: Location[] = [];
        const departments: Department[] = [];
        this.locations.forEach(loc => {
          values.forEach(id => {
            if (loc.id === id) {
              selectedLocations.push(loc);
            }
          });
        });
        selectedLocations.forEach(loc => {
          loc.departments?.forEach(location => location.locationName = loc.name);
          departments.push(...loc.departments);
        });
        this.departments = [...departments];
        this.setControlValue(this.departmentsControl as FormControl, this.departments, this.editVisibility?.departmentId);
      } else {
        this.departmentsControl?.setValue([]);
        this.departments = [];
      }
      this.form.markAsUntouched();
    });
  }

  private setControlValue(control: FormControl, controlDataSource: any[], value: any) {
    if (value === null) {
      control.setValue(controlDataSource.map(item => item.id));
    } else {
      control.setValue(value ? [value] : []);
    }
  }

  private closeDialog(): void {
    this.sideDialog.hide();
    this.editVisibility = null;
    this.form.reset();
    this.showForm = false;
  }
}
