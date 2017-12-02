import {Container} from 'inversify';

export interface ProviderContext {
  childContainers: WeakMap<any, Container>;
}
