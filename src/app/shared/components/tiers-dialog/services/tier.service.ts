import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { Tiers } from '@shared/enums/tiers.enum';
import { TierConfig, TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { TierDetails } from '@shared/components/tiers-dialog/interfaces';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { Tier_Config } from '@shared/components/tiers-dialog/constants';

@Injectable()
export class TierService {
  private tierConfig: TierConfig = Tier_Config;

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  public createTierForm(type: Tiers): CustomFormGroup<TierDTO> {
    switch (type) {
      case Tiers.tierSettings:
        return this.getTierSettingsForm();
      case Tiers.tierSettingsIRP:
        return this.getTierSettingsFormIRP();
      case Tiers.tierException:
        return this.getTierExceptionForm();
      default:
        return this.getTierSettingsForm();
    }
  }

  private getTierSettingsForm(): CustomFormGroup<TierDTO> {
    return this.formBuilder.group({
      organizationTierId: [null],
      name: ['', Validators.required],
      hours: [null, Validators.required],
      forceUpsert: [false],
      regionIds: [null, Validators.required],
      locationIds: [null, Validators.required],
      departmentIds: [null, Validators.required],
    }) as CustomFormGroup<TierDTO>;
  }

  private getTierSettingsFormIRP(): CustomFormGroup<TierDTO> {
    return this.formBuilder.group({
      organizationTierId: [null],
      name: ['', Validators.required],
      hours: [null, Validators.required],
      forceUpsert: [false],
      workCommitments : [null],
      skills : ["1", Validators.required]
    }) as CustomFormGroup<TierDTO>;
  }

  private getTierExceptionForm(): CustomFormGroup<TierDTO> {
    return this.formBuilder.group({
      tierExceptionId: null,
      organizationTierId: null,
      regionIds: [null],
      locationIds: [null],
      departmentIds: [null],
    }) as CustomFormGroup<TierDTO>;
  }

  public mapStructureForForms(dialogType: Tiers, tier: TierDetails, regions: OrganizationRegion[]): TierDTO {
    switch (dialogType) {
      case Tiers.tierSettings:
        return this.getStructureForTierSettings(tier, regions);
      case Tiers.tierSettingsIRP:
        return this.getStructureForTierSettingsIRP(tier, regions);
      case Tiers.tierException:
        return this.getStructureForTierException(tier);
      default:
        return this.getStructureForTierSettings(tier, regions);
    }
  }

  private getStructureForTierSettings(tier: TierDetails, regions: OrganizationRegion[]): TierDTO {
    this.getTierConfig(regions);

    return {
      organizationTierId: tier.id,
      name: tier.name,
      hours: tier.hours,
      regionIds: tier.regionId ? [tier.regionId] : null,
      locationIds: tier.locationId ? [tier.locationId] : null,
      departmentIds:  tier.departmentId ? [tier.departmentId] : null,
      forceUpsert: false,
    };
  }

  private getStructureForTierSettingsIRP(tier: TierDetails, regions: OrganizationRegion[]): TierDTO {
    this.getTierConfig(regions);

    return {
      organizationTierId: tier.id,
      name: tier.name,
      hours: tier.hours,
      WorkCommitmentIds : tier.WorkCommitmentIds,
      forceUpsert: false,
      workCommitments: tier.workCommitments,
      skills : tier.skills
    };
  }

  private getTierConfig(regions: OrganizationRegion[]): void {
    this.tierConfig = regions.reduce((config: TierConfig, current: OrganizationRegion) => {
      const selectedLocations = current.locations?.map((location: OrganizationLocation) => location.id) as number[];
      const selectedDepartments  = current.locations?.flatMap((location: OrganizationLocation) =>
        location.departments.map((department: OrganizationDepartment) => department.id)) as number[];

      return  {
        ...config,
          regions: [current.id, ...config.regions],
          locations: [...selectedLocations, ...config.locations],
          departments: [...selectedDepartments, ...config.departments]
      } as TierConfig;
    }, this.tierConfig);
  }

  private getStructureForTierException(tier: TierDetails): TierDTO {
    return {
      tierExceptionId: tier.id,
      regionIds: tier.regionId ? [tier.regionId] : null,
      locationIds: tier.locationId ? [tier.locationId] : null,
      departmentIds: tier.departmentId ? [tier.departmentId] : null,
      organizationTierId: tier.organizationTierId,
    }
  }
}
