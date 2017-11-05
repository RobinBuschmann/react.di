import {BaseBinding} from './Binding';
import {Container} from 'inversify';

export interface ValueBinding extends BaseBinding {
  useValue: any;
}

export const bindValue = (container: Container, {provide, useValue}: ValueBinding) => {
  container.bind(provide).toConstantValue(useValue);
};
