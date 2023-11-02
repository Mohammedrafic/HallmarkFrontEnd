import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mspaction-cellrender',
  templateUrl: './mspaction-cellrender.component.html',
  styleUrls: ['./mspaction-cellrender.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MspactionCellrenderComponent implements ICellRendererAngularComp {  

  public params: any;
constructor(    private router: Router,
  private route: ActivatedRoute,)
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
    // this.router.navigate(['/msp/msp-edit/edit', this.params.data.id]);

  }
}
