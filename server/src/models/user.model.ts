import { DataTypes, Model } from "sequelize";
import { AuthProvider, UserStatus } from "../types/model/i-user-model.js";
import { ROLE } from "../config/constants.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import crypto from "crypto";
import { sequelize } from "../lib/db.js";

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  role: ROLE;
  profileImage?: string | null;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationTokenExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetTokenExpires?: Date | null;
  refreshToken?: string | null;
  refreshTokenExpires?: Date | null;
  loginAttempts: number;
  lockedUntil?: Date | null;
  lastLogin?: Date | null;
  lastActive?: Date | null;
  provider: AuthProvider;
  providerId?: string | null;
  status: UserStatus;
  profileCompleted: boolean;
  preferences?: any;
}

interface UserCreationAttributes extends UserAttributes {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare role: ROLE;
  declare profileImage: string | null;
  declare isEmailVerified: boolean;
  declare emailVerificationToken: string | null;
  declare emailVerificationTokenExpires: Date | null;
  declare passwordResetToken: string | null;
  declare passwordResetTokenExpires: Date | null;
  declare refreshToken: string | null;
  declare refreshTokenExpires: Date | null;
  declare loginAttempts: number;
  declare lockedUntil: Date | null;
  declare lastLogin: Date | null;
  declare lastActive: Date | null;
  declare provider: AuthProvider;
  declare providerId: string | null;
  declare status: UserStatus;
  declare profileCompleted: boolean;
  declare preferences: any;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;

  // Instance Methods
  public async validatePassword(password: string): Promise<boolean> {
    const hashedPassword = this.getDataValue("password");
    if (!hashedPassword) {
      throw new Error("Password not available for comparison");
    }
    return compare(password, hashedPassword);
  }

  public generateRefreshToken(): string {
    const refreshToken = jwt.sign(
      {
        userId: this.getDataValue("id"),
        role: this.getDataValue("role"),
        tokenType: "refresh",
      },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    this.setDataValue("refreshToken", refreshToken);
    this.setDataValue("refreshTokenExpires", expiresAt);

    return refreshToken;
  }

  public generatePasswordResetToken(): string {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    this.setDataValue("passwordResetToken", resetToken);
    this.setDataValue("passwordResetTokenExpires", expiresAt);

    return resetToken;
  }

  public isAccountLocked(): boolean {
    const lockedUntil = this.getDataValue("lockedUntil");
    return !!(lockedUntil && lockedUntil > new Date());
  }

  public async incrementLoginAttempts(): Promise<void> {
    const currentAttempts = this.getDataValue("loginAttempts");
    this.setDataValue("loginAttempts", currentAttempts + 1);

    if (currentAttempts + 1 >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30);
      this.setDataValue("lockedUntil", lockUntil);
    }

    await this.save();
  }

  public async resetLoginAttempts(): Promise<void> {
    this.setDataValue("loginAttempts", 0);
    this.setDataValue("lockedUntil", null);
    await this.save();
  }

  public isRefreshTokenValid(): boolean {
    const expires = this.getDataValue("refreshTokenExpires");
    return !!(expires && expires > new Date());
  }

  public isEmailVerificationTokenValid(): boolean {
    const expires = this.getDataValue("emailVerificationTokenExpires");
    return !!(expires && expires > new Date());
  }

  public isPasswordResetTokenValid(): boolean {
    const expires = this.getDataValue("passwordResetTokenExpires");
    return !!(expires && expires > new Date());
  }

  public toSafeObject(): any {
    const {
      password,
      refreshToken,
      emailVerificationToken,
      passwordResetToken,
      ...safeData
    } = this.toJSON();
    return safeData;
  }

  // Static Methods
  public static async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  public static async findByEmailWithPassword(
    email: string
  ): Promise<User | null> {
    return this.scope("withPassword").findOne({ where: { email } });
  }

  public static async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  }

  public static async findByRefreshToken(
    refreshToken: string
  ): Promise<User | null> {
    return this.scope("withTokens").findOne({ where: { refreshToken } });
  }

  public static async findByEmailVerificationToken(
    token: string
  ): Promise<User | null> {
    return this.scope("withTokens").findOne({
      where: { emailVerificationToken: token },
    });
  }

  public static async findByPasswordResetToken(
    token: string
  ): Promise<User | null> {
    return this.scope("withTokens").findOne({
      where: { passwordResetToken: token },
    });
  }

  public static async createWithEmailVerification(
    userData: any
  ): Promise<{ user: User; token: string }> {
    const hashedPassword = await hash(userData.password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const user = await this.create({
      ...userData,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: expiresAt,
    });

    return { user, token: verificationToken };
  }

  public static async updateProfile(
    userId: string,
    updateData: Partial<UserAttributes>,
    transaction?: any
  ): Promise<User | null> {
    const [affectedCount, affectedRows] = await this.update(updateData, {
      where: { id: userId },
      returning: true,
      transaction,
    });

    return affectedCount > 0 ? affectedRows[0] : null;
  }
}

// Model initialization
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLE)),
      defaultValue: ROLE.USER,
    },
    profileImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emailVerificationTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refreshTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastActive: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    provider: {
      type: DataTypes.ENUM(...Object.values(AuthProvider)),
      defaultValue: AuthProvider.LOCAL,
    },
    providerId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      defaultValue: UserStatus.ACTIVE,
    },
    profileCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: {
        exclude: [
          "password",
          "refreshToken",
          "emailVerificationToken",
          "passwordResetToken",
        ],
      },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password"] },
      },
      withTokens: {
        attributes: {
          include: [
            "refreshToken",
            "refreshTokenExpires",
            "emailVerificationToken",
            "emailVerificationTokenExpires",
            "passwordResetToken",
            "passwordResetTokenExpires",
          ],
        },
      },
    },
  }
);

export default User;
export { User };
