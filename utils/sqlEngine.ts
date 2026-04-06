
import initSqlJs from 'sql.js';

let db: any = null;
let SQL: any = null;

const SQL_WASM_URL = 'https://sql.js.org/dist/sql-wasm.wasm';
const SQL_JS_URL = 'https://sql.js.org/dist/sql-wasm.js';

export interface QueryResult {
  columns: string[];
  values: any[][];
}

export const initDatabase = async (savedBuffer?: Uint8Array): Promise<void> => {
  if (db) return;

  // Load the script and initialize WASM
  SQL = await initSqlJs({
    locateFile: file => SQL_WASM_URL
  });

  if (savedBuffer) {
    db = new SQL.Database(savedBuffer);
  } else {
    db = new SQL.Database();
    // Pre-load sample data if new
    seedSampleData();
  }
};

const seedSampleData = () => {
    db.run(`
        CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL, category TEXT);
        INSERT INTO products (name, price, category) VALUES 
            ('Nanba Pro Laptop', 1200.0, 'Electronics'),
            ('Mechanical Keyboard', 150.0, 'Accessories'),
            ('Magic Mouse', 90.0, 'Accessories'),
            ('Curved Monitor', 400.0, 'Electronics'),
            ('Leather Office Chair', 250.0, 'Furniture');

        CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY, product_id INTEGER, quantity INTEGER, sale_date TEXT);
        INSERT INTO sales (product_id, quantity, sale_date) VALUES 
            (1, 2, '2026-03-01'), (2, 5, '2026-03-02'), (3, 10, '2026-03-05'), (1, 1, '2026-03-10');
    `);
};

export const runQuery = (sql: string): QueryResult[] | string => {
    if (!db) return "Database not initialized. Please wait...";
    try {
        const res = db.exec(sql);
        return res;
    } catch (e: any) {
        return e.message;
    }
};

export const exportDatabase = (): Uint8Array => {
    if (!db) return new Uint8Array();
    return db.export();
};

export const getTableNames = (): string[] => {
    if (!db) return [];
    try {
        const res = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
        if (res.length > 0) {
            return res[0].values.map((v: any) => v[0]);
        }
        return [];
    } catch (e) {
        return [];
    }
};

export const clearDatabase = () => {
    if (SQL) {
        db = new SQL.Database();
        seedSampleData();
    }
};
