import { readFileSync } from "fs";
import { join } from "path";

describe("RLS policies", () => {
  const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "20260129_core_schema.sql"), "utf8");

  it("defines org_id scoping policy", () => {
    expect(sql).toMatch(/using \(org_id = current_setting\('request.jwt.claims'::text\)::json->>'org_id'\)/);
  });

  it("denies access without policy match", () => {
    expect(sql.toLowerCase()).toContain("alter default privileges in schema public revoke all on tables from public");
  });

  it("creates role-based policies", () => {
    const roles = ["planner", "coordinator", "chef", "buyer", "admin", "employee"];
    for (const role of roles) {
      expect(sql.toLowerCase()).toContain(`check ((current_setting('request.jwt.claims'::text)::json->>'role') = '${role}')`.toLowerCase());
    }
  });
});
