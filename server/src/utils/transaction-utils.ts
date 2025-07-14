import { Transaction } from "sequelize";

export function isTransactionActive(transaction?: Transaction): boolean {
  if (!transaction) return false;
  return (
    transaction.constructor.name === "Transaction" &&
    !(transaction as any)._finished
  );
}
