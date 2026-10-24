import ts from "typescript";

export const owners: Record<string, string> = {
  profiles: "identity",
  user_roles: "identity",
  companies: "relationships",
  contacts: "relationships",
  deals: "sales",
  pipelines: "sales",
  stages: "sales",
  // Solo tiene GRANT SELECT: el trigger deals_stage_history es el unico que escribe.
  // Asignada en el mini-comite 2 del 23/10/2026 (dossier/25-acta-mini-comite-2.md).
  deal_stage_history: "sales",
  activities: "followup",
};
const rpcOwners: Record<string, string> = {
  soft_delete_company: "relationships",
  soft_delete_contact: "relationships",
  soft_delete_deal: "sales",
};

/** Static guard for the supported SDK syntax; RLS remains the runtime security boundary. */
export function persistenceViolations(path: string, source: string): string[] {
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
  const module = path.replaceAll("\\", "/").match(/src\/modules\/([^/]+)\/api\.ts$/)?.[1];
  const errors: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      if (
        spec.startsWith("@/modules/") &&
        !/^@\/modules\/(contracts|lookup|[^/]+\/api)$/.test(spec)
      )
        errors.push("Importación privada entre módulos");
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const method = node.expression.name.text;
      const arg = node.arguments[0];
      if (method === "from" && node.expression.expression.getText(file) !== "Array") {
        if (!arg || !ts.isStringLiteral(arg)) errors.push("Tabla dinámica no permitida");
        else if (!module || owners[arg.text] !== module)
          errors.push("Persistencia ajena: " + arg.text);
      }
      if (method === "select") {
        if (!arg || !ts.isStringLiteral(arg)) errors.push("Selección dinámica no permitida");
        else
          for (const match of arg.text.matchAll(/(?:^|[,\s:])([a-z_]+)(?:![a-z_]+)?\s*\(/g)) {
            if (!module || owners[match[1]!] !== module) errors.push("JOIN ajeno: " + match[1]);
          }
      }
      if (
        method === "rpc" &&
        (!arg || !ts.isStringLiteral(arg) || !module || rpcOwners[arg.text] !== module)
      )
        errors.push("RPC ajena o sin contrato");
      if (method === "schema") errors.push("RPC/schema requiere contrato explícito");
    }
    if (
      ts.isElementAccessExpression(node) &&
      ts.isStringLiteral(node.argumentExpression) &&
      ["from", "select", "rpc", "schema"].includes(node.argumentExpression.text)
    )
      errors.push("Acceso calculado al SDK no permitido");
    ts.forEachChild(node, visit);
  }
  visit(file);
  return errors;
}
