import { sql } from "bun";
import { Basebox } from "@moureau/basebox";

interface Profile {
    id: number;
    name: string;
    organization: string;
    project: string;
    publicKey: string;
}

export class Api {
    basebox: Basebox | null = null;
    private bbProfilesCache = new Map<string, ReturnType<Basebox["managed"]>>();
    private chosenProfile: string | null = null;
    private chosenApiKey: string | null = null;

    constructor() {
        // initialize SQLite
        // try to connect to the database
        // try to find the database file in the configured directory
        // try to get chosen basebox profile configured
        // if no profile is found, prompt the user to create one
    }

    /**
     * @description
     * Returns the first profile from database (Name linking an Organization API key and Project).
     *
     * @throws Error if no basebox is instantiated
     */
    private get profile(): Profile {
        if (!this.basebox) {
            throw new Error("No basebox not instantiated");
        }

        return {
            id: 1,
            name: "profile name",
            organization: "organization name",
            project: "project name",
            publicKey: "public key",
        };
    }

    private async createApiKey() {
        const name = input.name || "New API Key";
        const level = input.level as "organization" | "project" | undefined;
        const expiration = input.expiration as string | undefined;
        const projectId = input.projectId as string | undefined;

        const { api_key, error } = await this.managed.apiKeys.create({
            name,
            level,
            expires_at: expiration,
            project_id: projectId,
        });

        if (error) {
            throw new Error(`Failed to create API key: ${error.message}`);
        }

        // store the new API key in the database
    }

    selectApiKey() {
        // prompt the user to select an API key from the database
        // for the selected profile, set the apiKey property to the selected API key
    }

    /**
     * @description
     * Prompts the user to create a new profile, then
     * saves it to the SQLite database.
     */
    private addProfile() {
        // prompt the user to create a new profile
        // save the profile to the database
    }

    /**
     * @description
     * Lists all profiles saved in the SQLite database,
     * then prompts the user to select one, and sets it as selected.
     *
     * @throws Error if no basebox is instantiated
     */
    selectProfile() {
        // list all profiles from database
        // prompt the user to choose a profile
        // set the basebox instance with the chosen profile
    }

    /**
     * @description
     * Lists all profiles from database (Name linking an Organization API key and Project)
     */
    get profiles() {
        return [];
    }

    get managed() {
        const profile = this.profile;
        const cached = this.bbProfilesCache.get(profile.name);
        if (cached) {
            return cached;
        }

        const bb = new Basebox({
            publicKey: profile.publicKey,
        });

        const managed = bb.managed({
            apiKey: profile.apiKey,
        });

        this.bbProfilesCache.set(profile.name, managed);
        return managed;
    }
}
