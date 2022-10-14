import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FolderTreeItem, NodeItem } from '../../store/model/document-library.model';
import { DocumentLibraryState } from '../../store/state/document-library.state';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { GetDocumentsSelectedNode, GetFoldersTree, IsAddNewFolder } from '../../store/actions/document-library.actions';
import { UserState } from '../../../../store/user.state';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { FileType } from '../../enums/documents.enum';
import { ORG_ID_STORAGE_KEY } from '@shared/constants';

@Component({
  selector: 'app-document-library-side-panel',
  templateUrl: './document-library-side-panel.component.html',
  styleUrls: ['./document-library-side-panel.component.scss']
})
export class DocumentLibrarySidePanelComponent implements OnInit,OnDestroy {

  @Select(DocumentLibraryState.foldersTree)
  foldersTree$: Observable<FolderTreeItem[]>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;
  businessUnitId: number = parseInt(window.localStorage.getItem(ORG_ID_STORAGE_KEY) as string);

  public sidePanelFolderItems: FolderTreeItem[];
  private unsubscribe$: Subject<void> = new Subject();
  sidePanelDocumentField: any;
  public selectedNode: NodeItem;

  @ViewChild('tree', { static: true })
  public tree: TreeViewComponent;

  constructor(private store: Store,
    private changeDetectorRef: ChangeDetectorRef  ) { }

  ngOnInit(): void {
    this.onOrganizationChangedHandler();
   
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initSidePanelDocs(): void {
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.store.dispatch(new GetFoldersTree({ businessUnitType: user?.businessUnitType, businessUnitId: this.businessUnitId }));
      this.foldersTree$.pipe(takeUntil(this.unsubscribe$)).subscribe((folderTree: FolderTreeItem[]) => {
        if (folderTree != null) {
          this.sidePanelFolderItems = folderTree;
          this.sidePanelDocumentField = { dataSource: this.sidePanelFolderItems, id: 'id', text: 'name', parentID: 'parentId', child: 'children' };
          setTimeout(() => {
            if (this.sidePanelDocumentField.dataSource.length) {
              this.tree.selectedNodes = [this.sidePanelDocumentField.dataSource[0].id.toString()];
              this.tree.expandedNodes = [this.sidePanelDocumentField.dataSource[0].id.toString()];
            }
            else {
              this.tree.selectedNodes = ['0'];
              this.store.dispatch(new GetDocumentsSelectedNode(this.selectedNode));
            }
          }, 1000);
        }
      });
    }

  }
  public onOrganizationChangedHandler() {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data) {
        this.selectedNode = new NodeItem();
        this.businessUnitId = data;
        this.initSidePanelDocs();
        this.changeDetectorRef.markForCheck();
      }
    });
  }
  public nodeSelected(event: any) {
    this.selectedNode = event.nodeData;
    const selectedFolderTreeNode = this.checkSelectedNodeFolderOrDocument(this.sidePanelFolderItems, this.selectedNode.id);
    if (selectedFolderTreeNode && selectedFolderTreeNode.length>0) {
      this.selectedNode.fileType = selectedFolderTreeNode[0].fileType;
      this.selectedNode.businessUnitId = selectedFolderTreeNode[0].businessUnitId;
    }
    this.store.dispatch(new GetDocumentsSelectedNode(this.selectedNode));
  }

  checkSelectedNodeFolderOrDocument(data: any, id: number) {
    const arr: any = [];

    if (data && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const ele = data[i];

        ele && ele.id==id
          ? arr.push(ele)
          : arr.push(...this.checkSelectedNodeFolderOrDocument(ele.children, id));
      }
    }

    return arr;
  }

  handleOnAddNewFolder(event: any) {
    if (this.selectedNode != undefined && this.selectedNode?.fileType !=undefined && this.selectedNode?.fileType != FileType.Folder) {
      this.store.dispatch([
        new ShowToast(MessageTypes.Warning, "Please select folder."),
      ]);
    }
    else
      this.store.dispatch(new IsAddNewFolder(true));
  }

}
