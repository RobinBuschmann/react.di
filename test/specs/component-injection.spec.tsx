import * as React from 'react';
import {spy} from 'sinon';
import * as Adapter from 'enzyme-adapter-react-16';
import {configure, mount} from 'enzyme';
import {expect, use} from 'chai';
import * as sinonChai from 'sinon-chai';
import {Module} from '../../lib/components/Module';
import {Component} from 'react';
import {Inject} from '../../lib/decorators/Inject';
import {AService} from '../setup/AService';
import {Buffer} from '../setup/Buffer';
import {ABService} from '../setup/ABService';
import {Interceptor, INTERCEPTOR_TOKEN} from '../setup/Interceptor';
import {AInterceptor} from '../setup/AInterceptor';
import {BInterceptor} from '../setup/BInterceptor';
import {BService} from '../setup/BService';
import {Container, interfaces} from 'inversify';
import {Injectable} from '../../lib/decorators/Injectable';
import {getBindingDictionary} from 'inversify/lib/planning/planner';

use(sinonChai);
configure({adapter: new Adapter()});

describe('component-injection', () => {

  describe('simple service injection', () => {

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }

    describe('useClass', () => {

      it('should inject service', () => {
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

      it('should accessible multiple times', () => {
        let child;
        mount(
          <Module providers={[{provide: AService, useClass: AService}]}>
            <Buffer>
              <Child onInstance={instance => child = instance}/>
            </Buffer>
          </Module>
        );
        expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
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

      it('should inject service AB for service A', () => {
        let child;
        mount(
          <Module providers={[{provide: AService, useClass: ABService}]}>
            <Buffer>
              <Child onInstance={instance => child = instance}/>
            </Buffer>
          </Module>
        );
        expect(child).to.have.property('aService').which.is.an.instanceOf(ABService);
      });

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

    it('should throw cause component is not nested in Module or Provider component', () => {
      let child: Child;
      mount(
        <Buffer>
          <Child onInstance={instance => child = instance}/>
        </Buffer>
      );
      expect(() => child.aService).to.throw(/Component "Child" need to be nested in a Module or Provider Component to use dependency injection/);
    });

    describe('autoBindInjectable', () => {

      it('should inject service without defining provider', () => {
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

      it('should inject same instance of service into different components', () => {
        let child1: Child;
        let child2: Child;
        mount(
          <Module autoBindInjectable={true}>
            <Buffer>
              <Child onInstance={instance => child1 = instance}/>
              <Child onInstance={instance => child2 = instance}/>
            </Buffer>
          </Module>
        );
        expect(child1.aService).to.equal(child2.aService);
      });

      it('should inject new instance of service into each component', () => {
        let child1: Child;
        let child2: Child;
        mount(
          <Module autoBindInjectable={true}
                  providers={[{provide: AService, useClass: AService, noSingleton: true}]}>
            <Buffer>
              <Child onInstance={instance => child1 = instance}/>
              <Child onInstance={instance => child2 = instance}/>
            </Buffer>
          </Module>
        );
        expect(child1.aService).not.to.equal(child2.aService);
      });

    });

    it('should inject same instance of service into different components', () => {
      let child1: Child;
      let child2: Child;
      mount(
        <Module providers={[AService]}>
          <Buffer>
            <Child onInstance={instance => child1 = instance}/>
            <Child onInstance={instance => child2 = instance}/>
          </Buffer>
        </Module>
      );
      expect(child1.aService).to.equal(child2.aService);
    });

    it('should inject new instance of service into each component', () => {
      let child1: Child;
      let child2: Child;
      mount(
        <Module providers={[{provide: AService, useClass: AService, noSingleton: true}]}>
          <Buffer>
            <Child onInstance={instance => child1 = instance}/>
            <Child onInstance={instance => child2 = instance}/>
          </Buffer>
        </Module>
      );
      expect(child1.aService).not.to.equal(child2.aService);
    });

  });

  describe('service injection via token', () => {

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
      let child;
      mount(
        <Module providers={[{provide: SERVICE_TOKEN, useClass: AService}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service via token (useValue)', () => {
      let child;
      mount(
        <Module providers={[{provide: SERVICE_TOKEN, useValue: new AService()}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service via token (useFactory)', () => {
      let child;
      mount(
        <Module providers={[{provide: SERVICE_TOKEN, useFactory: () => new AService()}]}>
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
      expect(() => child.aService).to.throw(/No matching bindings found for serviceIdentifier: service_a/);
    });

  });

  describe('multi service injection', () => {

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
      let child;
      mount(
        <Module providers={[
          {provide: INTERCEPTOR_TOKEN, useClass: AInterceptor},
          {provide: INTERCEPTOR_TOKEN, useClass: BInterceptor},
        ]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child)
        .to.have.property('interceptors')
        .which.is.an('array')
        .and.which.has.lengthOf(2);
      expect(child.interceptors[0]).to.be.an.instanceOf(AInterceptor);
      expect(child.interceptors[1]).to.be.an.instanceOf(BInterceptor);
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
      let child: Child;
      mount(
        <Module providers={[AService]}>
          <Module providers={[BService]}>
            <Buffer>
              <Child onInstance={instance => child = instance}/>
            </Buffer>
          </Module>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
      expect(child).to.have.property('bService').which.is.an.instanceOf(BService);
    });

    it('should override providers from parent module', () => {
      let child: Child;
      mount(
        <Module providers={[AService]}>
          <Module providers={[
            BService,
            {provide: AService, useClass: ABService}
          ]}>
            <Buffer>
              <Child onInstance={instance => child = instance}/>
            </Buffer>
          </Module>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(ABService);
      expect(child).to.have.property('bService').which.is.an.instanceOf(BService);
    });

  });

  it('should log warning when trying to overwrite to-be-injected service', () => {

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      provokeWaring() {
        this.aService = {} as any;
      }

      render() {
        return ('test');
      }
    }

    let child: Child;
    mount(
      <Module>
        <Buffer>
          <Child onInstance={instance => child = instance}/>
        </Buffer>
      </Module>
    );

    const warnSpy = spy(console, 'warn');
    child.provokeWaring();
    expect(warnSpy).to.be.called;
  });

  function merge(container1, container2) {
    const container = new Container();
    const bindingDictionary: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container);
    const bindingDictionary1: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container1);
    const bindingDictionary2: interfaces.Lookup<interfaces.Binding<any>> = getBindingDictionary(container2);

    function copyDictionary(
      origin: interfaces.Lookup<interfaces.Binding<any>>,
      destination: interfaces.Lookup<interfaces.Binding<any>>
    ) {
      origin.traverse((key, value) => {
        value.forEach((binding) => {
          destination.add(binding.serviceIdentifier, binding);
        });
      });
    }
    copyDictionary(bindingDictionary1, bindingDictionary);
    copyDictionary(bindingDictionary2, bindingDictionary);

    return container;
  }

  it('should run', () => {

    @Injectable
    class Service {
      private value: string;
      setValue(value: string) {
        this.value = value;
      }
    }

    const container1 = new Container({defaultScope: 'Singleton'});
    container1.bind(Service).toSelf();

    const service1 = container1.get(Service);
    service1.setValue('test');

    const container2 = new Container({defaultScope: 'Singleton'});
    const container =  merge(container1, container2);

    const service = container.get(Service);
    console.log(service);
  });

});
