import * as React from 'react';
import {Component, ReactElement} from 'react';

export class Buffer extends Component {
  render() {
    return React.Children
      .toArray(this.props.children)
      .map((child, index) => React.cloneElement(child as ReactElement<any>, {key: index}));
  }
}
