import Database from "better-sqlite3";
import { CACHE_CONFIG } from "../../config/cache";
import path from "path";
import fs from "fs";

export interface SemanticCacheData {
  semantic: any;
  security: any;
  developer: any;
}

export class SemanticCache {
  private db: Database.Database;

  constructor(dbDir: string = CACHE_CONFIG.DB_DIR, dbName: string = "semantic_hashgraph.db") {
    let resolvedDbDir = dbDir;
    if (process.env.VERCEL) {
      resolvedDbDir = "/tmp";
    }
    const fullDir = path.isAbsolute(resolvedDbDir) ? resolvedDbDir : path.resolve(process.cwd(), resolvedDbDir);
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }

    const dbPath = path.join(fullDir, dbName);
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS semantic_annotations (
        contract_address TEXT PRIMARY KEY,
        prompt_version TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }

  public get(contractAddress: string, requiredPromptVersion: string): SemanticCacheData | null {
    const stmt = this.db.prepare(`
      SELECT data, prompt_version
      FROM semantic_annotations
      WHERE contract_address = ?
    `);
    
    const row = stmt.get(contractAddress) as { data: string; prompt_version: string; } | undefined;

    if (!row) return null;
    
    if (row.prompt_version !== requiredPromptVersion) {
       this.delete(contractAddress);
       return null;
    }

    try {
      return JSON.parse(row.data) as SemanticCacheData;
    } catch {
      this.delete(contractAddress);
      return null;
    }
  }

  public set(contractAddress: string, promptVersion: string, data: SemanticCacheData): void {
    const stmt = this.db.prepare(`
      INSERT INTO semantic_annotations (
        contract_address,
        prompt_version,
        data,
        created_at
      ) VALUES (?, ?, ?, ?)
      ON CONFLICT(contract_address) DO UPDATE SET
        prompt_version = excluded.prompt_version,
        data = excluded.data,
        created_at = excluded.created_at
    `);

    stmt.run(
      contractAddress,
      promptVersion,
      JSON.stringify(data),
      Date.now()
    );
  }

  public delete(contractAddress: string): void {
    this.db.prepare("DELETE FROM semantic_annotations WHERE contract_address = ?").run(contractAddress);
  }
}
