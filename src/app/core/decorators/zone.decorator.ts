export function OutsideZone(
  targetClass: any,
  functionName: string,
  descriptor: any
) {
  const source = descriptor.value;

  descriptor.value = function(...data: any): Function {
    if (!this.ngZone) {
      throw new Error('Class with \'OutsideZone\' decorator should have \'ngZone\' class property with \'NgZone\' class.');
    }

    return this.ngZone.runOutsideAngular(() => source.call(this, ...data));
  };

  return descriptor;
}
