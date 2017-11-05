[![Build Status](https://travis-ci.org/RobinBuschmann/react.di.svg?branch=master)](https://travis-ci.org/RobinBuschmann/react.di)
[![codecov](https://codecov.io/gh/RobinBuschmann/react.di/branch/master/graph/badge.svg)](https://codecov.io/gh/RobinBuschmann/react.di)

# react.di
Dependency injection for react based upon inversify.

### Installation
```
npm install reflect-metadata --save
```
```
npm install react.di --save 
```

### Usage
#### 1. Define injectable service
```typescript
import {Injectable} from 'react.di';

@Injectable
export class UserService {
  getUser() {}
}
```
#### 2. Inject service into react component
```typescript
import {Inject} from 'react.di';

class User extends Component<any, any> {
  @Inject userService: UserService;
  
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
  {provide: UserService, useValue: {getUser(){}}}, // or using value
  {provide: UserService, useFactory: context => {getUser(){}}}, // or using factory
  ]}>
    <User/>
  </Module>
);
```