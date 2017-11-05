import {BaseBinding} from './Binding';
import {Container, interfaces} from 'inversify';
import Context = interfaces.Context;

export interface FactoryBinding extends BaseBinding {
  useFactory: (context: Context) => any;
}

export const bindFactory = (container: Container, {provide, useFactory}: FactoryBinding) => {
  container.bind(provide).toDynamicValue(useFactory);
};
