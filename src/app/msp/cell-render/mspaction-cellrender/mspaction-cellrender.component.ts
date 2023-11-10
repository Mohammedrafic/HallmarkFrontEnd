import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { RemoveMsp } from '../../store/actions/msp.actions';

@Component({
  selector: 'app-mspaction-cellrender',
  templateUrl: './mspaction-cellrender.component.html',
  styleUrls: ['./mspaction-cellrender.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MspactionCellrenderComponent implements ICellRendererAngularComp {  

  public params: any;
constructor(    private router: Router,
  private route: ActivatedRoute,private confirmService:ConfirmService,private store:Store)
  {
    
  }
  agInit(params: any): void {
    this.params = params;
  }

  refresh() {
    return true;
  }
  editMsp(value:any)
  {
    // console.log(this.params.data)
   this.router.navigate(['/msp/msp-edit/edit', this.params.data.id]);

  }

  
  public deleteMsp(): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) {
           this.store.dispatch(new RemoveMsp(this.params.data.id));
        }
      });
  }
}
