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
  - [Providers](#providers)
    - [Injecting a class constructor](#injecting-a-class-constructor)
    - [Injecting a value](#injecting-a-value)
    - [Injecting via factories](#injecting-via-factories)
  - [autoBindInjectable=true](#autoBindInjectable=true)
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
#### 3. Setup module
```tsx
import {Module} from 'react.di';

const App = () => (
  <Module providers={[
    {provide: UserService, useClass: UserService},
    UserService, // or shorthand
    {provide: CONFIG_TOKEN, useValue: config,
    {provide: CONFIG_TOKEN, useFactory: context => config, // or using factory
  ]}>
    <User/>
  </Module>
);
```

## Injectable
`Injectable` decorator marks a class as available to the inversify `Contaner`.
```typescript
import {Injectable} from 'react.di';

@Injectable
export class UserService {}
```

## Inject
`Inject`/`Inject(Identifier)` decorator specifies the dependency, that 
should be injected.

### Injection via tokens
`@Inject(CONFIG_TOKEN) config: Config;`

### Multi injection
Multi injection means, that all providers for a specified identifier
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
The `<Module>` component 

### Providers
TODO
#### Injecting a class constructor
TODO
#### Injecting a value
TODO
#### Injecting via factories
TODO

### `autoBindInjectable=true`
TODO
### Module inheritance
TODO

## Provider (React Component)
TODO
