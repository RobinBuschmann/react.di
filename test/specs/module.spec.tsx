import * as React from 'react';
import {configure, mount} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import {expect} from 'chai';
import {Module} from '../../lib/Module';
import {Component} from 'react';
import {Inject} from '../../lib/Inject';
import {AService} from '../setup/AService';
import {Buffer} from '../setup/Buffer';

configure({adapter: new Adapter()});

describe('Module', () => {

  describe('simple service injection into react component', () => {

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }

    it('should inject service (useClass)', () => {
      let child;
      mount(
        <Module providers={[{provide: AService, useClass: AService}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service (shorthand for useClass)', () => {
      let child;
      mount(
        <Module providers={[AService]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service (useValue)', () => {
      let child;
      mount(
        <Module providers={[{provide: AService, useValue: new AService()}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service (useFactory)', () => {
      let child;
      mount(
        <Module providers={[{provide: AService, useFactory: () => new AService()}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service without defining provider due to "autoBindInjectable" is true (uses useClass internally)', () => {
      let child: Child;
      mount(
        <Module autoBindInjectable={true}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should throw due to missing provider', () => {
      let child: Child;
      mount(
        <Module>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(() => child.aService).to.throw(/No matching bindings found for serviceIdentifier: AService/);
    });

  });

});





