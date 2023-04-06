import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { CustomFormGroup } from "@core/interface";
import { Observable } from "rxjs";
import { RnUtilizationForm } from "./rn-utilization.interface";

@Injectable()
export class RnUtilizationFormService {

    constructor(
        private fb: FormBuilder,
        private http : HttpClient
    ) { }

    getNursingUtilizationForm(): CustomFormGroup<RnUtilizationForm> {
        return this.fb.group({
            workDate: [new Date()],
            workcommitIds: [],
            skill: []
        }) as CustomFormGroup<RnUtilizationForm>;
    }

    

}
