import { JWK } from 'node-jose';
export class KeysStore {
    static store = JWK.createKeyStore();
    static resetStore = () => {
        KeysStore.store = JWK.createKeyStore();
    };
}
