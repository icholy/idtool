import ID from "@compassdigital/id";
import { DecodedID } from "@compassdigital/id/interface";
import fetch from "node-fetch";

interface Session {
    user: string;
    token: string;
}

export interface FetchOptions {
    query?: string;
    nocache?: boolean;
    extended?: boolean;
}

export class Ap3Client {
    private session?: Session;

    constructor(private username: string, private password: string, private env = "dev") {}

    // token returns the session token for external use.
    token(): string|undefined {
        return this.session?.token;
    }

    // set the user token
    setToken(token: string): void {
        this.session = { user: "", token };
    }

    // login authenticates using the username/password provided to the constructor and saves
    // the token to a property.
    async login(): Promise<void> {
        const realm = ID("user", "cdl", "realm", "cdl");
        const auth = Buffer.from(`${this.username}:${this.password}`).toString("base64");
        const headers = { Authorization: `Basic ${auth}` };
        const response = await fetch(
            `https://api.compassdigital.org/${this.env}/user/auth?realm=${realm}`,
            { headers }
        );
        if (!response.ok) {
            throw new Error(await response.text());
        }
        this.session = await response.json();
    }

    // url returns the api url for the resource pointed to by the id.
    url(id: DecodedID, options?: FetchOptions): string {
        let url = `https://api.compassdigital.org/${this.env}`;
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

    // fetch the provided url.
    async fetch<ResponseData = any>(url: string): Promise<ResponseData> {
        if (!this.token) {
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
