[![NPM](https://img.shields.io/npm/v/react.di.svg)](https://www.npmjs.com/package/react.di)
[![Build Status](https://travis-ci.org/RobinBuschmann/react.di.svg?branch=master)](https://travis-ci.org/RobinBuschmann/react.di)
[![codecov](https://codecov.io/gh/RobinBuschmann/react.di/branch/master/graph/badge.svg)](https://codecov.io/gh/RobinBuschmann/react.di)

# react.di
Dependency injection for react based upon [inversify](https://github.com/inversify/InversifyJS).

 - [Getting started](#getting-started)
 - [Injectable](#injectable)
 - [Inject](#inject)
    - [Injection via tokens](#injection-via-tokens)
    - [Multi injection](#multi-injection)
    - [Examples](#examples)
 - [Module (React Component)](#module-react-component)
    - [providers (Property)](#providers-property)
      - [Injecting a class constructor](#injecting-a-class-constructor)
      - [Injecting a value](#injecting-a-value)
      - [Injection via factories](#injection-via-factories)
    - [autoBindInjectable (Property)](#autobindinjectable-property)
    - [Module inheritance](#module-inheritance)
 - [Provider (React Component)](#provider-react-component)

### Installation
```
npm install react.di reflect-metadata --save
```

Your `tsconfig.json` need to be configured with  the following flags:
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
const CONFIG_TOKEN = 'config';
const config: Config = {};
```
#### 2. Inject service/value into react component
```tsx
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
```tsx
import {Module} from 'react.di';

const App = () => (
  <Module providers={[
    {provide: UserService, useClass: UserService},
    UserService, // or shorthand
    {provide: CONFIG_TOKEN, useValue: config},
    {provide: CONFIG_TOKEN, useFactory: context => config}, // or using factory
  ]}>
    <Panel>
      <UserContainer/>
    </Panel>
  </Module>
);
```

## Injectable
`Injectable` decorator marks a class as available to the inversify `Container`.
```typescript
import {Injectable} from 'react.di';

@Injectable
export class UserService {}
```

## Inject
`Inject`/`Inject(Identifier)` decorator specifies the dependency that 
should be injected.

### Injection via tokens
`@Inject(CONFIG_TOKEN) config: Config;`

### Multi injection
Multi injection means that all providers for a specified identifier
will be injected.
So if the annotated type of the dependency is of type `Array`, the 
injection will automatically processed as a multi-injection. In this 
case the identifier needs to be passed explicitly:
`@Inject(INTERCEPTOR_TOKEN) interceptors: Interceptor[];`

### Examples
*React Components*
```tsx
import {Inject} from 'react.di';

class UserComponent extends Component<any, any> {
  @Inject userService: UserService;
  @Inject(CONFIG_TOKEN) config: Config;
  
  async componentDidMount() {
    const user = await this.userService.getUser();
    this.setState({user});
  }

  render() {
    return (<div>{user.name}</div>); 
  }
}
```
*Services*
```typescript
import {Injectable, Inject} from 'react.di';

@Injectable
export class UserService {
  constructor(@Inject http: HttpClient,
              @Inject(OtherService) otherService: OtherService,
              @Inject(HISTORY_TOKEN) history: IHistory) {}
}
```

## Module (React Component)
The `<Module>` component is a react component, that specifies the
entry point for dependency injection. All providers that should
be available for injection will be defined in the components `providers`
property.
All components that should be feedable with the defined providers,
need to be nested in the module component - But don't(!) need to be
direct children.

### `providers` (Property)
Array of all available providers.

#### Injecting a class constructor
```jsx
<Module providers={[
  {provide: UserService, useClass: UserService}
]}>
  ...
</Module>
```
*Shorthand*
```tsx
<Module providers={[
  UserService
]}>
  ...
</Module>
```
All instantiated dependencies will be a **singleton** by default. If you don't
want a dependency to be singleton set `noSingleton` to `true`:
```tsx
<Module providers={[
  {provide: UserService, useClass: UserService, noSingleton: true}
]}>
  ...
</Module>
```

#### Injecting a value
```tsx
<Module providers={[
  {provide: UserService, useValue: someUserService}
]}>
  ...
</Module>
```

#### Injection via factories
Dependencies can be injected via factories. A factory is a simple function,
that gets the context of the current scope and returns the value, that
will be injected.
```tsx
<Module providers={[
  {provide: UserService, useFactory: context => someValue}
]}>
  ...
</Module>
```

### `autoBindInjectable` (Property)
(default: `false`) When `autoBindInjectable` is set to `true`, injectable
class constructors don't need to be defined as providers anymore.
They will be available for injection by default. 
So that `[{provide: UserService, useClass: UserService}]` or `[UserService]`
can be omitted:
```tsx
<Module autoBindInjectable={true}>
  ... // UserService will be available anyway
</Module>
```

### Module inheritance
Nesting module components in another module component is supported.
All defined providers of the parent module will be inherited to its
child modules:
```tsx
<Module providers={[
  CommonService
]}>
  ...
  <Module providers={[UserService]}>
    ... // CommonService will be available as well
  </Module>
</Module>
```
Identifiers that are already defined in a parent, will be overridden
if they are also defined in its child.

## Provider (React Component)
The `<Provider>` component is a react component, that provides low-level
support for inversifyJS containers. In other words: It takes an 
inversify container as property. So if you want to use all features
of inversify, this is the component you will fall in love with:
```tsx
const container = new Container();
container.bind(Ninja).to(Samurai);

<Provider container={container}>
  ...
</Provider>
``` 
 