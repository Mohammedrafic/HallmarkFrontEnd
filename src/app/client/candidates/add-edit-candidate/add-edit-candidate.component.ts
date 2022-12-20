import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tabsConfig } from '@client/candidates/add-edit-candidate/tabs-config.constants';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditCandidateComponent implements OnInit {
  public readonly tabsConfig = tabsConfig;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public candidateProfileFormService: CandidateProfileFormService,
    private cdr: ChangeDetectorRef
  ) {
    if (route.snapshot.paramMap.get('id')) {
      // EDIT
      const candidateID = parseInt(route.snapshot.paramMap.get('id') as string);
      // TODO: Fetch and patch irp candidate value
    } else {
      // CREATE
    }
  }

  ngOnInit(): void {}

  public get isCandidateFormPristine(): boolean {
    return this.candidateProfileFormService.candidateForm.pristine;
  }

  public navigateBack(): void {
    this.router.navigate(['/client/candidates']);
  }

  public saveCandidate(): void {
    this.candidateProfileFormService.triggerSaveEvent();
  }

  public clearForm(): void {
    this.candidateProfileFormService.resetCandidateForm();
  }
}
