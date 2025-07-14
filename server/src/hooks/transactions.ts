import { isTransactionActive } from "../utils/transaction-utils.js";
import { RequestContext } from "../middleware/context.js";

export const TransactionHooks = {
  async startTransaction(context: RequestContext): Promise<void> {
    if (context.transaction && !isTransactionActive(context.transaction)) {
      context.transaction = await context.db.transaction();
    } else if (!context.transaction) {
      context.transaction = await context.db.transaction();
    }
  },

  async commitTransaction(context: RequestContext): Promise<void> {
    if (context.transaction && isTransactionActive(context.transaction)) {
      await context.transaction.commit();
      context.transaction = undefined;
    }
  },

  async rollbackTransaction(context: RequestContext): Promise<void> {
    if (context.transaction && isTransactionActive(context.transaction)) {
      await context.transaction.rollback();
      context.transaction = undefined;
    }
  },
};
