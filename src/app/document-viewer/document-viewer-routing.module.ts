import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { FailedDocumentViewerComponent } from './components/failed-document-viewer/failed-document-viewer.component';
import { StatusComponentComponent } from './components/status-component/status-component.component';

const routes: Routes = [
  {
    path: '',
    component: FailedDocumentViewerComponent,
    data: { skipAuthentication: true },
  },
  {
    path: ':id',
    component: DocumentViewerComponent,
    data: { skipAuthentication: true },
  },
  {
    path: 'status',
    component: StatusComponentComponent,
    data: { skipAuthentication: true },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentViewerRoutingModule {}
