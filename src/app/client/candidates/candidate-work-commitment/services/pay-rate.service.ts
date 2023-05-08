import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PayRateColumns } from "../enums/pay-rate-columns.enum";

export class PayRateService {
  public createPayRateForm(): FormGroup {
    return new FormGroup({
      [PayRateColumns.PAY_RATE]: new FormControl(null, Validators.required),
      [PayRateColumns.START_DATE]: new FormControl(null, Validators.required),
    });
  } 
}

