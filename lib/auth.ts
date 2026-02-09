import BigCommerce from 'node-bigcommerce';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { QueryParams, SessionProps } from '../types/auth';
import db from './db';

const { AUTH_CALLBACK, CLIENT_ID, CLIENT_SECRET} = process.env;

const JWT_KEY = process.env.JWT_KEY as string;

interface BCPayload extends JwtPayload {
  context: string;
}

interface ApiConfig {
    apiUrl?: string;
    loginUrl?: string;
}

// Used for internal configuration; 3rd party apps may remove
const apiConfig: ApiConfig = {};
if (process.env.API_URL && process.env.LOGIN_URL) {
    apiConfig.apiUrl = process.env.API_URL;
    apiConfig.loginUrl = process.env.LOGIN_URL;
}

// Create BigCommerce instance
// https://github.com/bigcommerce/node-bigcommerce
const bigcommerce = new BigCommerce({
    logLevel: 'info',
    clientId: CLIENT_ID,
    secret: CLIENT_SECRET,
    callback: AUTH_CALLBACK,
    responseType: 'json',
    headers: { 'Accept-Encoding': '*' },
    apiVersion: 'v3',
    ...apiConfig,
});

const bigcommerceSigned = new BigCommerce({
    secret: CLIENT_SECRET,
    responseType: 'json',
});

export function bigcommerceClient(accessToken: string, storeHash: string) {
    return new BigCommerce({
        clientId: CLIENT_ID,
        accessToken,
        storeHash,
        responseType: 'json',
        apiVersion: 'v3'
    });
}

export function getBCAuth(query: QueryParams) {
    return bigcommerce.authorize(query);
}

export function getBCVerify({ signed_payload_jwt }: QueryParams) {
    return bigcommerceSigned.verifyJWT(signed_payload_jwt);
}

export async function setSession(session: SessionProps) {
  const storeHash = await db.setStore(session);

  if (!storeHash) return null;
  
  await db.setUser(session, storeHash);
}

export async function getSession(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const context = searchParams.get("context") || "";

  if (!context) return null;

  const decodedContext = decodePayload(context)?.context;

  if (!decodedContext) return null;

  const accessToken = await db.getStoreToken(decodedContext);

  return { accessToken, storeHash: decodedContext };
}
 
export async function removeSession(session: SessionProps) {
    const response = await db.deleteStore(session);
    if (!response) return null;

    const [userId, storeHash] = response;

    await db.deleteUser(userId, storeHash);
}

export function encodePayload(session: SessionProps) {
  // BigCommerce sends context like "stores/{store_hash}"
  const contextString = session?.context || session?.sub || '';
  const storeHash = contextString.split('/')[1] || '';

  return jwt.sign({ context: storeHash }, JWT_KEY, { expiresIn: '24h' });
}

export function decodePayload(encodedContext: string): BCPayload | null {
  try {
    const decoded = jwt.verify(encodedContext, JWT_KEY) as JwtPayload | string;

    if (typeof decoded === "string") return null;

    if (!decoded.context || typeof decoded.context !== "string") {
      return null;
    }

    return decoded as BCPayload;
  } catch (error) {
    console.error("JWT verify failed:", error);
    return null;
  }
}