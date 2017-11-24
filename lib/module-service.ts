import * as React from 'react';
import {Component, ReactNode} from 'react';
import {Provider} from './components/Provider';
import {func} from 'prop-types';
import {Container} from 'inversify';

export interface ModuleCreationOptions {
  getContainer(this: Component): Container;
  getChild(this: Component): ReactNode;
}

export function createModuleComponent({getContainer, getChild}: ModuleCreationOptions) {
  const contextTypes = {addContainer: func, getContainer: func};
  return class extends Component {
    container: Container;
    childContainers = new WeakMap();

    static childContextTypes = contextTypes;
    static contextTypes = contextTypes;

    constructor(props, context) {
      super(props, context);
      this.container = getContainer.call(this);
    }

    getChildContext() {
      return {
        addContainer: (key, container) => this.childContainers.set(key, container),
        getContainer: key => this.childContainers.get(key),
      };
    }

    render() {
      return (
        React.createElement(
          Provider,
          {container: this.container},
          getChild.call(this)
        ) as any
      );
    }
  };
}
