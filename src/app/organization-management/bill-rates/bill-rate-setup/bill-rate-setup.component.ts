import { Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { FreezeService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/user.state';
import { GetAllSkills } from '@organization-management/store/organization-management.actions';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Skill, SkillsPage } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ShowSideDialog } from '../../../store/app.actions';
import { GetBillRates } from '@organization-management/store/bill-rates.actions';
import { BillRatesState } from '@organization-management/store/bill-rates.state';

@Component({
  selector: 'app-bill-rate-setup',
  templateUrl: './bill-rate-setup.component.html',
  styleUrls: ['./bill-rate-setup.component.scss'],
  providers: [FreezeService]
})
export class BillRateSetupComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @Input() isActive: boolean = false;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];

  public locations: OrganizationLocation[] = [];

  public departments: OrganizationDepartment[] = [];
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };

  @Select(OrganizationManagementState.skills)
  skills$: Observable<SkillsPage>;
  skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };
  public allSkills: Skill[] = [];

  @Select(BillRatesState.billRatesPage)
  billRatesPage$: Observable<any> // TODO: add model after BE implementation

  // TODO: add @Select
  billRatesTitle$: Observable<any> // TODO: add model after BE implementation

  // TODO: add @Select
  orderTypes$:  Observable<any> // TODO: add model after BE implementation

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isEdit = false;
  public isOvertimeAccessible = true;
  public isRateInHours = false;
  public isInternalMinEnabled = true;
  public isInternalMaxEnabled = true;
  public billRatesFormGroup: FormGroup;
  public billRatesInternalMinRequiredFormGroup: FormGroup;
  public billRatesInternalMaxRequiredFormGroup: FormGroup;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add New';
  }

  private formBuilder: FormBuilder;
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createFormGroups();
  }

  ngOnInit(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      //  TODO: add store dispatches
      this.store.dispatch(new GetAllSkills());
      //this.store.dispatch(new GetBillRates()); // TODO: uncomment after BE implementation
    });

    this.organizationStructure$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((structure: OrganizationStructure) => {
      this.orgRegions = structure.regions;
      this.allRegions = [...this.orgRegions];
    });

    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe(skills => {
      if (skills && skills.items.length > 0) {
        this.allSkills = skills.items;
      }
    });

    this.regionChangedHandler();
    this.locationChangedHandler();
    this.billRatesTitleChangedHandler();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFormCancelClick(): void {
    if (this.billRatesFormGroup.dirty
      || this.billRatesInternalMinRequiredFormGroup.dirty
      || this.billRatesInternalMaxRequiredFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.clearFormDetails();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
      this.removeActiveCssClass();
    }
  }

  public onFormSaveClick(): void {
    if (this.billRatesFormGroup.valid) {
      if ((this.isInternalMinEnabled && this.billRatesInternalMinRequiredFormGroup.valid)
      || (this.isInternalMaxEnabled && this.billRatesInternalMaxRequiredFormGroup.valid)) {
        // TODO: need implementation
      }
    } else {
      this.billRatesFormGroup.markAllAsTouched();
    }
  }

  public onEditRecordButtonClick(data: any, event: any): void {
    // TODO: need implementation
    this.isEdit = true;
  }

  public onRemoveRecordButtonClick(data: any, event: any): void {
    // TODO: need implementation
  }

  public considerForWeeklyOtChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public considerForDailyOtChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public considerFor7thDayOtChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public regularLocalChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public displayInTimeSheetChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public displayInJobChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  private createFormGroups(): void {
    this.billRatesFormGroup = this.formBuilder.group({
      regionIds: ['', [Validators.required]],
      locationIds: ['', [Validators.required]],
      departmentIds: ['', [Validators.required]],
      skillIds: ['', [Validators.required]],
      billRateTitleId: ['', [Validators.required]],
      orderTypeIds: ['', [Validators.required]],
      billRatesCategory: [{ value: '', disabled: true }],
      billRatesType: [{ value: '', disabled: true }],
      billRateValueRateTimes: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
      effectiveDate: [null, [Validators.required]],
      considerForWeeklyOt: [null],
      considerForDailyOt: [null],
      considerFor7thDayOt: [null],
      regularLocal: [null],
      displayInTimesheet: [null],
      displayInJob: [null]
    });

    this.billRatesInternalMinRequiredFormGroup = this.formBuilder.group({
      internalMin: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(10)]]
    });

    this.billRatesInternalMaxRequiredFormGroup = this.formBuilder.group({
      internalMax: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(10)]]
    });
  }

  private clearFormDetails(): void {
    this.billRatesFormGroup.reset();
    this.isEdit = false;
  }

  private regionChangedHandler(): void {
    this.billRatesFormGroup.get('regionIds')?.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((regionIds: number[]) => {
        if (regionIds && regionIds.length > 0) {
          this.locations = [];
          regionIds.forEach((id) => {
            const selectedRegion = this.orgRegions.find(region => region.id === id);
            this.locations.push(...selectedRegion?.locations as any);
          });
          this.departments = [];
          this.locations.forEach(location => {
            this.departments.push(...location.departments);
          });
        } else {
          this.locations = [];
          this.departments = [];
        }

        this.billRatesFormGroup.controls['locationIds'].setValue(null);
        this.billRatesFormGroup.controls['departmentIds'].setValue(null);
      });
  }

  private locationChangedHandler(): void {
    this.billRatesFormGroup.get('locationIds')?.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((locationIds: number[]) => {
      if (locationIds && locationIds.length > 0) {
        this.departments = [];
        locationIds.forEach(id => {
          const selectedLocation = this.locations.find(location => location.id === id);
          this.departments.push(...selectedLocation?.departments as []);
        });
      } else {
        this.departments = [];
      }

      this.billRatesFormGroup.controls['departmentIds'].setValue(null);
    });
  }

  private billRatesTitleChangedHandler(): void {
    this.billRatesFormGroup.get('billRateTitleId')?.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((typeDetails: any) => {
      // TODO: align cases after BillRateTitle items be discussed with BE team
      switch (typeDetails) {
        case BillRateTitle.Regular:
          this.isRateInHours = false;
          this.isOvertimeAccessible = false;
          this.isInternalMinEnabled = false;
          this.isInternalMaxEnabled = false;
          break;
        case BillRateTitle.RegularLocal:
          this.isRateInHours = false;
          this.isOvertimeAccessible = true;
          this.isInternalMinEnabled = false;
          this.isInternalMaxEnabled = true;
          break;
        case BillRateTitle.GuaranteedHours:
          this.isRateInHours = true;
          this.isOvertimeAccessible = true;
          this.isInternalMinEnabled = false;
          this.isInternalMaxEnabled = true;
          break;
        case BillRateTitle.Callback:
          this.isRateInHours = true;
          this.isOvertimeAccessible = true;
          this.isInternalMinEnabled = false;
          this.isInternalMaxEnabled = true;
          break;
      }
    });
  }
}

// TODO: discuss details with BE team
export enum BillRateTitle {
  Regular,
  RegularLocal,
  GuaranteedHours,
  Callback
}
