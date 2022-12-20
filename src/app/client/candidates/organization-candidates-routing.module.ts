import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CandidatesContentComponent } from '@client/candidates/candidates-content/candidates-content.component';
import { AddEditCandidateComponent } from '@client/candidates/add-edit-candidate/add-edit-candidate.component';
import { NavigateWithChangesGuard } from '@client/guards/navigate-with-changes.guard';

const routes: Routes = [
  {
    path: '',
    component: CandidatesContentComponent,
  },
  {
    path: 'add',
    component: AddEditCandidateComponent,
    canDeactivate: [NavigateWithChangesGuard]
  },
  {
    path: 'edit/:id',
    component: AddEditCandidateComponent,
    canActivate: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationCandidatesRoutingModule {}
