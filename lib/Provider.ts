import * as React from 'react';
import {Component} from 'react';
import {Container} from 'inversify';
import {object} from 'prop-types';

export interface ProviderProps {
  container: Container;
}

export class Provider extends Component<ProviderProps> {
  static childContextTypes = {container: object.isRequired};
  static contextTypes = {container: object};

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
    return React.Children.only(this.props.children);
  }
}
