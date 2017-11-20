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
import {CService} from '../setup/CService';

use(sinonChai);
configure({adapter: new Adapter()});

describe('Module (decorator)', () => {

  it('should allow to inject services in annotated component', () => {
    let appInstance;

    @Module({
      providers: [{provide: AService, useClass: AService}]
    })
    class App extends Component {
      @Inject aService: AService;
      render() {
        appInstance = this;
        return <Buffer/>
      }
    }
    mount(<App/>);
    expect(appInstance).to.have.property('aService').which.is.an.instanceOf(AService);
  });

  it('should allow to inject services in components nested in annotated component', () => {
    let childInstance;

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject aService: AService;
      componentDidMount() {
        this.props.onInstance(this);
      }
      render() {
        return (<Buffer/>);
      }
    }

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

  describe('importing modules', () => {

    class AChild extends Component<{ onInstance(instance: AChild) }> {
      @Inject aService: AService;
      componentDidMount() {
        this.props.onInstance(this);
      }
      render() {
        return (<Buffer/>);
      }
    }
    class ABChild extends Component<{ onInstance(instance: ABChild) }> {
      @Inject aService: AService;
      @Inject bService: BService;
      componentDidMount() {
        this.props.onInstance(this);
      }
      render() {
        return (<Buffer/>);
      }
    }
    class ABCChild extends Component<{ onInstance(instance: ABCChild) }> {
      @Inject aService: AService;
      @Inject bService: BService;
      @Inject cService: CService;
      componentDidMount() {
        this.props.onInstance(this);
      }
      render() {
        return (<Buffer/>);
      }
    }

    it('should allow to inject services imported through another module', () => {
      let aChildInstance: AChild;
      let aBChildInstance: ABChild;

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
            <ABChild onInstance={instance => aBChildInstance = instance}/>
          </Buffer>
        }
      }
      @Module()
      class Root extends Component  {
        render() {
          return <Buffer>
            <BModule/>
            <AModule/>
          </Buffer>;
        }
      }
      mount(<Root/>);
      expect(aBChildInstance).to.have.property('aService').which.is.an.instanceOf(AService);
      expect(aBChildInstance).to.have.property('bService').which.is.an.instanceOf(BService);
      expect(aBChildInstance.aService).to.equal(aChildInstance.aService);
    });

    it('should not allow to inject services through third-party import', () => {
      let abcChildInstance: ABCChild;

      @Module({
        providers: [CService]
      })
      class CModule {}

      @Module({
        imports: [CModule],
        providers: [AService]
      })
      class AModule extends Component {
        render() {
          return <Buffer/>
        }
      }
      @Module({
        imports: [AModule],
        providers: [BService]
      })
      class BModule extends Component {
        render() {
          return <Buffer>
            <ABCChild onInstance={instance => abcChildInstance = instance}/>
          </Buffer>
        }
      }
      @Module()
      class Root extends Component  {
        render() {
          return <Buffer>
            <BModule/>
            <AModule/>
          </Buffer>;
        }
      }
      mount(<Root/>);
      expect(abcChildInstance).to.have.property('aService').which.is.an.instanceOf(AService);
      expect(abcChildInstance).to.have.property('bService').which.is.an.instanceOf(BService);
      expect(() => abcChildInstance.cService).to.throw();
    });

  });

});
