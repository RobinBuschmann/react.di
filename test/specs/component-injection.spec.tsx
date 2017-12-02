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
import {ABService} from '../setup/ABService';
import {Interceptor, INTERCEPTOR_TOKEN} from '../setup/Interceptor';
import {AInterceptor} from '../setup/AInterceptor';
import {BInterceptor} from '../setup/BInterceptor';

use(sinonChai);
configure({adapter: new Adapter()});

describe('component-injection', () => {

  it('should be able to pass props to annotated component', () => {
    let appInstance: App;

    @Module()
    class App extends Component<{ test: string }> {
      @Inject aService: AService;

      render() {
        appInstance = this;
        return <Buffer/>
      }
    }

    mount(<App test={'test'}/>);
    expect(appInstance.props).to.have.property('test', 'test');
  });

  describe('injection', () => {

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return (<Buffer/>);
      }
    }

    describe('useClass', () => {

      it('should inject services in annotated component', () => {
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

      it('should inject services in components nested in annotated component', () => {
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

      it('should accessible multiple times', () => {
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
        expect(childInstance).to.have.property('aService').which.is.an.instanceOf(AService);
      });

      it('should inject service (shorthand for useClass)', () => {
        let childInstance;

        @Module({
          providers: [AService]
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

      it('should inject service AB for service A', () => {
        let childInstance;

        @Module({
          providers: [{provide: AService, useClass: ABService}]
        })
        class App extends Component {
          render() {
            return <Buffer>
              <Child onInstance={instance => childInstance = instance}/>
            </Buffer>
          }
        }

        mount(<App/>);
        expect(childInstance).to.have.property('aService').which.is.an.instanceOf(ABService);
      });

    });

    describe('useValue', () => {

      it('should inject services in components nested in annotated component', () => {
        let childInstance;

        @Module({
          providers: [{provide: AService, useValue: new AService()}]
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

    });

    describe('useFactory', () => {

      it('should inject services in components nested in annotated component', () => {
        let childInstance;

        @Module({
          providers: [{provide: AService, useFactory: context => new AService()}]
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

    });

    describe('autoBindInjectable', () => {

      it('should inject service without defining provider', () => {
        let childInstance: Child;
        @Module({
          autoBindInjectable: true
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

      it('should inject same instance of service into different components', () => {
        let childInstance1: Child;
        let childInstance2: Child;
        @Module({
          autoBindInjectable: true
        })
        class App extends Component {
          render() {
            return <Buffer>
              <Child onInstance={instance => childInstance1 = instance}/>
              <Child onInstance={instance => childInstance2 = instance}/>
            </Buffer>
          }
        }
        mount(<App/>);
        expect(childInstance1.aService).to.equal(childInstance2.aService);
      });

      it('should inject new instance of service into each component', () => {
        let childInstance1: Child;
        let childInstance2: Child;
        @Module({
          autoBindInjectable: true,
          providers: [{provide: AService, useClass: AService, noSingleton: true}]
        })
        class App extends Component {
          render() {
            return <Buffer>
              <Child onInstance={instance => childInstance1 = instance}/>
              <Child onInstance={instance => childInstance2 = instance}/>
            </Buffer>
          }
        }
        mount(<App/>);
        expect(childInstance1.aService).not.to.equal(childInstance2.aService);
      });

    });

    it('should throw due to missing provider', () => {
      let childInstance: Child;

      @Module()
      class App extends Component {
        render() {
          return <Buffer>
            <Child onInstance={instance => childInstance = instance}/>
          </Buffer>
        }
      }

      mount(<App/>);
      expect(() => childInstance.aService).to.throw(/No matching bindings found for serviceIdentifier: AService/);
    });

    it('should throw cause component is not nested in Module or Provider component', () => {
      let childInstance: Child;
      mount(
        <Buffer>
          <Child onInstance={instance => childInstance = instance}/>
        </Buffer>
      );
      expect(() => childInstance.aService).to.throw(/Component "Child" need to be nested in a Module or Provider Component to use dependency injection/);
    });

    it('should inject same instance of service into different components', () => {
      let childInstance1: Child;
      let childInstance2: Child;
      @Module({
        providers: [AService]
      })
      class App extends Component {
        render() {
          return <Buffer>
            <Child onInstance={instance => childInstance1 = instance}/>
            <Child onInstance={instance => childInstance2 = instance}/>
          </Buffer>
        }
      }
      mount(<App/>);
      expect(childInstance1.aService).to.equal(childInstance2.aService);
    });

    it('should inject new instance of service into each component', () => {
      let childInstance1: Child;
      let childInstance2: Child;
      @Module({
        providers: [{provide: AService, useClass: AService, noSingleton: true}]
      })
      class App extends Component {
        render() {
          return <Buffer>
            <Child onInstance={instance => childInstance1 = instance}/>
            <Child onInstance={instance => childInstance2 = instance}/>
          </Buffer>
        }
      }
      mount(<App/>);
      expect(childInstance1.aService).not.to.equal(childInstance2.aService);
    });

    it('should be able to override to be injected value', () => {
      let childInstance: Child;

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
      expect(() => childInstance.aService = new AService()).to.not.throw();
    });

    describe('via token', () => {

      const SERVICE_TOKEN = 'service_a';

      class Child extends Component<{ onInstance(instance: Child) }> {
        @Inject(SERVICE_TOKEN) aService: AService;

        componentDidMount() {
          this.props.onInstance(this);
        }

        render() {
          return ('test');
        }
      }

      it('should inject service via token (useClass)', () => {
        let childInstance;

        @Module({
          providers: [{provide: SERVICE_TOKEN, useClass: AService}]
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

      it('should inject service via token (useValue)', () => {
        let childInstance;

        @Module({
          providers: [{provide: SERVICE_TOKEN, useValue: new AService()}]
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

      it('should inject service via token (useFactory)', () => {
        let childInstance;

        @Module({
          providers: [{provide: SERVICE_TOKEN, useFactory: context => new AService()}]
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

    });

    describe('multiple service injection', () => {

      class Child extends Component<{ onInstance(instance: Child) }> {
        @Inject(INTERCEPTOR_TOKEN) interceptors: Interceptor[];

        componentDidMount() {
          this.props.onInstance(this);
        }

        render() {
          return ('test');
        }
      }

      it('should inject all services (useClass)', () => {
        let childInstance: Child;

        @Module({
          providers: [
            {provide: INTERCEPTOR_TOKEN, useClass: AInterceptor},
            {provide: INTERCEPTOR_TOKEN, useClass: BInterceptor},
            ]
        })
        class App extends Component {
          render() {
            return <Buffer>
              <Child onInstance={instance => childInstance = instance}/>
            </Buffer>
          }
        }
        mount(<App/>);
        expect(childInstance)
          .to.have.property('interceptors')
          .which.is.an('array')
          .and.which.has.lengthOf(2);
        expect(childInstance.interceptors[0]).to.be.an.instanceOf(AInterceptor);
        expect(childInstance.interceptors[1]).to.be.an.instanceOf(BInterceptor);
      });

    });

    describe('parent module', () => {

      class Child extends Component<{ onInstance(instance: Child) }> {
        @Inject aService: AService;
        @Inject bService: BService;

        componentDidMount() {
          this.props.onInstance(this);
        }

        render() {
          return ('test');
        }
      }

      it('should inherit providers from parent module', () => {
        let childInstance: Child;
        @Module({
          providers: [BService]
        })
        class App extends Component {
          render() {
            return <Buffer>
              <Child onInstance={instance => childInstance = instance}/>
            </Buffer>
          }
        }
        @Module({
          providers: [AService]
        })
        class Root extends Component {
          render() {
            return <App />
          }
        }
        mount(<Root/>);
        expect(childInstance).to.have.property('aService').which.is.an.instanceOf(AService);
        expect(childInstance).to.have.property('bService').which.is.an.instanceOf(BService);
      });

      it('should override providers from parent module', () => {
        let childInstance: Child;
        @Module({
          providers: [
            BService,
            {provide: AService, useClass: ABService},
          ]
        })
        class App extends Component {
          render() {
            return <Buffer>
              <Child onInstance={instance => childInstance = instance}/>
            </Buffer>
          }
        }
        @Module({
          providers: [AService]
        })
        class Root extends Component {
          render() {
            return <App />
          }
        }
        mount(<Root/>);
        expect(childInstance).to.have.property('aService').which.is.an.instanceOf(ABService);
        expect(childInstance).to.have.property('bService').which.is.an.instanceOf(BService);
      });

    });

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
      class Root extends Component {
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
      class CModule {
      }

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
      class Root extends Component {
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

    it('should create same instances for different layers', () => {

      let aChildInstance: AChild;
      let aBChildInstance: ABChild;

      @Module({
        providers: [AService]
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
        providers: [BService]
      })
      class BModule extends Component {
        render() {
          return <Buffer>
            <ABChild onInstance={instance => aBChildInstance = instance}/>
          </Buffer>
        }
      }

      @Module()
      class LayerA extends Component {
        render() {
          return <Buffer>
            <AModule/>
          </Buffer>;
        }
      }

      @Module()
      class Root extends Component {
        render() {
          return <Buffer>
            <LayerA/>
            <BModule/>
          </Buffer>;
        }
      }

      mount(<Root/>);
      expect(aBChildInstance).to.have.property('aService').which.is.an.instanceOf(AService);
      expect(aBChildInstance).to.have.property('bService').which.is.an.instanceOf(BService);
      expect(aBChildInstance.aService).to.equal(aChildInstance.aService);
    });

    it('should not throw even if module which imports another is not nested in a parent module', () => {
      @Module({
        providers: [CService]
      })
      class CModule {
      }

      @Module({
        imports: [CModule],
        providers: [AService]
      })
      class AModule extends Component {
        render() {
          return <Buffer/>
        }
      }
      expect(() => mount(<AModule/>)).to.not.throw();
    });

  });

});
