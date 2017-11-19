import * as React from 'react';
import * as Adapter from 'enzyme-adapter-react-16';
import {configure, mount} from 'enzyme';
import {use, expect} from 'chai';
import * as sinonChai from 'sinon-chai';
import {Buffer} from '../setup/Buffer';
import {Component} from 'react';
import {Module} from '../../lib/decorators/Module';
import {AService} from '../setup/AService';
import {Inject} from '../../lib/decorators/Inject';
import {BService} from '../setup/BService';

use(sinonChai);
configure({adapter: new Adapter()});

describe('Module (decorator)', () => {

  it('', () => {
    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }

    let childInstance;

    @Module({
      providers: [{provide: AService, useClass: AService}]
    })
    class App extends Component {
      render() {
        return <Buffer>
          <Child onInstance={instance => childInstance = instance}/>
        </Buffer>
      }
    }
    mount(<App/>);
    expect(childInstance).to.have.property('aService').which.is.an.instanceOf(AService);

  });

  it('', () => {
    let aChildInstance: AChild;
    let bChildInstance: BChild;
    class AChild extends Component<{ onInstance(instance: AChild) }> {
      @Inject aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }
    class BChild extends Component<{ onInstance(instance: BChild) }> {
      @Inject aService: AService;
      @Inject bService: BService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }
    @Module({
      providers: [{provide: AService, useClass: AService}]
    })
    class AModule extends Component {
      render() {
        return <Buffer>
          <AChild onInstance={instance => aChildInstance = instance}/>
        </Buffer>
      }
    }

    @Module({
      imports: [AModule],
      providers: [{provide: BService, useClass: BService}]
    })
    class BModule extends Component {
      render() {
        return <Buffer>
          <BChild onInstance={instance => bChildInstance = instance}/>
        </Buffer>
      }
    }
    @Module({
      providers: [{provide: AService, useClass: AService}]
    })
    class Root extends Component  {
      render() {
        return <Buffer>
          <BModule/>
          <AModule/>
        </Buffer>;
      }
    }
    mount(<Root/>);
    expect(bChildInstance).to.have.property('aService').which.is.an.instanceOf(AService);
    expect(bChildInstance).to.have.property('bService').which.is.an.instanceOf(BService);
    aChildInstance.aService.value = 'test';
    expect(bChildInstance.aService.value).to.equal(aChildInstance.aService.value);
  });

});
