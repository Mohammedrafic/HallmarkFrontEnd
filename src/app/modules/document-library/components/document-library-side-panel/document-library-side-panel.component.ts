import { Component, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FolderTreeItem, NodeItem } from '../../store/model/document-library.model';
import { DocumentLibraryState } from '../../store/state/document-library.state';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { GetDocumentsSelectedNode, GetFoldersTree, IsAddNewFolder } from '../../store/actions/document-library.actions';
import { UserState } from '../../../../store/user.state';

@Component({
  selector: 'app-document-library-side-panel',
  templateUrl: './document-library-side-panel.component.html',
  styleUrls: ['./document-library-side-panel.component.scss']
})
export class DocumentLibrarySidePanelComponent implements OnInit {

  @Select(DocumentLibraryState.foldersTree)
  foldersTree$: Observable<FolderTreeItem[]>;

  public sidePanelFolderItems: FolderTreeItem[];
  private unsubscribe$: Subject<void> = new Subject();
  sidePanelDocumentField: any;
  public selectedNode: NodeItem;

  @ViewChild('tree', { static: true })
  public tree: TreeViewComponent;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.initSidePanelDocs();
  }

  initSidePanelDocs(): void {
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.store.dispatch(new GetFoldersTree({ businessUnitType: user?.businessUnitType, businessUnitId: user?.businessUnitId }));
      this.foldersTree$.pipe(takeUntil(this.unsubscribe$)).subscribe((folderTree: FolderTreeItem[]) => {
        if (folderTree?.length) {
          this.sidePanelFolderItems = folderTree;
          this.sidePanelDocumentField = { dataSource: this.sidePanelFolderItems, id: 'id', text: 'name', parentID: 'parentId', child: 'children' };
          setTimeout(() => {
            this.tree.selectedNodes = [this.sidePanelDocumentField.dataSource[0].id.toString()];
          }, 1000);
          let nodeData = new NodeItem();
          nodeData.expanded = false;
          nodeData.hasChildren = this.sidePanelDocumentField.dataSource[0].Children?.length > 0 ? true : false;
          nodeData.id = this.sidePanelDocumentField.dataSource[0].id;
          nodeData.isChecked = undefined;
          nodeData.parentID = this.sidePanelDocumentField.dataSource[0].parentId;
          nodeData.selected = true;
          nodeData.text = this.sidePanelDocumentField.dataSource[0].name;
          this.store.dispatch(new GetDocumentsSelectedNode(nodeData));
        }
      });
    }

  }

  public nodeSelected(event: any) {
    this.selectedNode = event.nodeData;
    debugger;
    this.store.dispatch(new GetDocumentsSelectedNode(this.selectedNode));
  }

  handleOnAddNewFolder(event: any) {
    this.store.dispatch(new IsAddNewFolder(true));
  }

}
