import ID from "@compassdigital/id";
import { DecodedID } from "@compassdigital/id/interface";
import fetch from "node-fetch";
import { ServiceClient } from "@compassdigital/sdk.typescript";
import { GetUserAuthResponse } from "@compassdigital/sdk.typescript/interface/user";
import { funcArgs } from "./funcargs";

export interface FetchOptions {
    query?: string;
    nocache?: boolean;
    extended?: boolean;
}

export class Ap3Client {
    private auth?: GetUserAuthResponse;
    private api: ServiceClient;

    constructor(private username: string, private password: string, private env = "dev") {
        this.api = new ServiceClient({ stage: env });
    }

    // token returns the session token for external use.
    token(): string|undefined {
        return this.auth?.token;
    }

    // set the user token
    setToken(token: string): void {
        this.auth = { user: "", token };
    }

    // baseURL returns the base url for the configured stage.
    baseURL(): string {
        return `https://api.compassdigital.org/${this.env}`;
    }

    // login authenticates using the username/password provided to the constructor and saves
    // the token to a property.
    async login(): Promise<void> {
        const auth = Buffer.from(`${this.username}:${this.password}`).toString("base64");
        this.auth = await this.api.get_user_auth({
            headers: { Authorization: `Basic ${auth}` },
            query: { realm: ID("user", "cdl", "realm", "cdl") },
        });
    }

    // configURL returns the url for the provided config key.
    configURL(key: string, _public = false): string {
        let url = this.baseURL();
        if (_public) {
            return `${url}/config/public/${key}`;
        }
        return `${url}/config/${key}`;
    }

    // url returns the api url for the resource pointed to by the id.
    url(id: DecodedID, options?: FetchOptions): string {
        let url = this.baseURL();
        if (id.service === id.type) {
            url += `/${id.service}/${ID(id)}`;
        } else {
            url += `/${id.service}/${id.type}/${ID(id)}`;
        }
        let query = [];
        if (options?.query) {
            query.push(`_query=${encodeURIComponent(options?.query)}`);
        }
        if (options?.nocache) {
            query.push(`nocache=true`);
        }
        if (options?.extended) {
            query.push(`extended=true`);
        }
        if (query.length > 0) {
            url += `?${query.join("&")}`;
        }
        return url;
    }

    async method(name: string, ...args: (string|number)[]): Promise<any> {
        const api: any = this.api;
        const method: Function = api[name];
        if (typeof method !== "function") {
            throw new Error(`Invalid method name: ${name}`);
        }
        const methodArgs = funcArgs(method).slice(0, -1);
        if (methodArgs.length !== args.length) {
            throw new Error(`expected ${methodArgs.length} args: (${methodArgs.join(",")}), recieved ${args.length}`);
        }
        return method.call(api, args.map((arg, i) => {
            if (methodArgs[i] === "body" && typeof arg === "string") {
                return JSON.parse(arg);
            }
            return arg;
        }));
    }

    // fetch the provided url.
    async fetch<ResponseData = any>(url: string): Promise<ResponseData> {
        if (!this.auth) {
            await this.login();
        }
        const headers = { Authorization: `Bearer ${this.token()}` };
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }

    // fetch the resource pointed to by the provided id. The decoded id must have the id property set.
    async fetchID<ResponseData = any>(
        id: DecodedID,
        options?: FetchOptions
    ): Promise<ResponseData> {
        if (!id.id) {
            throw new Error("missing id property");
        }
        return this.fetch<ResponseData>(this.url(id, options));
    }
}
