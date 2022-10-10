import { Component, Input } from '@angular/core';
import {
  CLASSIFICATION,
  OPRION_FIELDS,
  ORDER_TYPE,
} from '@agency/agency-list/add-edit-agency/add-edit-agency.constants';
import { FormControl, FormGroup } from '@angular/forms';
import { AgencyState } from '@agency/store/agency.state';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { AgencyRegionSkills } from '@shared/models/agency.model';
import { REGION_OPTION } from '@shared/components/associate-list/associate-grid/edit-associate-dialog/fee-settings/add-new-fee-dialog/fee-dialog.constant';

@Component({
  selector: 'app-job-distribution',
  templateUrl: './job-distribution.component.html',
  styleUrls: ['./job-distribution.component.scss'],
})
export class JobDistributionComponent {
  @Input() formGroup: FormGroup;

  @Select(AgencyState.getRegionsSkills)
  public readonly regionsSkillsList$: Observable<AgencyRegionSkills>;
  public readonly optionFields = OPRION_FIELDS;
  public readonly regionOption = REGION_OPTION;
  public readonly orderType = ORDER_TYPE;
  public readonly classification = CLASSIFICATION;

  constructor() {}

  static createFormGroup(): FormGroup {
    return new FormGroup({
      regionNames: new FormControl(null),
      orderTypes: new FormControl(null),
      classifications: new FormControl(null),
      skillCategoryIds: new FormControl(null),
    });
  }
}
