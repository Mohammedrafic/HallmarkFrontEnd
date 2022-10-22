import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentLibraryComponent } from './components/document-management/document-library/document-library.component';
import { DocumentManagementComponent } from './components/document-management/document-management.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    component: DocumentManagementComponent,
    children: [
      {
        path: 'document-library',
        component: DocumentLibraryComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentLibraryRoutingModule { }
