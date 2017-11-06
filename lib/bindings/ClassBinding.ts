import {BaseBinding} from './Binding';
import {Container, interfaces} from 'inversify';
import Newable = interfaces.Newable;

export interface ClassBinding extends BaseBinding {
  useClass: Newable<any>;
  noSingleton?: boolean;
}

export const bindClass = (container: Container, {provide, useClass, noSingleton}: ClassBinding) => {
  const binding = container.bind(provide).to(useClass);
  if (noSingleton) {
    binding.inTransientScope();
  }
};

