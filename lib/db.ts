import { Db } from '../types/db';
import * as firebaseDB from './dbs/firebase';

const { DB_TYPE } = process.env;

let db: Db;

switch (DB_TYPE) {
    case 'firebase':
        db = firebaseDB;
        break;
    default:
        db = firebaseDB;
        break;
}

export default db;