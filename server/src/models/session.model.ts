import { Schema, model } from "mongoose";
import { ISession } from "../types/model/i-session-model.js";
import { AuthProvider } from "../types/model/i-user-model.js";

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    loginMethod: {
      type: String,
      enum: Object.values(AuthProvider),
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "sessions",
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Session = model<ISession>("Session", SessionSchema);
