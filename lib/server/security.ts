import "server-only"
import { createHash, randomBytes, timingSafeEqual } from "node:crypto"
import argon2 from "argon2"

export const randomToken = (bytes = 32) =>
  randomBytes(bytes).toString("base64url")
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex")
export const hashSecret = (value: string) =>
  argon2.hash(value, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  })
export const verifySecret = (hash: string, value: string) =>
  argon2.verify(hash, value)
export function safeEqualDigest(value: string, expected: string) {
  const actual = Buffer.from(digest(value), "hex")
  const target = Buffer.from(expected, "hex")
  return actual.length === target.length && timingSafeEqual(actual, target)
}
