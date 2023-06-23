import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';
import { UpdateRegRateService } from '@client/order-management/components/update-reg-rate/update-reg-rate.service';
import { Store } from '@ngxs/store';
import { UpdateRegRateorder } from '@client/store/order-managment-content.actions';
import { delay, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';


@Component({
  selector: 'app-update-reg-rate',
  templateUrl: './update-reg-rate.component.html',
  styleUrls: ['./update-reg-rate.component.scss']
})
export class UpdateRegRateComponent extends DestroyableDirective implements OnInit {
  public showcontent:Boolean = false;
  public updateform: FormGroup;
  public getorderdatas:any;
  public getperdiemorderdatas:any;
  public disabledbtn:boolean = true;
  @Output() public reloadItemsListforupdate: EventEmitter<void> = new EventEmitter<void>();
  @Input() public orderdatas: any;
  @Input() public perdiemOrderData: any;
  constructor(
        private formBuilder: FormBuilder,
        private updateregrateservice : UpdateRegRateService,
        private store: Store
  ) {
    super();
  }

  ngOnInit(): void {
    this.initform();
    this.onOpenEvent();
  }

  ngOnChanges(orderdatas : SimpleChanges):void{
    this.getorderdatas = orderdatas['orderdatas'].currentValue;
    this.getperdiemorderdatas=orderdatas['perdiemOrderData'].currentValue;
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
      "hourlyRate": this.updateform.value.updaterate,
      "perDiemIds": this.getperdiemorderdatas
    };
    this.store.dispatch(new UpdateRegRateorder(payload)).pipe(
      delay(500),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.reloadItemsListforupdate.next();
    });
  }

}
