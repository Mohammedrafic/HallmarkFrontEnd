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
      default:
        return this.getTierSettingsForm();
    }
  }

  private getTierSettingsForm(): CustomFormGroup<TierDTO> {
    return this.formBuilder.group({
      organizationTierId: [null],
      name: ['', Validators.required],
      hours: [null, Validators.required],
      priority: [null, Validators.required],
      regionIds: [null, Validators.required],
      locationIds: [null, Validators.required],
      departmentIds: [null, Validators.required],
      forceUpsert: [false]
    }) as CustomFormGroup<TierDTO>;
  }

  public mapStructureForForms(dialogType: Tiers, tier: TierDetails): TierDTO {
    switch (dialogType) {
      case Tiers.tierSettings:
        return TierService.getStructureForTierSettings(tier);
      default:
        return TierService.getStructureForTierSettings(tier);
    }
  }

  private static getStructureForTierSettings(tier: TierDetails): TierDTO {
    return {
      organizationTierId: tier.id,
      name: tier.name,
      hours: tier.hours,
      priority: tier.priority,
      regionIds: [tier.regionId],
      locationIds: [tier.locationId],
      departmentIds: [tier.departmentId],
      forceUpsert: false
    };
  }
}
