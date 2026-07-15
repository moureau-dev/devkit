import { Database } from "bun:sqlite";
import { Basebox, MemorySessionStore, NoSessionIdError } from "@moureau/basebox";

interface ProfileRow {
  id: number;
  name: string;
  organization_id: string;
  project_id: string;
  public_key: string;
  secret_key: string;
  created_at: string;
  updated_at: string;
}

/** Return type of Basebox.managed() — opaque, used for caching. */
type ManagedClient = ReturnType<Basebox["managed"]>;

/**
 * Decode a Basebox public key payload.
 * The key format is `bb_anon_<base64>` where the base64 decodes to:
 * `{ "organization_id": "...", "project_id": "..." }`
 */
export function decodePublicKey(publicKey: string): {
  organization_id: string;
  project_id: string;
} {
  if (!publicKey.startsWith("bb_anon_")) {
    throw new Error("Invalid public key: must start with bb_anon_");
  }
  const payload = publicKey.slice(8);
  const json = globalThis.Buffer
    ? Buffer.from(payload, "base64").toString("utf-8")
    : atob(payload);
  const decoded = JSON.parse(json);
  if (!decoded.organization_id || !decoded.project_id) {
    throw new Error("Invalid public key payload: missing organization_id or project_id");
  }
  return decoded;
}

export class Api {
  basebox: Basebox | null = null;
  private db: Database;
  private managedCache = new Map<string, ManagedClient>();
  private chosenProfile: ProfileRow | null = null;
  private sessionStore = new MemorySessionStore();
  private loadedSavedSession = false;

  constructor(dbPath?: string) {
    this.db = new Database(
      dbPath || Bun.env.BASEBOX_PROFILES_DB || `${Bun.env.HOME || "/tmp"}/.basebox-profiles.db`,
    );
    this.db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        organization_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        public_key TEXT NOT NULL,
        secret_key TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Create the session table if needed
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        session_id TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Auto-load any persisted session
    const saved = this.db.query("SELECT session_id FROM sessions WHERE id = 1").get() as { session_id: string } | null;
    if (saved) {
      this.sessionStore.set(saved.session_id);
      this.loadedSavedSession = true;
    }

    // Auto-load the most recently used profile
    const row = this.db
      .query("SELECT * FROM profiles ORDER BY updated_at DESC LIMIT 1")
      .get() as ProfileRow | null;
    if (row) {
      this.chosenProfile = row;
      this.instantiateBasebox(row);
    }
  }

  private instantiateBasebox(profile: ProfileRow) {
    this.basebox = new Basebox({
      publicKey: profile.public_key,
      sessionStore: this.sessionStore,
    });
  }

  /** Returns the currently selected profile. Throws if none is selected. */
  get profile(): ProfileRow {
    if (!this.chosenProfile) {
      throw new Error("No Basebox profile selected. Use 'select' first or create one.");
    }
    if (!this.basebox) {
      this.instantiateBasebox(this.chosenProfile);
    }
    return this.chosenProfile;
  }

  /** Returns a cached managed client for the currently selected profile. */
  get managed(): ManagedClient {
    const profile = this.profile;
    const cached = this.managedCache.get(profile.name);
    if (cached) return cached;

    if (!this.basebox) {
      this.instantiateBasebox(profile);
    }

    const managed = this.basebox!.managed({
      apiKey: profile.secret_key,
    });

    this.managedCache.set(profile.name, managed);
    return managed;
  }

  /** Returns the Basebox instance (ensures a profile is selected). */
  getClient(): Basebox {
    this.profile; // throws if none selected
    return this.basebox!;
  }

  // ── Profile CRUD ──────────────────────────────────────────────

  /** List all saved profiles. */
  listProfiles(): { items: ProfileRow[] } {
    const rows = this.db
      .query("SELECT * FROM profiles ORDER BY name ASC")
      .all() as ProfileRow[];
    return { items: rows };
  }

