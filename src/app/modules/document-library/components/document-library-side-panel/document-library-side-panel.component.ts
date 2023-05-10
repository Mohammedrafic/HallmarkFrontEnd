import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DeleteDocumentFolderFilter, DocumentFolder, FolderTreeItem, NodeItem } from '../../store/model/document-library.model';
import { DocumentLibraryState } from '../../store/state/document-library.state';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { DeleteEmptyDocumentsFolder, GetDocumentsSelectedNode, GetFoldersTree, IsAddNewFolder, IsDeleteEmptyFolder, SelectedBusinessType } from '../../store/actions/document-library.actions';
import { UserState } from '../../../../store/user.state';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { FileType } from '../../enums/documents.enum';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { User } from '@shared/models/user-managment-page.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_FOLDER_TEXT, DELETE_FOLDER_TITLE } from '@shared/constants';

@Component({
  selector: 'app-document-library-side-panel',
  templateUrl: './document-library-side-panel.component.html',
  styleUrls: ['./document-library-side-panel.component.scss']
})
export class DocumentLibrarySidePanelComponent implements OnInit, OnDestroy {

  @ViewChild('tree', { static: true })
  public tree: TreeViewComponent;

  @Select(DocumentLibraryState.foldersTree)
  foldersTree$: Observable<FolderTreeItem[]>;

  @Select(DocumentLibraryState.saveDocumentFolder)
  savedDocumentFolder$: Observable<DocumentFolder>;

  private unsubscribe$: Subject<void> = new Subject();
  public sidePanelFolderItems: FolderTreeItem[];
  sidePanelDocumentField: any;
  public selectedNode: NodeItem;
  public isAddNewFolderBtnVisible: boolean = true;
  public isNewFolderInAction: boolean = false;
  public isDeleteFolder: boolean = false;
  public selectedBusinessType: number;

  constructor(private store: Store,
    private action$: Actions,
    private confirmService: ConfirmService,
    private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    const user = this.store.selectSnapshot(UserState.user) as User;
    if (user?.businessUnitType == BusinessUnitType.Hallmark) {
      this.isAddNewFolderBtnVisible = false;
    }
    this.action$.pipe(ofActionDispatched(SelectedBusinessType), takeUntil(this.unsubscribe$)).subscribe((payload) => {
      if (payload) {
         this.selectedBusinessType = payload.businessUnitType;
          this.isAddNewFolderBtnVisible = false;
          this.sidePanelDocumentField = { dataSource: [], id: 'id', text: 'name', parentID: 'parentId', child: 'children' };
      }
    });
    this.action$.pipe(ofActionDispatched(IsDeleteEmptyFolder), takeUntil(this.unsubscribe$)).subscribe((payload) => {
      if (payload) {
        if (payload.isDeleteFolder) {
          this.isDeleteFolder = true;
        }
        else {
          this.isDeleteFolder = false;
        }
      }
    });
    this.initSidePanelDocs();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public initSidePanelDocs(): void {
    this.foldersTree$.pipe(takeUntil(this.unsubscribe$)).subscribe((folderTree: FolderTreeItem[]) => {
      if (folderTree != null && folderTree.length > 0) {
        this.isAddNewFolderBtnVisible = true;
        this.sidePanelFolderItems = folderTree;
        this.sidePanelDocumentField = { dataSource: this.sidePanelFolderItems, id: 'id', text: 'name', parentID: 'parentId', child: 'children' };
        setTimeout(() => {
          if (this.sidePanelDocumentField.dataSource?.length) {
            if (this.sidePanelDocumentField.dataSource[0].id != -1) {
              if (this.isNewFolderInAction)
              {
                this.savedDocumentFolder$.subscribe((x:DocumentFolder)=>
                {
                  this.tree.selectedNodes = [x.id.toString()];
                  this.tree.expandAll();
                });
              }
              else {

                if (this.selectedNode != null && this.selectedNode?.id != undefined && this.selectedNode.businessUnitId == this.sidePanelDocumentField.dataSource[0].businessUnitId) {
                  this.tree.selectedNodes = ["-2"];
                  this.tree.selectedNodes = [this.selectedNode.id.toString()];
                }
                else {
                  this.tree.selectedNodes = [this.sidePanelDocumentField.dataSource[0].id.toString()];
                }
                this.tree.expandAll();
                this.tree.expandedNodes = [this.sidePanelDocumentField.dataSource[0].id.toString()];
              }
            }
          }
        }, 1000);
      }

    });
  }

  public nodeSelected(event: any) {
    this.isNewFolderInAction=false;
      this.selectedNode = event.nodeData;
      const selectedFolderTreeNode = this.checkSelectedNodeFolderOrDocument(this.sidePanelFolderItems, this.selectedNode.id);
      if (selectedFolderTreeNode && selectedFolderTreeNode.length > 0) {
        this.selectedNode.fileType = selectedFolderTreeNode[0].fileType;
        this.selectedNode.businessUnitId = selectedFolderTreeNode[0].businessUnitId;
  }
    this.store.dispatch(new GetDocumentsSelectedNode(this.selectedNode));
  }

  private checkSelectedNodeFolderOrDocument(data: any, id: number) {
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

  private contains(text: string, term: string): boolean {
    return text.toLowerCase().indexOf(term.toLowerCase()) >= 0;
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

  handleOnAddNewFolder(event: any) {
    if (this.selectedNode != undefined && this.selectedNode?.fileType != undefined && this.selectedNode?.fileType != FileType.Folder && this.selectedNode?.id == -1) {
      this.store.dispatch([
        new ShowToast(MessageTypes.Warning, "Please select folder."),
      ]);
    }
    else
    {
      this.store.dispatch(new IsAddNewFolder(true));
      this.isNewFolderInAction=true;
    }
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
    setTimeout(() => {
      this.tree.expandAll();
    },1000)
    
    this.changeDetectorRef.markForCheck();
  }
     
  public handleOnDeleteFolder(event: any) {
    this.confirmService
      .confirm(DELETE_FOLDER_TEXT, {
        title: DELETE_FOLDER_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && this.selectedNode.id && this.selectedNode.parentID != -1 && this.selectedNode.id != -1) {
          const deleteFolderFilter: DeleteDocumentFolderFilter = {
            folderId: this.selectedNode.id,
            businessUnitType: this.selectedBusinessType,
            businessUnitId: this.selectedNode.businessUnitId != null ? this.selectedNode.businessUnitId:null
          }
          this.store.dispatch(new DeleteEmptyDocumentsFolder(deleteFolderFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
            const businessUnitType = this.selectedBusinessType;
            const businessUnitId = this.selectedNode.businessUnitId;
            this.selectedNode = new NodeItem();
            this.store.dispatch(new GetFoldersTree({ businessUnitType: businessUnitType, businessUnitId: businessUnitId }));
          });
        }
      });
  }
}
