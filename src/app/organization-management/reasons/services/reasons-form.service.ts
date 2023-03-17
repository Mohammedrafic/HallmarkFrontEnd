import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ALPHANUMERICS_AND_SYMBOLS } from '@shared/constants';
import { PenaltyCriteria } from '@shared/enums/candidate-cancellation';

import { ReasonFormType } from '../enums';

@Injectable()
export class ReasonsFormsService {
  private form: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) {}

  createReasonsForm(formType: ReasonFormType): FormGroup {
    if (formType === ReasonFormType.PenaltyReason) {
      this.form = this.fb.group({
          candidateCancellationSettingId: [],
          reason: [null, [Validators.required]],
          regionIds: [[], [Validators.required]],
          locationIds: [[], [Validators.required]],
          penaltyCriteria: [PenaltyCriteria.FlatRateOfHours, [Validators.required]],
          flatRate: [null, [Validators.required]],
          rateOfHours: [null, [Validators.required]],
          flatRateOfHoursPercentage: [null, [Validators.required]],
          flatRateOfHours: [null, [Validators.required]],
        });
    } else if (formType === ReasonFormType.Unavailability) {
      this.form = this.fb.group({
        id: [],
        reason: [null, [Validators.required, Validators.maxLength(6), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
        description: [null, [Validators.maxLength(500), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
        calculateTowardsWeeklyHours: [false],
        eligibleToBeScheduled: [false],
        visibleForIRPCandidates: [false],
      });
    } else if (formType === ReasonFormType.ClosureReason || ReasonFormType.RequisitionReason) {
      this.form = this.fb.group({
        id: [],
        reason: ['', [Validators.required, Validators.maxLength(100),
          Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
        includeInIRP: [false],
        includeInVMS: [false],
      });
    } else {
      this.form = this.fb.group({
        id: [],
        reason: ['', [Validators.required, Validators.maxLength(100),
          Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
      });
    }
    return this.form;
  }
}
