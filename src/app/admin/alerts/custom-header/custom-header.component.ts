import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { OrderManagementService } from '@client/order-management/components/order-management-content/order-management.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

@Component({
  selector: 'app-custom-header',
  templateUrl: './custom-header.component.html',
  styleUrls: ['./custom-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomHeaderComponent implements ICellRendererAngularComp {
  public activeSystem: string;
  public OrderManagementIRPSystemId = OrderManagementIRPSystemId;
  constructor(public orderManagementService : OrderManagementService, public formBuilder : FormBuilder, public cdr : ChangeDetectorRef) { }
  public params: any;
  public CustomHeaderForm: FormGroup;
  agInit(params: any): void {
    this.initForm();
    this.ChangeCheckBoxState();
    this.params = params;
    
  }

  private initForm(): void {
    this.CustomHeaderForm = this.formBuilder.group({
      checkedState: false
    });
  }

  public ChangeCheckBoxState(){
    this.orderManagementService.handleCheckBoxEventfromParent.subscribe(Details => {
      if(Details.UnCheckAll){
        this.CustomHeaderForm.get("checkedState")?.patchValue(Details.Checked)
      } else {
        if(this.params.displayName === Details.headerName){
          this.CustomHeaderForm.get("checkedState")?.patchValue(Details.Checked);
        }   
      }
      this.cdr.detectChanges();
    })
  }

  refresh(): boolean {
    return true;
  } 
  checkboxStateChanged(event: any, headerName : string) {
    this.orderManagementService.HandleCheckBox(event.checked, headerName);
  }

}

