import {Component, ComponentClass} from 'react';
import {createModuleComponent} from '../module-service';
import {ContainerOptions, createContainerWithBindings} from '../container-service';

export type TestBedProps = ContainerOptions;

export const TestBed: ComponentClass<TestBedProps> = createModuleComponent({
  getContainer(this: Component) {
    return createContainerWithBindings(this.props);
  },
  getChild(this: Component) {
    return this.props.children;
  }
});
