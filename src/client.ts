import ID from '@compassdigital/id';
import fetch from 'node-fetch';

interface LoginResponse {
    user: string;
    token: string;
}

export class Ap3Client {

    private token?: LoginResponse;;

    constructor(
        private username: string,
        private password: string,
        private env = "dev"
    ) {}

    // login authenticates using the username/password provided to the constructor and saves
    // the token to a property.
    async login(): Promise<void> {
        const realm = ID("user", "cdl", "realm", "cdl");
        const auth = Buffer.from(`${this.username}:${this.password}`).toString("base64");
        const headers = { "Authorization": `Basic ${auth}` };
        const response = await fetch(`https://api.compassdigital.org/${this.env}/user/auth?realm=${realm}`, { headers });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        this.token = await response.json();
    }

    // fetch the resource pointed to by the provided id. The decoded id must have the id property set.
    async fetch<ResponseData = any>(id: cdl.DecodedID, query?: string): Promise<ResponseData> {
        if (!id.id) {
            throw new Error("missing id property");
        }
        if (!this.token) {
            throw new Error("not logged in");
        }
        const headers = { "Authorization": `Bearer ${this.token?.token}` };
        let url = `https://api.compassdigital.org/${this.env}/${id.service}/${id.type}/${ID(id)}`;
        if (query) {
            url += `?_query=${encodeURIComponent(query)}`;
        }
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
}