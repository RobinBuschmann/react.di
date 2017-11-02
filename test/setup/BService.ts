import {Injectable} from '../../lib/Injectable';

export const VALUE = 'fromBService';

@Injectable
export class BService {

  getValue() {
    return VALUE;
  }
}
