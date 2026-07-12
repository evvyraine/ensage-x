"use client"
import type { ShareSummary } from "./share-list"
import { ShareEditOverlay } from "./share-edit-overlay"
export function ShareRow({
  share,
  trash,
  divided,
}: {
  share: ShareSummary
  trash: boolean
  divided: boolean
}) {
  return <ShareEditOverlay share={share} trash={trash} divided={divided} />
}
