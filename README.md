[![NPM](https://img.shields.io/npm/v/react.di.svg)](https://www.npmjs.com/package/react.di)
[![Build Status](https://travis-ci.org/RobinBuschmann/react.di.svg?branch=master)](https://travis-ci.org/RobinBuschmann/react.di)
[![codecov](https://codecov.io/gh/RobinBuschmann/react.di/branch/master/graph/badge.svg)](https://codecov.io/gh/RobinBuschmann/react.di)

# react.di
Dependency injection for react based upon [inversify](https://github.com/inversify/InversifyJS).

 - [Installation](#installation)
 - [Getting started](#getting-started)
 - [Injection](#injection)
 - [Sharing providers](#sharing-providers)
    - [Importing modules](#importing-modules-in-other-modules)
    - [Hierarchical shared providers](#hierarchical-shared-providers)
 - [Testing](#testing)
 - [API](#api)
    - [Injectable](#injectable)
    - [Inject](#inject)
        - [Injection via tokens](#injection-via-tokens)
        - [Multi injection](#multi-injection)
        - [Inject into React Components](#inject-into-react-components)
        - [Inject into Services](#inject-into-services)
    - [Module](#module)
    - [TestBed](#test-bed-react-component)
    - [providers (Property)](#providers-property)
        - [Injecting a class constructor](#injecting-a-class-constructor)
        - [Injecting a value](#injecting-a-value)
        - [Injection via factories](#injection-via-factories)
    - [autoBindInjectable (Property)](#autobindinjectable-property)
    - [Module inheritance](#module-inheritance)
    - [Provider (React Component)](#provider-react-component)

## Installation
```
npm install react.di reflect-metadata --save
```

Your `tsconfig.json` needs to be configured with  the following flags:
```
"experimentalDecorators": true,
"emitDecoratorMetadata": true
```

## Getting started
#### 1. Define injectables (values/class)
*Service*
```typescript
import {Injectable} from 'react.di';

@Injectable
export class UserService {
  constructor(@Inject private httpClient: SomeHttpClient) {}

  getUser() {}
}
```
*Config*
```typescript
const CONFIG_TOKEN = 'config'; // or Symbol('config');
const config: Config = {...};
```
#### 2. Inject service/value into react component
```typescript jsx
import {Inject} from 'react.di';

class UserContainer extends Component<any, any> {
  @Inject userService: UserService;
  @Inject(CONFIG_TOKEN) config: Config;
  
  async componentDidMount() {
    const user = await this.userService.getUser();
    this.setState({user});
  }

  render() {
    return (<User user={this.state.user} />); 
  }
}
```
#### 3. Setup module
```typescript jsx
import {Module} from 'react.di';

@Module({
  providers: [
    {provide: UserService, useClass: UserService},
    UserService, // or shorthand
    {provide: CONFIG_TOKEN, useValue: config},
    {provide: CONFIG_TOKEN, useFactory: context => config}, // or using factory
  ]
})
class App extends Component {
  render() {
    return (
        <Panel>
          <UserContainer/>
        </Panel>
    );
  }
}
```

## Injection

### Injection from class references
If you want to inject a service instance, simply mark the property with `@Inject`.
The type from which the instance will be created, will be derived from the
annotated type. Notice, that the type needs to be a class. An interface won't 
work, cause it will not exist on runtime anymore (See 
[Injection via tokens](#injection-via-tokens) to get it work with interfaces). 
```typescript
@Inject userService: UserService;
```
A services class need to be annotated with `@Injectable` otherwise it will not
be - of course - injectable.

### Injection via tokens
Dependencies can also be identified by a token. This makes sense when injecting
a value (for example a configuration) or if you want annotate these properties
with interfaces instead of class references.
```typescript
@Inject(CONFIG_TOKEN) config: Config;
```

### Multi injection
Multi injection means that all providers for a specified identifier
will be injected.
So if the annotated type of the dependency is of type `Array`, the 
injection will automatically processed as a multi-injection. In this 
case the identifier needs to be passed explicitly:
```typescript
@Inject(INTERCEPTOR_TOKEN) interceptors: Interceptor[];
```

### Inject into React Components
Dependencies of react component need be injected via property injection:
```typescript jsx
import {Inject} from 'react.di';

class UserComponent extends Component<any, any> {
  @Inject userService: UserService;
  @Inject(OtherService) otherService: OtherService;
  @Inject(CONFIG_TOKEN) config: Config;
  @Inject(TRANSLATION_TOKEN) translations: Translation[];
  
  ...
}
```

### Inject into Services
Dependencies of services will be injected via constructor injection:
```typescript
import {Injectable, Inject} from 'react.di';

@Injectable
export class UserService {
  constructor(@Inject http: HttpClient,
              @Inject(OtherService) otherService: OtherService,
              @Inject(HISTORY_TOKEN) history: IHistory) {}
}
```

## Sharing providers
Providers can be shared via importing from siblings or inheriting them from
parent components.

#### Importing modules in other modules
Modules can be imported in other modules to share its providers. To make
this possible the modules that are using import need to be nested  in 
parent module:
```typescript jsx
@Module({providers: [CommonService]})
class CommonModule extends Component {}

@Module({
  imports: [CommonModule],
  providers: [UserService],
})
class UserModule extends Component {
  @Inject userService: UserService;
  @Inject commonService: CommonService;
}

@Module()
class Root extends Component {
  render() {
    return (
      <UserModule/>
    );
  }
```

#### Hierarchical shared providers
Nesting `Module` annotated components in another `Module` annotated components 
is supported.
All defined providers of the parent module will be inherited to its
child modules:
```typescript jsx
@Module({providers: [UserService]})
class UserModule extends Component {}

@Module({providers: [CommonService]})
class App extends Component {
  render() {
    return (
      <UserModule/> // CommonService will also be available in UserModule
    );
  }
```
Providers that are already defined in a parent, will be overridden
if they are also defined in its child.

## Testing
For testing purposes `react.di` provides a `TestBed` component. Nest the
components you want to test in `TestBed` and setup its dependencies in
the `providers` prop of `TestBed`:
```typescript jsx
import {mount} from 'enzyme';

mount(
  <TestBed providers={[{provide: UserService, useClass: UserServiceMock}]}>
    <UserProfileContainer/>
  </TestBed>
);
```
or for defining a much simpler mock:
```typescript jsx
mount(
  <TestBed providers={[{provide: UserService, useValue: {getUser() {...}}}]}>
    <UserProfileContainer/>
  </TestBed>
);
```

## API

### Injectable
`Injectable` decorator marks a class as available to the inversify `Container`.
```typescript
import {Injectable} from 'react.di';

@Injectable
export class UserService {}
```

### Inject
The `Inject`/`Inject(Identifier)` decorator tells the di-system what need to be injected
and in which property the injected value should be referenced.

### Module
All components that should be feedable with the defined providers,
need to be nested in a module annotated component - But don't(!) need to be
direct children.

### TestBed (React component)
All components that should be feedable with the defined providers,
need to be nested in a module annotated component - But don't(!) need to be
direct children.

#### `providers` (Property)
Array of all available providers.

##### Injecting a class constructor
```jsx
<Module providers={[
  {provide: UserService, useClass: UserService}
]}>
  ...
</Module>
```
*Shorthand*
```jsx
<Module providers={[
  UserService
]}>
  ...
</Module>
```
All instantiated dependencies will be a **singleton** by default. If you don't
want a dependency to be singleton set `noSingleton` to `true`:
```jsx
<Module providers={[
  {provide: UserService, useClass: UserService, noSingleton: true}
]}>
  ...
</Module>
```

##### Injecting a value
```jsx
<Module providers={[
  {provide: UserService, useValue: someUserService}
]}>
  ...
</Module>
```

##### Injection via factories
Dependencies can be injected via factories. A factory is a simple function,
that gets the context of the current scope and returns the value, that
will be injected.
```jsx
<Module providers={[
  {provide: UserService, useFactory: context => someValue}
]}>
  ...
</Module>
```

#### `autoBindInjectable` (Property)
(default: `false`) When `autoBindInjectable` is set to `true`, injectable
class constructors don't need to be defined as providers anymore.
They will be available for injection by default. 
So that `[{provide: UserService, useClass: UserService}]` or `[UserService]`
can be omitted:
```jsx
<Module autoBindInjectable={true}>
  ... // UserService will be available anyway
</Module>
```


## Provider (React Component)
The `<Provider>` component is a react component, that provides low-level
support for inversifyJS containers. In other words: It takes an 
inversify container as property. So if you want to use all features
of inversify, this is the component you will fall in love with:
```typescript jsx
const container = new Container();
container.bind(Ninja).to(Samurai);

<Provider container={container}>
  ...
</Provider>
``` 
 