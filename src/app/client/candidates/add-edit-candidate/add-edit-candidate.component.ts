import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tabsConfig } from '@client/candidates/add-edit-candidate/tabs-config.constants';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditCandidateComponent implements OnInit {
  public readonly tabsConfig = tabsConfig;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private candidateProfileService: CandidateProfileService,
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

  ngOnInit(): void {
  }

  public navigateBack(): void {
    this.router.navigate(['/client/candidates']);
  }

  public saveCandidate(): void {
    this.candidateProfileService.saveEvent$.next();
  }

  public clearForm(): void {
    this.candidateProfileService.resetCandidateForm();
  }
}
