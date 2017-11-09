import * as React from 'react';
import * as Adapter from 'enzyme-adapter-react-16';
import {configure, mount} from 'enzyme';
import {use, expect} from 'chai';
import * as sinonChai from 'sinon-chai';
import {Module} from '../../lib/Module';
import {Buffer} from '../setup/Buffer';
import {Provider} from '../../lib/Provider';

use(sinonChai);
configure({adapter: new Adapter()});

describe('Module', () => {

  it('should render multiple nested children, without wrapping them in an additional container', () => {
    const wrapper = mount(
      <Module>
        <Buffer/>
        <Buffer/>
        <Buffer/>
      </Module>
    );
    expect(wrapper.children().children().length).to.eql(3);
  });

  it('should throw in case of multiple nested children due to react less than 16', () => {
    Provider.isReact16Plus = false;
    expect(() => mount(
      <Module>
        <Buffer/>
        <Buffer/>
        <Buffer/>
      </Module>
    )).to.throw();
    Provider.isReact16Plus = true;
  });

  it('should render one nested child', () => {
    Provider.isReact16Plus = false;
    expect(() => mount(
      <Module>
        <Buffer/>
      </Module>
    )).to.not.throw();
    Provider.isReact16Plus = true;
  });

});
