import ID from "@compassdigital/id";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { Ap3Client, FetchOptions } from "./client";

// main is the entry point for the program. It's responsible for parsing command
// line flags and dispatching to the appropriate functions.
async function main(): Promise<void> {
    // parse the command line flags
    const argv = await yargs(hideBin(process.argv))
        .env("IDTOOL")
        .options("env", {
            alias: "e",
            type: "string",
            description: "Environment to run in",
            default: "dev",
            choices: ["dev", "stage", "v1"],
        })
        .options("username", {
            alias: "u",
            type: "string",
            description: "AP3 username",
        })
        .options("password", {
            alias: "p",
            type: "string",
            description: "AP3 password",
        })
        .options("query", {
            alias: "q",
            type: "string",
            description: "Graphql query to augment the response",
        })
        .options("format", {
            alias: "f",
            type: "boolean",
            description: "Format json before outputting",
            default: true,
        })
        .options("info", {
            alias: "i",
            type: "boolean",
            description: "Output id properties",
            default: false,
        })
        .options("token", {
            alias: "t",
            type: "boolean",
            description: "Output session token",
            default: false,
        })
        .options("extended", {
            alias: "x",
            type: "boolean",
            description: "Request extended output",
        })
        .options("nocache", {
            type: "boolean",
            description: "Don't return cached info",
        })
        .options("bearer", {
            alias: "b",
            type: "string",
            description: "Bearer token to use"
        })
        .argv;
    // make sure we have a username & password
    if (!argv.token && (!argv.username || !argv.password)) {
        console.error(`--username and --password must be set`);
    }
    // create a client and use it to fetch the id's json
    const client = new Ap3Client(argv.username ?? "", argv.password ?? "", argv.env);
    // login and output the token if that's what was requested.
    if (argv.token) {
        try {
            await client.login();
            console.log(`Bearer ${client.token()}`);
        } catch (err) {
            console.error("error", err.message)
        }
        return;
    }
    // set the token if one was provided
    if (argv.bearer) {
        client.setToken(argv.bearer);
    }
    // don't bother doing anything if there are no ids to process
    if (argv._.length === 0) {
        console.error("no ids provided");
        return;
    }
    // treat each positional argument as an id
    for (const encoded of argv._) {
        try {
            const id = ID(encoded.toString());
            if (!id) {
                throw new Error("invalid id");
            }
            const options: FetchOptions = {
                query: argv.query,
                extended: argv.extended,
                nocache: argv.nocache,
            };
            if (argv.info) {
                console.log(`raw      = ${encoded}`);
                console.log(`service  = ${id.service}`);
                console.log(`provider = ${id.provider}`);
                console.log(`type     = ${id.type}`);
                console.log(`id       = ${id.id}`);
                console.log(`url      = ${client.url(id, options)}`);
                continue;
            }
            const data = await client.fetchID(id, options);
            if (argv.format) {
                console.log(JSON.stringify(data, null, 2));
            } else {
                console.log(JSON.stringify(data));
            }
        } catch (err) {
            console.error("error:", err.message, `raw=${encoded}`);
        }
    }
}

// kick off main
main();
