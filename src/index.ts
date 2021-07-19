
import ID from '@compassdigital/id';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import fetch, { Headers } from 'node-fetch';

// main is the entry point for the program. It's responsible for parsing command
// line flags and dispatching to the appropriate functions.
async function main(): Promise<void> {
    // parse the command line flags
    const argv = await yargs(hideBin(process.argv))
        .env('IDTOOL')
        .options('env', {
            alias: 'e',
            type: 'string',
            description: 'Environment to run in',
            default: 'dev',
            choices: ['dev', 'stage', 'v1'],
        })
        .options('username', {
            alias: 'u',
            type: 'string',
            description: 'AP3 username',
            demandOption: true,
        })
        .options('password', {
            alias: 'p',
            type: 'string',
            description: "AP3 password",
            demandOption: true,
        })
        .options('query', {
            alias: 'q',
            type: 'string',
            description: 'Graphql query to augment the response'
        })
        .options('format', {
            alias: 'f',
            type: 'boolean',
            description: "Format json before outputting",
            default: true
        })
        .argv;
    // create a client and use it to fetch the id's json
    const client = new Ap3Client(argv.username, argv.password, argv.env);

    for (const encoded of argv._) {
        try {
            const id = ID(encoded.toString());
            if (!id) {
                continue;
            }
            const data = await client.fetch(id, argv.query);
            if (argv.format) {
                console.log(JSON.stringify(data, null, 2))
            } else {
                console.log(JSON.stringify(data))
            }
        } catch (err) {
            console.error("error", encoded, err);
        }
    }
}

// kick off main
(async () => await main())();

interface LoginResponse {
    user: string;
    token: string;
}

class Ap3Client {

    private token?: LoginResponse;;

    constructor(
        private username: string,
        private password: string,
        private env = "dev"
    ) {}

    // login authenticates using the username/password provided to the constructor and saves
    // the token to a property. This method gets called automatically as needed.
    private async login(): Promise<void> {
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
            await this.login();
        }
        const headers = { "Authorization": `Bearer ${this.token}` };
        let url = `https://api.compassdigital.org/${this.env}/${id.service}/${id.type}/${id.id}`;
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