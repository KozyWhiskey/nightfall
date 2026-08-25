import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from "@nightfall/contracts";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 32;

function scryptHash(password: string, salt: Buffer, keylen: number, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, { N: n, r, p }, (error, derived) => {
      if (error !== null) reject(error);
      else resolve(derived);
    });
  });
}

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`).test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptHash(pin, salt, SCRYPT_KEYLEN, SCRYPT_N, SCRYPT_R, SCRYPT_P);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(r) || !Number.isSafeInteger(p) || parts[4] === undefined || parts[5] === undefined) return false;
  const salt = Buffer.from(parts[4], "base64url");
  const expected = Buffer.from(parts[5], "base64url");
  const actual = await scryptHash(pin, salt, expected.length, n, r, p);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
