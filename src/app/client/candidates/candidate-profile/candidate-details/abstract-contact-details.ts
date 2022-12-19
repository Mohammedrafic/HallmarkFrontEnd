import { ChangeDetectorRef, Directive, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';

@Directive()
export abstract class AbstractContactDetails extends DestroyableDirective implements OnInit {
  @Input() public candidateForm: FormGroup;

  public readonly fieldsSettings: FieldSettingsModel = { text: 'name', value: 'id' };
  public readonly skillOptionFields: FieldSettingsModel = { text: 'name', value: 'masterSkillId' };

  protected constructor(protected cdr: ChangeDetectorRef, protected candidateProfileService: CandidateProfileService) {
    super();
  }

  public ngOnInit(): void {
    this.candidateProfileService.saveEvent$.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
  }
}
