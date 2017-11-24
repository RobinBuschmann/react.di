import 'reflect-metadata';
import {interfaces} from 'inversify';
import ServiceIdentifier = interfaces.ServiceIdentifier;
import {componentInject} from '../component-injection';
import {serviceInject} from '../service-injection';

export function Inject(target: object, propertyKey: string | symbol, parameterIndex: number);
export function Inject(target: object, propertyKey: string | symbol);
export function Inject(identifier: any);
export function Inject(...args: any[]) {
  if (args.length > 1) {
    const [target, propertyKey, parameterIndex] = args;
    decorate(target, propertyKey, parameterIndex);
  } else {
    const identifier = args[0];
    return (target: object, propertyKey: string | symbol, parameterIndex?: number) => {
      decorate(target, propertyKey, parameterIndex, identifier);
    };
  }
}

function decorate(target: object,
                  propertyKey: string | symbol,
                  parameterIndex: number | undefined,
                  identifier?: ServiceIdentifier<any>) {
  if (typeof parameterIndex === 'number') {
    serviceInject(target, propertyKey, parameterIndex, identifier);
  } else {
    componentInject(target, propertyKey, identifier);
  }
}
