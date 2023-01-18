import { Pipe, PipeTransform } from '@angular/core';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';

@Pipe({ name: 'buttonClass' })
export class ButtonClassPipe implements PipeTransform {
  private readonly buttonTypeToClassMapper: Record<ButtonTypeEnum, string> = {
    [ButtonTypeEnum.OUTLINED]: 'e-outline',
    [ButtonTypeEnum.PRIMARY]: 'e-primary',
    [ButtonTypeEnum.ACTION]: 'e-action-button',
  };

  public transform(buttonType: ButtonTypeEnum): string {
    return this.buttonTypeToClassMapper[buttonType];
  }
}
