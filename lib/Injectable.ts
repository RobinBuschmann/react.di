import 'reflect-metadata';
import {injectable} from 'inversify';

export function Injectable(target: object) {
  return injectable()(target);
}
