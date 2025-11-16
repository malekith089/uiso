import { requireAdmin } from "@/lib/auth"
import SubmissionsEGKClient from "./client-page"

export default async function SubmissionsEGKPage() {
  await requireAdmin()
  
  return <SubmissionsEGKClient />
}