import * as React from 'react';
import {configure, mount} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import {expect} from 'chai';
import {Module} from '../../lib/Module';
import {Component} from 'react';
import {Inject} from '../../lib/Inject';
import {AService} from '../setup/AService';
import {TestHelper} from '../setup/TestHelper';

configure({adapter: new Adapter()});

describe('Module', () => {

  describe('simple service injection', () => {

    class Child extends Component<any> {
      @Inject aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }

    it('should render', () => {

      const app = mount(
        <TestHelper getInstance={}>
          <Module>
            <Child onInstance={instance => }/>
          </Module>
        </TestHelper>
      );
      // const children = app.instance();
      expect(app).to.be.ok;
    });

  });

});





