import * as React from 'react';
import {Component, ComponentClass, ReactElement} from 'react';
import {Container} from 'inversify';
import {object} from 'prop-types';

export interface ProviderProps {
  container: Container;
  imports?: Array<ComponentClass<any>>;
}

export class Provider extends Component<ProviderProps> {
  static childContextTypes = {
    container: object.isRequired,
  };
  static contextTypes = {container: object};
  static isReact16Plus = parseFloat(React.version) >= 16;

  constructor(props, context) {
    super(props, context);

    if (!Provider.isReact16Plus) {
      this.render = () => React.Children.only(this.props.children) as any;
    }
  }

  componentWillReceiveProps() {
    // tslint:disable:no-console
    console.warn('Container can only be set once to <Provider> and therefore not be overridden.');
  }

  getChildContext() {
    const {container} = this.props;
    this.trySetParentContainer(container);
    return {container};
  }

  trySetParentContainer(container: Container) {
    if (this.context.container && !container.parent) {
      container.parent = this.context.container;
    }
  }

  render() {
    return React.Children
      .toArray(this.props.children)
      .map((child, index) => React.cloneElement(child as ReactElement<any>, {key: index}));
  }
}
