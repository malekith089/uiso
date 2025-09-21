export type Registration = {
  id: string
  status: string
  team_name: string | null
  identity_card_url: string | null
  engagement_proof_url: string | null
  payment_proof_url: string | null
  created_at: string
  updated_at: string
  selected_subject_id: string | null
  identity_card_verified: boolean | null
  engagement_proof_verified: boolean | null
  payment_proof_verified: boolean | null
  verified_by: string | null
  verified_at: string | null

  profiles?: {
    id: string
    full_name: string
    email: string
    school_institution: string
    education_level: string
    identity_number: string
    phone: string
    kelas: string | null
    semester: string | null
    tempat_lahir: string | null
    tanggal_lahir: string | null
    jenis_kelamin: string | null
    alamat: string | null
    created_at: string
  } | null

  competitions?: {
    name: string
    code: string
    participant_type: string
  } | null

  team_members?: {
    id: string
    full_name: string
    identity_number: string
    identity_card_url: string | null
    email: string
    phone: string
    school_institution: string
    education_level: string
    kelas: string | null
    semester: string | null
    tempat_lahir: string | null
    tanggal_lahir: string | null
    jenis_kelamin: string | null
    alamat: string | null
    identity_card_verified: boolean | null
    member_order: number
  }[]
}
