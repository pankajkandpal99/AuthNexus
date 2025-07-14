import { Transaction, Sequelize } from "sequelize";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { FileInfo } from "../types/file-upload-types.js";
import { ROLE } from "../config/constants.js";
import { isTransactionActive } from "../utils/transaction-utils.js";

export class RequestContext {
  private _params: Record<string, any>;
  public body: any;
  public user?: {
    id: string;
    email: string;
    role: ROLE;
  };
  private _transaction?: Transaction;
  public files?: FileInfo[];
  public imageVariants?: FileInfo[];
  query?: { [key: string]: string | undefined };

  constructor(
    public db: Sequelize,
    public req: Request,
    public res: Response
  ) {
    this._params = { ...(req.params || {}) };

    this.body = req.body || {};
    this.user = req.user as { id: string; email: string; role: ROLE };
    this.files = (req as any).files;
    this.imageVariants = (req as any).imageVariants;
    this.query = Object.fromEntries(
      Object.entries(req.query || {}).map(([key, value]) => [
        key,
        typeof value === "string" ? value : undefined,
      ])
    );
  }

  // Getter for params to ensure we always return the latest
  get params(): Record<string, any> {
    return { ...this._params, ...(this.req.params || {}) };
  }

  // Setter in case we need to update params explicitly
  set params(value: Record<string, any>) {
    this._params = value;
    Object.assign(this.req.params, value);
  }

  get transaction(): Transaction | undefined {
    return this._transaction;
  }

  set transaction(value: Transaction | undefined) {
    this._transaction = value;
  }

  async withTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    // If transaction already exists, use it
    if (this._transaction) {
      return callback(this._transaction);
    }

    // Start a new transaction
    const transaction = await this.db.transaction();
    this._transaction = transaction;

    try {
      const result = await callback(transaction);

      // Commit the transaction if successful
      await transaction.commit();
      return result;
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      throw error;
    } finally {
      // Clear the transaction reference
      this._transaction = undefined;
    }
  }

  /**
   * Helper method to run a query within the current transaction (if exists)
   * @param queryCallback Query callback function
   */
  async runQuery<T>(
    queryCallback: (transaction?: Transaction) => Promise<T>
  ): Promise<T> {
    return queryCallback(this._transaction);
  }

  /**
   * Helper method to get transaction options for Sequelize operations
   */
  getTransactionOptions(): { transaction?: Transaction } {
    return this._transaction ? { transaction: this._transaction } : {};
  }
}

export const contextMiddleware = (db: Sequelize): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.params = req.params || {};

    const context = new RequestContext(db, req, res);
    (req as any).context = context;

    res.on("finish", async () => {
      if (context.transaction && isTransactionActive(context.transaction)) {
        try {
          const transactionState = (context.transaction as any)._finished;
          if (!transactionState) {
            await context.transaction.rollback();
          }
        } catch (error: any) {
          if (!error.message.includes("has been finished")) {
            console.error("Error cleaning up transaction:", error);
          }
        } finally {
          context.transaction = undefined;
        }
      }
    });

    next();
  };
};
