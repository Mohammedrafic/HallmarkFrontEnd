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
        description: [],
        calculateTowardsWeeklyHours: [false],
        eligibleToBeScheduled: [false],
        visibleForIRPCandidates: [false],
      });
    } else if (formType === ReasonFormType.ClosureReason) {
      this.form = this.fb.group({
        id: [],
        reason: ['', [Validators.required, Validators.maxLength(100),
          Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
        includeInIRP: [false],
        includeInVMS: [false],
      });
    } else if (formType === ReasonFormType.RequisitionReason) {
      this.form = this.fb.group({
        id: [],
        reason: ['', [Validators.required, Validators.maxLength(100),
          Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
        includeInIRP: [false],
        includeInVMS: [false],
        isAutoPopulate: [false]
      });
    } else if (formType === ReasonFormType.CategoryNoteReason) {
      this.form = this.fb.group({
        id: [],
        reason: ['', [Validators.required, Validators.maxLength(100),
          Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
        isRedFlagCategory: [false],
      });
    }  else if(formType === ReasonFormType.DefaultReason){
      this.form = this.fb.group({
        id: [],
        reason: ['', [Validators.required, Validators.maxLength(100),
          Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
      });
    } else if(formType === ReasonFormType.TerminatedReason){
      this.form = this.fb.group({
        id: [],
        reason: ['', [Validators.required, Validators.maxLength(100),
          Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
      });
    } else if(formType === ReasonFormType.InternalTransferReason){
      this.form = this.fb.group({
        id: [],
        reason: ['', [Validators.required, Validators.maxLength(100),
          Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
      });
    } else if(formType === ReasonFormType.ManualInvoiceReason){
      this.form = this.fb.group({
        id: [],
        reason: ['', [Validators.required, Validators.maxLength(100),
          Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)]],
        agencyFeeApplicable: [true],
      });
    }
    return this.form;
  }
}
