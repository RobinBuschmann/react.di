import {Binding} from '../bindings/Binding';

export type Imports = any[];

export interface ModuleOptions {
  imports?: Imports;
  providers?: Binding[];
  autoBindInjectable?: boolean;
}
