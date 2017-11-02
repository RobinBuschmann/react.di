import * as React from 'react';
import {Component} from 'react';

interface TestHelperProps {
  getInstance();
}

export class TestHelper extends Component<TestHelperProps> {

  instances: any[] = [];

  componentWillReceiveProps({getInstance}) {
    this.instances.push(getInstance());
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
