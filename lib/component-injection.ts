import {object} from 'prop-types';
import {Component} from 'react';

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
      checkIfContainerExists(this);
      const value = this.context.container[GET_KEY](identifier);
      Object.defineProperty(this, propertyKey, {value});
      return value;
    },
    set(value) {
      Object.defineProperty(this, propertyKey, {value});
    }
  });
}

function checkIfContainerExists(component: Component) {
  if (!component.context || !component.context.container) {
    throw new Error(`Component "${component.constructor.name}" need to be nested in a Module or Provider Component` +
      ` to use dependency injection.`);
  }
}

function ensureContainerContextExists(componentClass) {
  if (!componentClass.contextTypes) {
    componentClass.contextTypes = {};
  }
  if (!componentClass.contextTypes.container) {
    componentClass.contextTypes.container = object;
  }
}
