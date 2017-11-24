import {ProviderContext} from '../interfaces/ProviderContext';
import {Container} from 'inversify';
import {Imports, ModuleOptions} from '../interfaces/ModuleOptions';
import {createContainerWithBindings, merge} from '../container-service';

const MODULE_META_DATA = 'react.di-module';

export class Module {

  constructor(private target: any,
              private options: ModuleOptions) {
  }

  getExternalContainer(context?: ProviderContext) {
    let container;
    if (this.isProviderContext(context)) {
      container = (context as ProviderContext).getContainer(this.target);
    }
    if (!container) {
      container = createContainerWithBindings(this.options);
      if (this.isProviderContext(context)) {
        (context as ProviderContext).addContainer(this.target, container);
      }
    }
    return container;
  }

  getInternalContainer(context?: ProviderContext) {
    let container = this.getExternalContainer(context);
    if (this.options.imports) {
      if (!this.isProviderContext(context)) {
        throw new Error(`Imports not supported here: When using imports with ${this.target.name}` +
        ` this module need to be nested in another module.`);
      }
      container = this.getContainerWithImports(this.options.imports, container, context);
    }
    return container;
  }

  private isProviderContext(context?: ProviderContext) {
    return context && context.addContainer && context.getContainer;
  }

  private getContainerWithImports(imports: Imports, container: Container, context?: ProviderContext) {
    return imports.reduce((container, toImportTarget) => {
      const module = Module.getModule(toImportTarget);
      const toImportContainer = module.getExternalContainer(context);
      return merge(container, toImportContainer);
    }, container);
  }

  static getModule(target: any): Module {
    return Reflect.getMetadata(MODULE_META_DATA, target);
  }

  static setModule(target: any, moduleMeta: Module) {
    Reflect.defineMetadata(MODULE_META_DATA, moduleMeta, target);
  }

}
