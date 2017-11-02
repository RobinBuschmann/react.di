import {object} from 'prop-types';

export function componentInject(target, propertyKey, identifier?) {
  const type = Reflect.getMetadata('design:type', target, propertyKey);
  const isArrayType = type === Array;
  identifier = identifier || type;
  ensureContainerContextExists(target.constructor);
  setDependentProperty(target, propertyKey, identifier, isArrayType);
}

function setDependentProperty(target, propertyKey, identifier, isArrayType) {
  const GET_KEY = isArrayType ? 'getAll' : 'get';

  Object.defineProperty(target, propertyKey, {
    configurable: true,
    enumerable: true,
    get() {
      if (!this.hasOwnProperty(propertyKey)) {
        const value = this.context.container[GET_KEY](identifier);
        Object.defineProperty(this, propertyKey, {value});
        return value;
      }
    },
    set() {
      // tslint:disable:no-console
      console.warn(`Value cannot be set before it is injected (${target['constructor'].name} -> ${propertyKey})`);
    }
  });
}

function ensureContainerContextExists(componentClass) {
  if (!componentClass.contextTypes) {
    componentClass.contextTypes = {};
  }
  if (!componentClass.contextTypes.container) {
    componentClass.contextTypes.container = object;
  }
}
