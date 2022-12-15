import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CandidatesContentComponent } from '@client/candidates/candidates-content/candidates-content.component';
import { AddEditCandidateComponent } from '@client/candidates/add-edit-candidate/add-edit-candidate.component';

const routes: Routes = [
  {
    path: '',
    component: CandidatesContentComponent,
  },
  {
    path: 'add',
    component: AddEditCandidateComponent,
    canActivate: [],
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
