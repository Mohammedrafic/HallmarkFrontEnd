import {FormGroup} from "@angular/forms";

export default class PriceUtils {
  static setPriceMask(form: FormGroup, controlName: string, e: FocusEvent): void {
    const input = e.target as HTMLInputElement;
    if (input.value.length === 0) {
      form.get(controlName)?.patchValue(`.00`,{emitEvent: false});
      setTimeout(() => input.setSelectionRange(0,0));
    }
  }

  static setTwoDecimals(form: FormGroup, controlName: string, e: FocusEvent): void {
    let zerosCount = 2;
    const input = e.target as HTMLInputElement;
    const inputValue = input.value;
    const integerLength = inputValue.split('.')[0].length;

    if (integerLength > 8 && integerLength < 10) {
      zerosCount = 1;
    } else if (integerLength > 9) {
      zerosCount = 0;
    }

    if (isNaN(Number(inputValue))) {
      form.get(controlName)?.patchValue(inputValue,{emitEvent: false});
    } else {
      const value = integerLength !== 0 ?
        Number(inputValue).toFixed(Math.max(inputValue.split('.')[1]?.length, zerosCount) || zerosCount) :
        null;
      form.get(controlName)?.patchValue(value,{emitEvent: false});
    }
  }
}
