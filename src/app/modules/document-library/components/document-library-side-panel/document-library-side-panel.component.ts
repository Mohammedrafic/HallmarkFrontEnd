import { Component, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DocumentItem, DocumentLibrary } from '../../store/model/document-library.model';
import { DocumentLibraryState } from '../../store/state/document-library.state';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { GetDocumentsTree } from '../../store/actions/document-library.actions';

@Component({
  selector: 'app-document-library-side-panel',
  templateUrl: './document-library-side-panel.component.html',
  styleUrls: ['./document-library-side-panel.component.scss']
})
export class DocumentLibrarySidePanelComponent implements OnInit {

  @Select(DocumentLibraryState.documentsTree)
  documents$: Observable<DocumentLibrary>;
  public sidePanelDocumentItems: DocumentItem[];
  private unsubscribe$: Subject<void> = new Subject();
  sidePanelDocumentField: Object;
  public selectedNode: number;

  @ViewChild('tree', { static: true })
  public tree: TreeViewComponent;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.initSidePanelDocs();
  }

  initSidePanelDocs(): void {
    this.store.dispatch(new GetDocumentsTree());
    this.documents$.pipe(takeUntil(this.unsubscribe$)).subscribe((docTree: DocumentLibrary) => {
      if (docTree?.documentItems?.length) {
        this.sidePanelDocumentItems = docTree.documentItems;
        this.sidePanelDocumentField = { dataSource: this.sidePanelDocumentItems, id: 'id', text: 'name', child: 'children' };
      }
    });
  }
}
