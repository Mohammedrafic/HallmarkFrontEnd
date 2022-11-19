import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { Tiers } from '@shared/enums/tiers.enum';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { TierDetails } from '@shared/components/tiers-dialog/interfaces';

@Injectable()
export class TierService {

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  public createTierForm(type: Tiers): CustomFormGroup<TierDTO> {
    switch (type) {
      case Tiers.tierSettings:
        return this.getTierSettingsForm();
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
      regionIds: [null, Validators.required],
      locationIds: [null, Validators.required],
      departmentIds: [null, Validators.required],
      forceUpsert: [false]
    }) as CustomFormGroup<TierDTO>;
  }

  private getTierExceptionForm(): CustomFormGroup<TierDTO> {
    return this.formBuilder.group({
      organizationTierId: null,
      regionIds: [null],
      locationIds: [null],
      departmentIds: [null],
    }) as CustomFormGroup<TierDTO>;
  }

  public mapStructureForForms(dialogType: Tiers, tier: TierDetails): TierDTO {
    switch (dialogType) {
      case Tiers.tierSettings:
        return this.getStructureForTierSettings(tier);
      case Tiers.tierException:
        return this.getStructureForTierException(tier);
      default:
        return this.getStructureForTierSettings(tier);
    }
  }

  private getStructureForTierSettings(tier: TierDetails): TierDTO {
    return {
      organizationTierId: tier.id,
      name: tier.name,
      hours: tier.hours,
      regionIds: [tier.regionId],
      locationIds: [tier.locationId],
      departmentIds: [tier.departmentId],
      forceUpsert: false
    };
  }

  private getStructureForTierException(tier: TierDetails): TierDTO {
    return {
      regionIds: [tier.regionId],
      locationIds: [tier.locationId],
      departmentIds: [tier.departmentId],
      organizationTierId: tier.organizationTierId,
    }
  }
}
