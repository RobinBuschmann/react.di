import {Binding, executeBindings} from './bindings/Binding';
import {Container, interfaces} from 'inversify';
import {getBindingDictionary} from 'inversify/lib/planning/planner';

export interface ContainerOptions {
  providers?: Binding[];
  autoBindInjectable?: boolean;
}

export function createContainerWithBindings({autoBindInjectable, providers}: ContainerOptions) {
  const DEFAULT_AUTO_BIND = false;
  const container = new Container({
    defaultScope: 'Singleton',
    autoBindInjectable: autoBindInjectable !== void 0 ? autoBindInjectable : DEFAULT_AUTO_BIND
  });
  executeBindings(container, providers);
  return container;
}

export function merge(container1: Container, container2: Container): Container {
  const container = new Container();
  const bindingDictionary: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container);
  const bindingDictionary1: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container1);
  const bindingDictionary2: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container2);

  function copyDictionary(origin: interfaces.Lookup<interfaces.Binding<any>>,
                          destination: interfaces.Lookup<interfaces.Binding<any>>) {
    origin.traverse((key, value) => {
      value.forEach((binding) => {
        destination.add(binding.serviceIdentifier, binding);
      });
    });
  }

  copyDictionary(bindingDictionary1, bindingDictionary);
  copyDictionary(bindingDictionary2, bindingDictionary);

  return container;
}
