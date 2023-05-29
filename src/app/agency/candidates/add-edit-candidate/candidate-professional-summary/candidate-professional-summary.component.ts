import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";


@Component({
  selector: 'app-candidate-professional-summary',
  templateUrl: './candidate-professional-summary.component.html',
  styleUrls: ['./candidate-professional-summary.component.scss'],
})
export class CandidateProfessionalSummaryComponent {
  @Input() formGroup: FormGroup;

  static createFormGroup(): FormGroup {
    return new FormGroup({
      professionalSummary: new FormControl(null, [Validators.maxLength(500)]),
    });
  }
}
