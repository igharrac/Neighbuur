/**
 * Genereert src/types/database.types.ts vanuit PostgREST's ingebouwde
 * OpenAPI-schema (geen Supabase CLI-login/DB-wachtwoord nodig — alleen de
 * service-role key die al in .env.local staat). Functioneel gelijkwaardig
 * aan `supabase gen types typescript`.
 *
 * Dit is het typesafety-vangnet uit Fase 0 van het naming-migratieplan:
 * bindt elke .from()/.select() aan een echt schema, zodat een gemiste
 * rename tijdens de latere migratiestappen een build-fout wordt in plaats
 * van een stille runtime-fout.
 *
 * Gebruik: node scripts/generate-db-types.mjs
 */
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
  headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
});
const spec = await res.json();
const defs = spec.definitions;

// Views hebben geen PK/FK-constraints in de swagger-required-array op
// dezelfde manier — behandel ze als "alles optioneel" (kan niet insert/update).
const VIEWS = new Set(["professional_overview", "review_complete", "community_overview"]);

function pgToTs(prop) {
  if (prop.enum) return `Database["public"]["Enums"]["${prop.format.replace("public.", "")}"]`;
  if (prop.type === "array") return "string[]"; // alle huidige array-kolommen zijn text[]/uuid[]
  // bigint blijft string — zelfde precisieveiligheid als de officiële Supabase-
  // generator (count()/bigint kan groter zijn dan Number.MAX_SAFE_INTEGER).
  if (prop.format === "bigint") return "string";
  switch (prop.format) {
    case "integer":
    case "int4":
    case "int8":
    case "int2":
    case "smallint":
    case "numeric":
    case "real":
    case "float4":
    case "float8":
    case "double precision":
      return "number";
    case "boolean":
      return "boolean";
    case "jsonb":
    case "json":
      return "Json";
    default:
      return "string"; // uuid, text, timestamptz, date — allemaal string in JS
  }
}

function extractFk(prop) {
  const m = /<fk table='([^']+)' column='([^']+)'\/>/.exec(prop.description ?? "");
  if (!m) return null;
  return { table: m[1], column: m[2] };
}

function buildTable(name, def) {
  const required = new Set(def.required ?? []);
  const props = Object.entries(def.properties ?? {});
  const isView = VIEWS.has(name);

  const rowLines = [];
  const insertLines = [];
  const updateLines = [];
  const relationships = [];

  for (const [col, prop] of props) {
    const tsType = pgToTs(prop);
    const nullable = !required.has(col);
    const hasDefault = prop.default !== undefined;
    const fk = extractFk(prop);
    if (fk) {
      relationships.push(
        `          { foreignKeyName: "${name}_${col}_fkey"; columns: ["${col}"]; isOneToOne: false; referencedRelation: "${fk.table}"; referencedColumns: ["${fk.column}"] },`
      );
    }

    rowLines.push(`          ${col}: ${tsType}${nullable ? " | null" : ""};`);

    if (!isView) {
      const insertOptional = nullable || hasDefault;
      insertLines.push(`          ${col}${insertOptional ? "?" : ""}: ${tsType}${nullable ? " | null" : ""};`);
      updateLines.push(`          ${col}?: ${tsType}${nullable ? " | null" : ""};`);
    }
  }

  const relBlock = relationships.length ? `[\n${relationships.join("\n")}\n        ]` : "[]";

  if (isView) {
    return `      ${name}: {\n        Row: {\n${rowLines.join("\n")}\n        };\n        Relationships: ${relBlock};\n      };`;
  }
  return `      ${name}: {\n        Row: {\n${rowLines.join("\n")}\n        };\n        Insert: {\n${insertLines.join("\n")}\n        };\n        Update: {\n${updateLines.join("\n")}\n        };\n        Relationships: ${relBlock};\n      };`;
}

const tableNames = Object.keys(defs).filter((n) => !VIEWS.has(n));
const viewNames = Object.keys(defs).filter((n) => VIEWS.has(n));

// Enums verzamelen (uniek op format-naam)
const enums = {};
for (const def of Object.values(defs)) {
  for (const prop of Object.values(def.properties ?? {})) {
    if (prop.enum) {
      const enumName = prop.format.replace("public.", "");
      enums[enumName] = prop.enum;
    }
  }
}

const tablesBlock = tableNames.map((n) => buildTable(n, defs[n])).join("\n");
const viewsBlock = viewNames.map((n) => buildTable(n, defs[n])).join("\n");
const enumsBlock = Object.entries(enums)
  .map(([name, values]) => `      ${name}: ${values.map((v) => `"${v}"`).join(" | ")};`)
  .join("\n");

// RPC-functies: de swagger-spec beschrijft parameters/return-types niet
// betrouwbaar genoeg om te genereren — handmatig opgenomen, 1-op-1 met de
// SQL-definities in supabase/migrations.
const functionsBlock = `      calculate_profile_strength: {
        Args: { v_id: string };
        Returns: number;
      };
      can_request_booking: {
        Args: { p_vakman_id: string };
        Returns: boolean;
      };
      count_professional_completed_jobs: {
        Args: { p_vakman_id: string };
        Returns: number;
      };
      is_conversation_participant: {
        Args: { p_gesprek_id: string };
        Returns: boolean;
      };
      count_residents_in_cluster: {
        Args: { p_development_id: string; p_postcode: string; p_gebouw_label?: string | null };
        Returns: number;
      };
      start_community: {
        Args: { p_cluster_id: string; p_titel_nl: string | null };
        Returns: { id: string; slug: string; aangemaakt: boolean }[];
      };
      reset_monthly_requests: {
        Args: Record<string, never>;
        Returns: void;
      };
      find_or_create_residential_cluster: {
        Args: { p_bag_pand_ids: string[]; p_type?: string };
        Returns: string;
      };
      count_residences_in_cluster: {
        Args: { p_cluster_id: string };
        Returns: number;
      };
      get_invite_context: {
        Args: { p_code: string };
        Returns: { postal_code: string | null; city: string | null }[];
      };
      anonymize_and_ban_account: {
        Args: { p_user_id: string };
        Returns: void;
      };
      count_residences_in_cluster_public: {
        Args: { p_cluster_id: string };
        Returns: number;
      };
      residential_cluster_city_public: {
        Args: { p_cluster_id: string };
        Returns: string | null;
      };
      count_residences_with_category_booking: {
        Args: { p_cluster_id: string; p_category_id: string };
        Returns: number;
      };
      distance_km: {
        Args: { lat1: number; lng1: number; lat2: number; lng2: number };
        Returns: number;
      };
      provider_local_experience_by_city_public: {
        Args: Record<string, never>;
        Returns: { professional_id: string; city: string; completed_jobs: number }[];
      };`;

const output = `/**
 * GEGENEREERD BESTAND — niet handmatig bewerken.
 * Gegenereerd via scripts/generate-db-types.mjs vanuit het live PostgREST-
 * schema. Draai het script opnieuw na elke migratie om dit bestand te
 * synchroniseren met de database.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
${tablesBlock}
    };
    Views: {
${viewsBlock}
    };
    Functions: {
${functionsBlock}
    };
    Enums: {
${enumsBlock}
    };
  };
}
`;

fs.writeFileSync(new URL("../src/types/database.types.ts", import.meta.url), output);
console.log(`Klaar. ${tableNames.length} tabellen, ${viewNames.length} views, ${Object.keys(enums).length} enums.`);
console.log("Geschreven naar src/types/database.types.ts");
