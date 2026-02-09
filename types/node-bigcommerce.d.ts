// src/types/node-bigcommerce.d.ts
declare module "node-bigcommerce" {
  interface BigCommerceOptions {
    clientId?: string;
    accessToken?: string;
    secret?: string;
    callback?: string;
    responseType?: "json" | "xml";
    apiVersion?: string;
    logLevel?: string;
    apiUrl?: string;
    loginUrl?: string;
    headers?: Record<string, string>;
    storeHash?: string;
  }

  interface QueryParams {
    [key: string]: string | string[];
  }

  class BigCommerce {
    constructor(config: BigCommerceOptions);

    authorize(query: QueryParams): Promise<any>;
    verifyJWT(token: string | string[]): any;

    get(endpoint: string, params?: any): Promise<any>;
    post(endpoint: string, data: any): Promise<any>;
    put(endpoint: string, data: any): Promise<any>;
    delete(endpoint: string): Promise<any>;
  }

  export = BigCommerce;
}
