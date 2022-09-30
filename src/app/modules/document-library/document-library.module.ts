import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentLibrarySidePanelComponent } from './components/document-library-side-panel/document-library-side-panel.component';
import { DocumentManagementComponent } from './components/document-management/document-management.component';
import { DocumentLibraryRoutingModule } from './document-library-routing.module';
import { DocumentLibraryComponent } from './components/document-management/document-library/document-library.component';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { NgxsModule } from '@ngxs/store';
import { DocumentLibraryState } from './store/state/document-library.state';
import { FeatherModule } from 'angular-feather';

@NgModule({
  declarations: [
    DocumentLibrarySidePanelComponent,
    DocumentManagementComponent,
    DocumentLibraryComponent
  ],
  imports: [
    CommonModule,
    DocumentLibraryRoutingModule,
    TreeViewModule,
    FeatherModule,
    NgxsModule.forFeature([DocumentLibraryState])
  ]
})
export class DocumentLibraryModule { }
