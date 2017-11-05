import * as React from 'react';
import {Container} from 'inversify';
import {Component} from 'react';
import {Provider} from './Provider';
import {Binding, executeBindings} from './bindings/Binding';

interface ModuleProps {
  providers?: Binding[];
  autoBindInjectable?: boolean;
}

export class Module extends Component<ModuleProps> {

  private container;

  constructor(props: ModuleProps, contenxt) {
    super(props, contenxt);
    this.container = this.createContainer(props);
    executeBindings(this.container, props.providers);
  }

  componentWillReceiveProps(props: ModuleProps) {
    executeBindings(this.container, props.providers);
  }

  createContainer(props: ModuleProps) {
    const DEFAULT_AUTO_BIND = false;
    return new Container({
      autoBindInjectable: props.autoBindInjectable !== void 0 ? props.autoBindInjectable : DEFAULT_AUTO_BIND
    });
  }

  render() {
    return (
      React.createElement(Provider, { container: this.container }, this.props.children)
    );
  }
}
