import {ComponentClass} from 'react';
import {executeBindings} from '../bindings/Binding';
import {ProviderContext} from '../interfaces/ProviderContext';
import {Container, interfaces} from 'inversify';
import {Imports, ModuleOptions} from '../interfaces/ModuleOptions';
import {getBindingDictionary} from 'inversify/lib/planning/planner';

const MODULE_META_DATA = 'react.di-module';

export class ModuleMeta {

  constructor(private componentClass: ComponentClass<any>,
              private options: ModuleOptions) {

  }

  getContainer(context?: ProviderContext) {
    let container;
    if (context && context.getContainer) {
      container = context.getContainer(this.componentClass);
    }
    if (!container) {
      container = this.createContainerWithBindings();
      if (context && context.getContainer) {
        context.addContainer(this.componentClass, container);
      }
      if (this.options.imports) {
        if (!context) {
          throw new Error('TODO');
        }
        container = this.getContainerWithImports(this.options.imports, container, context);
      }
    }
    return container;
  }

  private createContainerWithBindings() {
    const {autoBindInjectable} = this.options;
    const DEFAULT_AUTO_BIND = false;
    const container = new Container({
      defaultScope: 'Singleton',
      autoBindInjectable: autoBindInjectable !== void 0 ? autoBindInjectable : DEFAULT_AUTO_BIND
    });
    executeBindings(container, this.options.providers);
    return container;
  }

  private getContainerWithImports(imports: Imports, container: Container, context: ProviderContext) {
    return imports.reduce((container, componentClass) => {
      let toImportContainer = context.getContainer(componentClass);
      if (!toImportContainer) {
        const moduleMeta = ModuleMeta.getModuleMeta(componentClass);
        toImportContainer = moduleMeta.getContainer(context);
        context.addContainer(componentClass, toImportContainer);
      }
      return this.merge(container, toImportContainer);
    }, container) as any;
  }

  private merge(container1: Container, container2: Container): Container {

    let container = new Container();
    let bindingDictionary: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container);
    let bindingDictionary1: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container1);
    let bindingDictionary2: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container2);

    function copyDictionary(
      origin: interfaces.Lookup<interfaces.Binding<any>>,
      destination: interfaces.Lookup<interfaces.Binding<any>>
    ) {
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

  static getModuleMeta(target: ComponentClass<any>) {
    return Reflect.getMetadata(MODULE_META_DATA, target);
  }

  static setModuleMeta(target: ComponentClass<any>, moduleMeta: any) {
    Reflect.defineMetadata(MODULE_META_DATA, moduleMeta, target);
  }

}
