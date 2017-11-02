import {Container, interfaces} from 'inversify';
import ServiceIdentifier = interfaces.ServiceIdentifier;
import {bindClass, ClassBinding} from './ClassBinding';
import {bindValue, ValueBinding} from './ValueBinding';
import {bindFactory, FactoryBinding} from './FactoryBinding';
import Newable = interfaces.Newable;

export type Binding = ClassBinding | ValueBinding | FactoryBinding | Newable<any>;

export interface BaseBinding {
  provide: ServiceIdentifier<any>;
}

const bindings = {
  useClass: bindClass,
  useValue: bindValue,
  useFactory: bindFactory,
};

export const executeBindings = (container: Container, providers: Binding[] = []) => {
  providers.forEach((provider) => {
    if (typeof provider === 'function') {
      bindings.useClass(container, {useClass: provider, provide: provider});
    } else {
      Object.keys(bindings)
        .forEach(key => {
          if (provider[key]) {
            bindings[key](container, provider);
          }
        });
    }
  });
};
