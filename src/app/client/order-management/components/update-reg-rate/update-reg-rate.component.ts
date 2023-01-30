import { Component, ChangeDetectionStrategy, Input, Output,ViewChild, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UpdateRegRateService } from '@client/order-management/components/update-reg-rate/update-reg-rate.service';
import { UpdateRegrateModel } from '@shared/models/update-regrate.model';
import { Store } from '@ngxs/store';
import { UpdateRegRateorder, UpdateRegRateSucceeded } from '@client/store/order-managment-content.actions';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';


@Component({
  selector: 'app-update-reg-rate',
  templateUrl: './update-reg-rate.component.html',
  styleUrls: ['./update-reg-rate.component.scss']
})
export class UpdateRegRateComponent implements OnInit {
  public showcontent:Boolean = false;
  public updateform: FormGroup;
  public getorderdatas:any;
  public disabledbtn:boolean = true;
  @Input() public orderdatas: any;
  constructor(
        private formBuilder: FormBuilder,
        private updateregrateservice : UpdateRegRateService,
        private store: Store) { }

  ngOnInit(): void {
    this.initform();
    this.onOpenEvent();
  }

  public initform(): void{
      this.updateform = this.formBuilder.group({
        updaterate: [],
      });
  }

  private onOpenEvent(): void {
    this.showcontent = true;
  }

  public checkvalue(){
    this.updateform.value.updaterate != null ? this.disabledbtn = false : this.disabledbtn = true;
  }

  public updateformvalue(){
    const payload = {
      "orderIds" : this.getorderdatas,
      "hourlyRate" : this.updateform.value.updaterate
    };
    this.store.dispatch(new UpdateRegRateorder(payload));
  }

  ngOnChanges(orderdatas : SimpleChanges):void{
    this.getorderdatas = orderdatas['orderdatas'].currentValue;
  }

}
