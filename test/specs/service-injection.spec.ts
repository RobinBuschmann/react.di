import {Container} from 'inversify';
import {expect} from 'chai';
import {Injectable} from '../../lib/decorators/Injectable';
import {AService} from '../setup/AService';
import {Inject} from '../../lib/decorators/Inject';
import {BService} from '../setup/BService';
import {ABService} from '../setup/ABService';
import {Interceptor, INTERCEPTOR_TOKEN} from '../setup/Interceptor';
import {AInterceptor} from '../setup/AInterceptor';
import {BInterceptor} from '../setup/BInterceptor';

describe('service-injection', () => {

  const container = new Container({autoBindInjectable: true});

  @Injectable
  class Service {
    constructor(@Inject public bService: BService,
                @Inject public aService: AService,
                @Inject(INTERCEPTOR_TOKEN) public interceptors: Interceptor[],) {
    }
  }

  container.bind(AService).to(ABService);
  container.bind(INTERCEPTOR_TOKEN).to(AInterceptor);
  container.bind(INTERCEPTOR_TOKEN).to(BInterceptor);

  it('should inject service', () => {
    const service = container.get(Service);
    expect(service).to.have.property('bService').which.is.an.instanceof(BService);
  });

  it('should inject service AB for A', () => {
    const service = container.get(Service);
    expect(service).to.have.property('aService').which.is.an.instanceof(ABService);
  });

  it('should multi-inject all interceptors', () => {
    const service = container.get(Service);
    expect(service)
      .to.have.property('interceptors')
      .which.is.an('array')
      .and.which.has.lengthOf(2);
    expect(service.interceptors[0]).to.be.an.instanceOf(AInterceptor);
    expect(service.interceptors[1]).to.be.an.instanceOf(BInterceptor);
  });

});
