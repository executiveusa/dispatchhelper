export type ContractInputs = {
  dailyRate: number;
  renewalYear: number;
};

export type ContractDraft = {
  text: string;
  weeklyRate: number;
  warnings: string[];
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export function generateFromOnShoreTemplate(template: string, input: ContractInputs): ContractDraft {
  if (!template.trim()) throw new Error("The owner-approved On Shore contract template is required.");
  if (!Number.isFinite(input.dailyRate) || input.dailyRate < 0) throw new Error("A valid daily rate is required.");
  if (!Number.isInteger(input.renewalYear) || input.renewalYear < 2026) throw new Error("An owner-confirmed renewal year is required.");

  const weeklyRate = input.dailyRate * 5;
  let text = template;

  text = text.replaceAll("$3,457.50", "$3,547.50");
  text = text.replaceAll("The Weitz Company", "");
  text = text.replace(/\bAssociation\b/g, "");
  text = text.replace(/\{\{DAILY_RATE\}\}/g, money(input.dailyRate));
  text = text.replace(/\{\{WEEKLY_RATE\}\}/g, money(weeklyRate));
  text = text.replace(/\{\{RENEWAL_YEAR\}\}/g, String(input.renewalYear));

  const warnings: string[] = [];
  if (/The Weitz Company/i.test(text)) warnings.push("Leftover The Weitz Company reference remains.");
  if (/\bAssociation\b/i.test(text)) warnings.push("Association language remains.");
  if (!text.includes(money(weeklyRate)) && !template.includes("{{WEEKLY_RATE}}")) {
    warnings.push("Weekly-rate placement could not be verified automatically.");
  }
  warnings.push("Legal clauses require owner's attorney review before use.");

  return { text, weeklyRate, warnings };
}
