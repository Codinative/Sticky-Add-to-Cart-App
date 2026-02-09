import { SessionProps } from './auth';
 
export interface StoreData {
    accessToken?: string;
    scope?: string;
    storeHash: string;
}
 
export interface UserData {
    email: string;
    username?: string;
    stores?: string[];
}
 
export interface Db {
    setUser(session: SessionProps, storeHash: string): Promise<null | undefined>;
    setStore(session: SessionProps): Promise<null | undefined>;
    getStoreToken(storeHash: string): Promise<any>;
    deleteStore(session: SessionProps): Promise<[string, string] | null | undefined>;
    deleteUser(userId: string, storeHash: string): Promise<null | undefined>;
}