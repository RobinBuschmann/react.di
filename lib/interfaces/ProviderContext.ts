import {Container} from 'inversify';
import {ComponentClass} from 'react';

export interface ProviderContext {
  addContainer: (key: ComponentClass<any>, container: Container) => void;
  getContainer: (key: ComponentClass<any>) => Container;
}
