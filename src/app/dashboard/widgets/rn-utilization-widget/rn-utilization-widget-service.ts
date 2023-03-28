import { Injectable } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { CustomFormGroup } from "@core/interface";
import { RnUtilizationForm } from "./rn-utilization.interface";

@Injectable()
export class RnUtilizationFormService {

    constructor(
        private fb: FormBuilder,
    ) { }

    getNursingUtilizationForm(): CustomFormGroup<RnUtilizationForm> {
        return this.fb.group({
            workDate: [new Date()],
            workcommitIds: [],
        }) as CustomFormGroup<RnUtilizationForm>;
    }

}
