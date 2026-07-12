import "server-only"
import { createReadStream, createWriteStream } from "node:fs"
import { mkdir, rename, rm } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { pipeline } from "node:stream/promises"
import { Readable } from "node:stream"

const root = resolve(process.cwd(), "data", "storage")
function pathFor(key: string) {
  const file = resolve(root, key)
  if (!file.startsWith(`${root}/`)) throw new Error("Invalid storage key")
  return file
}
export async function putStream(
  key: string,
  source: ReadableStream<Uint8Array>
) {
  const target = pathFor(key),
    temporary = `${target}.pending`
  await mkdir(dirname(target), { recursive: true })
  await pipeline(
    Readable.fromWeb(source as import("node:stream/web").ReadableStream),
    createWriteStream(temporary, { flags: "wx", mode: 0o600 })
  )
  await rename(temporary, target)
}
export function readStream(key: string) {
  return Readable.toWeb(
    createReadStream(pathFor(key))
  ) as ReadableStream<Uint8Array>
}
export async function deleteObject(key: string) {
  await rm(pathFor(key), { force: true })
}
export const storagePath = (...parts: string[]) => join(root, ...parts)
