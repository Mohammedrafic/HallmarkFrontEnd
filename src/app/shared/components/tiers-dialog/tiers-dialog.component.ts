import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

import { filter, Observable, switchMap, takeUntil } from 'rxjs';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { FieldType } from '@core/enums';
import { OPTION_FIELDS, TIER_DIALOG_TYPE, TiersDialogConfig } from '@shared/components/tiers-dialog/constants';
import { TierDetails, TierDialogConfig, TiersInputConfig } from '@shared/components/tiers-dialog/interfaces';
import { Tiers } from '@shared/enums/tiers.enum';
import { CustomFormGroup } from '@core/interface';
import { TierService } from '@shared/components/tiers-dialog/services';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { findSelectedItems } from '@core/helpers/functions.helper';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ShowSideDialog } from '../../../store/app.actions';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { mapperSelectedItems, setDataSourceValue } from '@shared/components/tiers-dialog/helper';
import { TiersException } from '@shared/components/associate-list/store/associate.actions';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import { DepartmentsTierDTO } from '@shared/models/associate-organizations.model';
import { createDepartmentsTier } from '@shared/helpers';
import { TierList } from '@shared/components/associate-list/interfaces';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Component({
  selector: 'app-tiers-dialog',
  templateUrl: './tiers-dialog.component.html',
  styleUrls: ['./tiers-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiersDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Output() saveTier = new EventEmitter<TierDTO>();

  @Input() set regionsStructure(regions: OrganizationRegion[]) {
    this.regions = regions;
    this.dialogConfig = TiersDialogConfig(regions)[this.dialogType];
  };

  @Input() set selectedTier(tier: TierDetails) {
    if (tier) {
      this.selectedTierDetails = tier;
      this.tierForm?.patchValue(this.tierService.mapStructureForForms(this.dialogType, tier, this.regions));
    }
  };

  @Input() set isEditDialog(value: boolean) {
    this.setDialogTitle(value);
  };

  @Input() public permission: boolean;
  @Input() public organizationId: number;

  public dialogConfig: TierDialogConfig;
  public title: string = '';
  public regions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public tierForm: CustomFormGroup<TierDTO> | null;
  public readonly FieldTypes = FieldType;
  public optionFields: FieldSettingsModel = OPTION_FIELDS;

  private selectedRegions: number[] = [];
  private selectedLocations: number[] = [];
  private selectedTierDetails: TierDetails;

  @Select(AssociateListState.getTiersList)
  public tierList$: Observable<TierList[]>;

  constructor(
    @Inject(TIER_DIALOG_TYPE) protected readonly dialogType: Tiers,
    private tierService: TierService,
    private changeDetection: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private store: Store,
    private actions$: Actions,
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForShowDialog();
    this.createForm();
    this.watchForRegions();
    this.watchForLocation();
    this.watchForCloseDialog();
    this.watchForDepartments();
  }

  public saveTiers(): void {
    if (this.tierForm?.valid) {
      this.saveTier.emit(this.tierForm.value);
    } else {
      this.tierForm?.markAllAsTouched();
    }
  }

  public closeDialog(): void {
    if (this.tierForm?.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(
        filter(Boolean),
        takeUntil(this.destroy$)
      )
        .subscribe(() => {
          this.hideDialog();
        });
    } else {
      this.hideDialog();
    }
  }

  public trackByIndex(index: number, config: TiersInputConfig): string {
    return index + config.field;
  }

  private hideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.tierForm?.reset();
  }

  private createForm(): void {
    this.tierForm = this.tierService.createTierForm(this.dialogType);
  }

  private watchForRegions(): void {
    this.tierForm?.get('regionIds')?.valueChanges
      .pipe(
        filter((value: number[]) => !!value?.length),
        takeUntil(this.destroy$)
      )
      .subscribe((value: number[]) => {
        this.selectedRegions = value;
        const selectedRegions: OrganizationRegion[] = findSelectedItems(value, this.regions);
        const selectedLocation: OrganizationLocation[] = mapperSelectedItems(selectedRegions,'locations');
        this.locations = sortByField(selectedLocation, 'name');
        setDataSourceValue(this.dialogConfig.fields, 'locationIds', selectedLocation);
        this.changeDetection.markForCheck();
      });
  }

  private watchForLocation(): void {
    this.tierForm?.get('locationIds')?.valueChanges.pipe(
      filter((value: number[]) => !!value?.length),
      takeUntil(this.destroy$)
    )
      .subscribe((value: number[]) => {
        this.selectedLocations = value;
        const selectedLocation: OrganizationLocation[] = findSelectedItems(value, this.locations);
        const selectedDepartment: OrganizationDepartment[] = mapperSelectedItems(selectedLocation, 'departments');
        setDataSourceValue(this.dialogConfig.fields, 'departmentIds', sortByField(selectedDepartment, 'name'))
        this.changeDetection.markForCheck();
      })
  }

  private setDialogTitle(value: boolean): void {
    this.title = value ? this.dialogConfig.editTitle : this.dialogConfig.title;
  }

  private watchForCloseDialog(): void {
    this.actions$.pipe(
      ofActionDispatched(ShowSideDialog),
      filter(({ isDialogShown }) => !isDialogShown),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.tierForm?.reset();
    });
  }

  private watchForShowDialog(): void {
    this.actions$.pipe(ofActionDispatched(ShowSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDialogShown) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  private watchForDepartments(): void {
    if (this.dialogType === Tiers.tierException) {
      this.tierForm?.get('departmentIds')?.valueChanges.pipe(
        filter((departments: number[]) => !!departments?.length),
        switchMap((departments: number[]) => this.getTiers(departments)),
        switchMap(() => this.tierList$),
        filter((tiers: TierList[]) => !!tiers.length),
        takeUntil(this.destroy$)
      ).subscribe((tiers: TierList[]) => {
        setDataSourceValue(this.dialogConfig.fields, 'organizationTierId', tiers);

        if (this.selectedTierDetails) {
          this.tierForm?.patchValue({
            organizationTierId: this.selectedTierDetails.organizationTierId
          });
        }

        this.changeDetection.markForCheck();
      });
    }
  }

  private getTiers(departments: number[]): Observable<TierList> {
    const departmentTierDTO: DepartmentsTierDTO = createDepartmentsTier(this.organizationId, this.selectedRegions, this.selectedLocations, departments);
    return this.store.dispatch(new TiersException.GetTiers(departmentTierDTO));
  }
}
