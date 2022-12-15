import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tabsConfig } from '@client/candidates/add-edit-candidate/tabs-config.constants';

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss'],
})
export class AddEditCandidateComponent implements OnInit {
  public readonly tabsConfig = tabsConfig;
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
  }

  public navigateBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  public saveCandidate(): void {
  }

  public clearForm(): void {
  }
}
