import {inject, interfaces, multiInject} from 'inversify';
import ServiceIdentifier = interfaces.ServiceIdentifier;

export function serviceInject(target: object,
                              propertyKey: string | symbol,
                              parameterIndex: number,
                              identifier?: ServiceIdentifier<any>) {
  const type = Reflect.getMetadata('design:paramtypes', target)[parameterIndex];
  const isArrayType = type === Array;
  const _inject = isArrayType ? multiInject : inject;
  const _identifier = identifier || type;
  _inject(_identifier)(target, propertyKey as string, parameterIndex);
}
