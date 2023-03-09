import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { FailedDocumentViewerComponent } from './components/failed-document-viewer/failed-document-viewer.component';

const routes: Routes = [
  {
    path: '',
    component: FailedDocumentViewerComponent,
  },
  {
    path: 'failed',
    component: FailedDocumentViewerComponent,
  },
  {
    path: '{id}',
    component: DocumentViewerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentViewerRoutingModule {}

