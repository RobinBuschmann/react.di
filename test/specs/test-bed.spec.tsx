import * as React from 'react';
import * as Adapter from 'enzyme-adapter-react-16';
import {configure, mount} from 'enzyme';
import {expect} from 'chai';
import {Buffer} from '../setup/Buffer';
import {TestBed} from '../../lib/components/TestBed';
import {Component} from 'react';
import {Inject} from '../../lib/decorators/Inject';
import {AService} from '../setup/AService';

configure({adapter: new Adapter()});

describe('TestBed', () => {

  class Child extends Component<{ onInstance(instance: Child) }> {
    @Inject aService: AService;

    componentDidMount() {
      this.props.onInstance(this);
    }

    render() {
      return (<Buffer/>);
    }
  }

  it('should inject services', () => {
    let childInstance: Child;
    mount(
      <TestBed providers={[AService]}>
        <Buffer>
          <Child onInstance={instance => childInstance = instance}/>
        </Buffer>
      </TestBed>
    );
    expect(childInstance).to.have.property('aService').that.is.instanceOf(AService);
  });

  it('should inject services (autoBindInjectable)', () => {
    let childInstance: Child;
    mount(
      <TestBed autoBindInjectable={true}>
        <Buffer>
          <Child onInstance={instance => childInstance = instance}/>
        </Buffer>
      </TestBed>
    );
    expect(childInstance).to.have.property('aService').that.is.instanceOf(AService);
  });

});
