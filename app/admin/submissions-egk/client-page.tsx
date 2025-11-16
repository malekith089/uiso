"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { showErrorToast } from "@/lib/error-handler"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Download, Search, FileText } from "lucide-react"

interface EGKSubmission {
  id: string
  registration_id: string
  final_file_url: string | null
  submitted_at: string | null
  updated_at: string
  registrations: {
    team_name: string
    user_id: string
    profiles: {
      full_name: string
      school_institution: string
      email: string
    }
  }
}

export default function SubmissionsEGKClient() {
  const [submissions, setSubmissions] = useState<EGKSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<EGKSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchSubmissions()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSubmissions(submissions)
    } else {
      const q = searchQuery.toLowerCase()
      const filtered = submissions.filter((sub) =>
        sub.registrations.team_name.toLowerCase().includes(q) ||
        sub.registrations.profiles.full_name.toLowerCase().includes(q) ||
        sub.registrations.profiles.school_institution.toLowerCase().includes(q) ||
        sub.registrations.profiles.email.toLowerCase().includes(q)
      )
      setFilteredSubmissions(filtered)
    }
  }, [searchQuery, submissions])

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("submissions_lomba")
        .select(`
          id,
          registration_id,
          final_file_url,
          submitted_at,
          updated_at,
          registrations:registrations!inner (
            team_name,
            user_id,
            is_finalist,
            competitions:competitions!inner (code, name),
            profiles:profiles!registrations_user_id_fkey (
              full_name,
              school_institution,
              email
            )
          )
        `)
        .eq("registrations.competitions.code", "EGK")
        .eq("registrations.is_finalist", true)
        .not("final_file_url", "is", null)
        .order("submitted_at", { ascending: false })

      if (error) throw error

      // NORMALIZATION — FIX untuk array → object
      const normalized: EGKSubmission[] = (data || []).map((item: any) => {
        const reg = Array.isArray(item.registrations)
          ? item.registrations[0]
          : item.registrations

        const profile = reg?.profiles
          ? Array.isArray(reg.profiles)
            ? reg.profiles[0]
            : reg.profiles
          : null

        return {
          id: item.id,
          registration_id: item.registration_id,
          final_file_url: item.final_file_url,
          submitted_at: item.submitted_at,
          updated_at: item.updated_at,
          registrations: {
            team_name: reg?.team_name ?? "-",
            user_id: reg?.user_id ?? "-",
            profiles: {
              full_name: profile?.full_name ?? "-",
              school_institution: profile?.school_institution ?? "-",
              email: profile?.email ?? "-"
            }
          }
        }
      })

      setSubmissions(normalized)
      setFilteredSubmissions(normalized)
    } catch (err) {
      console.error("Error fetching EGK submissions:", err)
      showErrorToast(err, "Fetch EGK Submissions")
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "No",
      "Nama Tim",
      "Nama Ketua",
      "Sekolah/Institusi",
      "Email",
      "Tanggal Submit",
      "Link File"
    ]

    const rows = filteredSubmissions.map((sub, index) => [
      index + 1,
      sub.registrations.team_name,
      sub.registrations.profiles.full_name,
      sub.registrations.profiles.school_institution,
      sub.registrations.profiles.email,
      sub.submitted_at
        ? format(new Date(sub.submitted_at), "dd/MM/yyyy HH:mm", { locale: id })
        : "-",
      sub.final_file_url || "-"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `egk-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Submisi Final EGK</CardTitle>
              <CardDescription>Daftar submisi berkas final dari finalis EGK</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama tim, ketua, sekolah, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filteredSubmissions.length} Submisi</Badge>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery
                  ? "Tidak ada submisi yang sesuai"
                  : "Belum ada submisi final EGK"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Tim</TableHead>
                    <TableHead>Nama Ketua</TableHead>
                    <TableHead>Sekolah/Institusi</TableHead>
                    <TableHead>Tanggal Submit</TableHead>
                    <TableHead>File</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredSubmissions.map((sub, index) => (
                    <TableRow key={sub.id}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell className="font-medium">
                        {sub.registrations.team_name}
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {sub.registrations.profiles.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sub.registrations.profiles.email}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {sub.registrations.profiles.school_institution}
                      </TableCell>

                      <TableCell>
                        {sub.submitted_at ? (
                          <div className="text-sm">
                            {format(new Date(sub.submitted_at), "dd MMM yyyy", { locale: id })}
                            <br />
                            <span className="text-gray-500">
                              {format(new Date(sub.submitted_at), "HH:mm", { locale: id })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {sub.final_file_url ? (
                          <Button variant="outline" size="sm" asChild>
                            <a href={sub.final_file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
