import * as React from 'react';
import {Component, ReactNode} from 'react';
import {Provider} from './components/Provider';
import {object} from 'prop-types';
import {Container} from 'inversify';

export interface ModuleCreationOptions {
  getContainer(this: Component): Container;
  getChild(this: Component): ReactNode;
}

export function createModuleComponent({getContainer, getChild}: ModuleCreationOptions) {
  const contextTypes = {childContainers: object};
  return class extends Component {
    container: Container;

    static childContextTypes = contextTypes;
    static contextTypes = contextTypes;

    constructor(props, context) {
      super(props, context);
      this.context.childContainers = this.context.childContainers || new WeakMap();
      this.container = getContainer.call(this);
    }

    getChildContext() {
      return {
        childContainers: this.context.childContainers,
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
