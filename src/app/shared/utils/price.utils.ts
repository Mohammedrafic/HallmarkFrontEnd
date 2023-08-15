import { FormGroup } from '@angular/forms';

export default class PriceUtils {
  static setPriceMask(form: FormGroup, controlName: string, e: FocusEvent): void {
    const input = e.target as HTMLInputElement;
    if (input.value.length === 0) {
      form.get(controlName)?.patchValue(`.00`, { emitEvent: false });
      setTimeout(() => input.setSelectionRange(0, 0));
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
      form.get(controlName)?.patchValue(inputValue, { emitEvent: false });
    } else {
      const value =
        integerLength !== 0
          ? Number(inputValue).toFixed(Math.max(inputValue.split('.')[1]?.length, zerosCount) || zerosCount)
          : null;
      form.get(controlName)?.patchValue(value, { emitEvent: false });
    }
  }

  static numbersOnly(event: KeyboardEvent): boolean {
    const digitsOnly = /^\d*$/;
    return (
      digitsOnly.test(event.key) || event.key === 'Backspace' || event.key === 'ArrowLeft' || event.key === 'ArrowRight'
    );
  }

  static verifyDigitsAfterDot(form: FormGroup, controlName: string): void {
    const splitByDotNumbers = form.get(controlName)?.value.toString().split('.');
    if (splitByDotNumbers[1] && splitByDotNumbers[1].length > 2) {
      form.get(controlName)?.patchValue(parseFloat(form.get(controlName)?.value).toFixed(2), { emitEvent: false });
    }
  }

  static formatNumbers(value: number | string | null): string {
    if (value || (typeof value === 'number')) {
      const updatedValue = parseFloat(value.toString()).toFixed(2);
      const truncatedValue = Math.trunc(+updatedValue);
      return truncatedValue >= 10 || truncatedValue === 0 ? updatedValue : `0${updatedValue}`;
    }

    return '';
  }
}
