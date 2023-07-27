import { ChangeDetectorRef, Directive, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';

@Directive()
export abstract class AbstractContactDetails extends DestroyableDirective implements OnInit {
  public candidateForm: FormGroup;

  public readonly fieldsSettings: FieldSettingsModel = { text: 'name', value: 'id' };
  public readonly skillOptionFields: FieldSettingsModel = { text: 'name', value: 'masterSkillId' };

  protected constructor(
    protected cdr: ChangeDetectorRef,
    protected candidateProfileFormService: CandidateProfileFormService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.candidateForm = this.candidateProfileFormService.candidateForm;
    this.candidateProfileFormService.saveEvent$.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
  }
}