  /** Add a new profile and select it. */
  addProfile(data: {
    name: string;
    public_key: string;
    secret_key: string;
    /** Optional — decoded from public_key if not provided. */
    organization_id?: string;
    /** Optional — decoded from public_key if not provided. */
    project_id?: string;
  }): ProfileRow {
    const decoded = decodePublicKey(data.public_key);
    const organization_id = data.organization_id ?? decoded.organization_id;
    const project_id = data.project_id ?? decoded.project_id;

    this.db
      .query(
        `INSERT INTO profiles (name, organization_id, project_id, public_key, secret_key)
         VALUES ($name, $org, $proj, $pub, $sec)`,
      )
      .run(
        data.name,
        organization_id,
        project_id,
        data.public_key,
        data.secret_key,
      );

    const row = this.db
      .query("SELECT * FROM profiles WHERE name = $name")
      .get(data.name) as ProfileRow;

    this.activateProfile(row);
    return row;
  }

  /** Remove a profile by name. */
  removeProfile(name: string): { success: boolean } {
    this.db.query("DELETE FROM profiles WHERE name = $name").run(name);
    if (this.chosenProfile?.name === name) {
      this.chosenProfile = null;
      this.basebox = null;
      this.managedCache.clear();
    }
    return { success: true };
  }

  /** Select (activate) a profile by name. If no name given and only one profile exists, selects it. */
  selectProfile(name?: string): { profile: ProfileRow } {
    if (name) {
      const row = this.db
        .query("SELECT * FROM profiles WHERE name = $name")
        .get(name) as ProfileRow | null;
      if (!row) {
        throw new Error(`Profile "${name}" not found.`);
      }
      this.activateProfile(row);
      return { profile: row };
    }

    const rows = this.db
      .query("SELECT * FROM profiles ORDER BY name ASC")
      .all() as ProfileRow[];
    if (rows.length === 0) {
      throw new Error("No profiles found. Create one first.");
    }

    const row = rows[0]!;
    this.activateProfile(row);
    return { profile: row };
  }

  /** Mark a profile as selected, bump its updated_at, and re-instantiate the client. */
  private activateProfile(row: ProfileRow) {
    this.db
      .query("UPDATE profiles SET updated_at = datetime('now') WHERE name = $name")
      .run(row.name);
    this.chosenProfile = row;
    this.managedCache.clear();
    this.instantiateBasebox(row);
  }

  // ── User session management ─────────────────────────────────

  /**
   * Persist a user session ID for file/user operations.
   * Call this after a successful OAuth flow.
   */
  setSession(sessionId: string): void {
    this.sessionStore.set(sessionId);
    // Persist to SQLite so it survives process restarts
    this.db.run(
      `INSERT INTO sessions (id, session_id, updated_at) VALUES (1, $id, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET session_id = $id, updated_at = datetime('now')`,
      [sessionId],
    );
  }

  /** Clear the in-memory session and the persisted one. */
  clearSession(): void {
    this.sessionStore.clear();
    this.db.run("DELETE FROM sessions WHERE id = 1");
  }

  /**
   * Returns the raw session ID from the in-memory store, or null.
   */
  getSessionId(): string | null {
    try {
      return this.sessionStore.get();
    } catch {
      return null;
    }
  }

  /**
   * Get a valid session-authenticated client, or null if none is stored
   * or the stored session is expired/invalid.
   *
   * Validates with auth.check() so the caller doesn't need to.
   */
  async getClientSession(): Promise<{ client: ReturnType<Basebox["client"]> } | null> {
    if (!this.basebox) return null;

    let sessionId: string | null = null;
    try {
      sessionId = this.sessionStore.get();
    } catch {
      return null;
    }

    if (!sessionId) return null;

    try {
      const client = this.basebox.client({ sessionId });
      const { error } = await client.auth.check();
      if (error) {
        // Session expired or invalid — clear it
        this.sessionStore.clear();
        return null;
      }
      return { client };
    } catch {
      this.sessionStore.clear();
      return null;
    }
  }

  // ── API Key helper ───────────────────────────────────────────

  async createApiKey(input: {
    name?: string;
    level?: string;
    expiration?: string;
    projectId?: string;
  }) {
    const name = input.name || "New API Key";
    const level = input.level || "organization";
    const { data, error } = await this.managed.apiKeys.create({
      name,
      level: level as "organization" | "project",
      expires_at: input.expiration,
      project_id: input.projectId,
    });

    if (error) {
      throw new Error(`Failed to create API key: ${error.value.message}`);
    }

    return data;
  }
}

/**
 * Singleton shared across all resource handlers.
 *
 * The Api class manages:
 * - SQLite-backed profiles (each linking an org/project to a secret key)
 * - A MemorySessionStore for per-run user session persistence
 * - Cached managed clients per profile
 */
export const api = new Api();
