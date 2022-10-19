import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DocumentTypeFilter, FolderTreeItem, NodeItem } from '../../store/model/document-library.model';
import { DocumentLibraryState } from '../../store/state/document-library.state';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { GetDocumentsSelectedNode, GetDocumentTypes, GetFoldersTree, IsAddNewFolder } from '../../store/actions/document-library.actions';
import { UserState } from '../../../../store/user.state';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { FileType } from '../../enums/documents.enum';
import { ORG_ID_STORAGE_KEY } from '@shared/constants';
import { BusinessUnitType } from '../../../../shared/enums/business-unit-type';

@Component({
  selector: 'app-document-library-side-panel',
  templateUrl: './document-library-side-panel.component.html',
  styleUrls: ['./document-library-side-panel.component.scss']
})
export class DocumentLibrarySidePanelComponent implements OnInit, OnDestroy {

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
    private changeDetectorRef: ChangeDetectorRef) { }

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
      let documentTypesFilter: DocumentTypeFilter = {
        businessUnitType: user?.businessUnitType,
        businessUnitId: user?.businessUnitType == BusinessUnitType.Hallmark ? null : this.businessUnitId
      }
      this.store.dispatch(new GetDocumentTypes(documentTypesFilter));

      this.store.dispatch(new GetFoldersTree({ businessUnitType: user?.businessUnitType, businessUnitId: this.businessUnitId }));
      this.foldersTree$.pipe(takeUntil(this.unsubscribe$)).subscribe((folderTree: FolderTreeItem[]) => {
        if (folderTree != null) {
          this.sidePanelFolderItems = folderTree;
          this.sidePanelDocumentField = { dataSource: this.sidePanelFolderItems, id: 'id', text: 'name', parentID: 'parentId', child: 'children' };
          setTimeout(() => {
            if (this.sidePanelDocumentField.dataSource.length) {
              if (this.sidePanelDocumentField.dataSource[0].id != -1) {
                this.tree.selectedNodes = [this.sidePanelDocumentField.dataSource[0].id.toString()];
                const targetNodeId: string = this.tree.selectedNodes[0];
                const element = this.tree?.element.querySelector('[data-uid="' + targetNodeId + '"]');
                const liElements = element?.querySelectorAll('ul li');
                let nodes = [];
                if (liElements != undefined && liElements.length > 0) {
                  for (let i = 0; i < liElements?.length; i++) {
                    const nodeData: any = this.tree?.getNode(liElements[i]);
                    nodes.push(nodeData.id);
                  }
                  this.tree.expandAll(nodes);
                }
                this.tree.expandedNodes = [this.sidePanelDocumentField.dataSource[0].id.toString()];
              }
              else {
                this.tree.selectedNodes = ['0'];
                this.selectedNode = new NodeItem();
                this.store.dispatch(new GetDocumentsSelectedNode(this.selectedNode));
              }
            }
            else {
              this.tree.selectedNodes = ['0'];
              this.selectedNode = new NodeItem();
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
    if (selectedFolderTreeNode && selectedFolderTreeNode.length > 0) {
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

        ele && ele.id == id
          ? arr.push(ele)
          : arr.push(...this.checkSelectedNodeFolderOrDocument(ele.children, id));
      }
    }

    return arr;
  }

  handleOnAddNewFolder(event: any) {
    if (this.selectedNode != undefined && this.selectedNode?.fileType != undefined && this.selectedNode?.fileType != FileType.Folder && this.selectedNode?.id == -1) {
      this.store.dispatch([
        new ShowToast(MessageTypes.Warning, "Please select folder."),
      ]);
    }
    else
      this.store.dispatch(new IsAddNewFolder(true));
  }

  private searchFolderTree(items: FolderTreeItem[], term: string): any[] {
    return items.reduce((acc: FolderTreeItem[], item: FolderTreeItem) => {
      if (this.contains(item.name, term)) {
        acc.push(item);
      } else if (item.children && item.children.length > 0) {
        let newItems = this.searchFolderTree(item.children, term);
        if (newItems.length > 0) {
          acc.push({ ...item, children: newItems });
        }
      }
      return acc;
    }, []);
  }

  private contains(text: string, term: string): boolean {
    return text.toLowerCase().indexOf(term.toLowerCase()) >= 0;
  }

  public handleOnSearchTree(event: any) {
    const searchString = event.target.value;
    if (searchString.trim() != '') {
      const searchFolderTree = this.searchFolderTree(this.sidePanelFolderItems, searchString);
      this.sidePanelDocumentField = { dataSource: searchFolderTree, id: 'id', text: 'name', parentID: 'parentId', child: 'children' };

    }
    else {
      this.sidePanelDocumentField = { dataSource: this.sidePanelFolderItems, id: 'id', text: 'name', parentID: 'parentId', child: 'children' };
    }
    this.changeDetectorRef.markForCheck();
  }


}
