import {ComponentClass} from 'react';
import {Binding} from '../bindings/Binding';

export type Imports = Array<ComponentClass<any>>;

export interface ModuleOptions {
  imports?: Imports;
  providers: Binding[];
  autoBindInjectable?: boolean;
}
