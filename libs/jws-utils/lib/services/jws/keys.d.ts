import { JWK } from 'node-jose';
export interface KeySet {
    keys: JWK.Key[];
}
export declare class KeysStore {
    static store: JWK.KeyStore;
    static resetStore: () => void;
}
