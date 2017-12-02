import {Component} from 'react';
import {createModuleComponent} from '../module-service';
import {ContainerOptions, createContainerWithBindings} from '../container-service';

export type TestBedProps = ContainerOptions;

// Workaround, cause ComponentClass leads to tsc error
export class TestBedType extends Component<TestBedProps> {

  /* istanbul ignore next */
  render() {
    return {} as any;
  }
}

export const TestBed: typeof TestBedType = createModuleComponent({
  getContainer(this: Component) {
    return createContainerWithBindings(this.props);
  },
  getChild(this: Component) {
    return this.props.children;
  }
});
