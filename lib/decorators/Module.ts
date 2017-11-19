import * as React from 'react';
import {Component} from 'react';
import {func} from 'prop-types';
import {Provider} from '../components/Provider';
import {ModuleMeta} from '../models/ModuleMeta';
import {ModuleOptions} from '../interfaces/ModuleOptions';

const contextTypes = {addContainer: func, getContainer: func};

export function Module(options: ModuleOptions) {
  return target => {
    const moduleWrapper = class extends Component {
      container;
      allContainers = new WeakMap();

      static childContextTypes = contextTypes;
      static contextTypes = contextTypes;

      constructor(props, context) {
        super(props, context);
        this.container = moduleMeta.getContainer(this.context);
      }

      getChildContext() {
        return {
          addContainer: (key, container) => this.allContainers.set(key, container),
          getContainer: key => this.allContainers.get(key),
        };
      }

      render() {
        return (
          React.createElement(
            Provider,
            {container: this.container},
            React.createElement(target)
          ) as any
        );
      }
    };

    const moduleMeta = new ModuleMeta(moduleWrapper, options);
    ModuleMeta.setModuleMeta(moduleWrapper, moduleMeta);

    return moduleWrapper;
  }
}
