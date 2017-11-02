"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var inversify_1 = require("inversify");
var react_1 = require("react");
var Provider_1 = require("./Provider");
var Binding_1 = require("./bindings/Binding");
var Module = (function (_super) {
    __extends(Module, _super);
    function Module(props, contenxt) {
        var _this = _super.call(this, props, contenxt) || this;
        _this.container = _this.createContainer(props);
        Binding_1.executeBindings(_this.container, props.providers);
        return _this;
    }
    Module.prototype.componentWillReceiveProps = function (props) {
        Binding_1.executeBindings(this.container, props.providers);
    };
    Module.prototype.createContainer = function (props) {
        var DEFAULT_AUTO_BIND = false;
        return new inversify_1.Container({
            autoBindInjectable: props.autoBindInjectable !== void 0 ? props.autoBindInjectable : DEFAULT_AUTO_BIND
        });
    };
    Module.prototype.render = function () {
        return (<Provider_1.Provider container={this.container}>
        {this.props.children}
      </Provider_1.Provider>);
    };
    return Module;
}(react_1.Component));
exports.Module = Module;
