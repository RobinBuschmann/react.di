import {Injectable} from '../../lib/Injectable';

export const VALUE = 'fromCService';

@Injectable
export class CService {

  getValue() {
    return VALUE;
  }
}
