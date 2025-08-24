import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email } = await request.json()

  // Pastikan environment variables tersedia
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or Service Role Key is missing.')
    return NextResponse.json({ error: 'Konfigurasi server tidak lengkap.' }, { status: 500 })
  }

  // Membuat Supabase client DENGAN HAK AKSES ADMIN (service_role)
  // Ini PENTING untuk bisa menggunakan fungsi .auth.admin
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Menggunakan fungsi admin untuk membuat link reset password
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: email,
    options: {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    },
  })

  // Jika Supabase gagal membuat link (misalnya, email tidak ditemukan),
  // kita tetap kirim respons sukses untuk keamanan (mencegah email enumeration).
  if (error) {
    console.error('Supabase admin error:', error.message)
    return NextResponse.json({
      message: 'Jika email Anda terdaftar, kami telah mengirimkan link reset password.',
    })
  }

  const resetLink = data?.properties?.action_link

  if (!resetLink) {
    console.error('Supabase did not return a reset link.')
    return NextResponse.json({ error: 'Tidak dapat membuat link reset password.' }, { status: 500 })
  }

  // Kirim email menggunakan Resend
  try {
    const { error: resendError } = await resend.emails.send({
      from: 'UISO 2025 <onboarding@resend.dev>', // Ganti dengan domain terverifikasi Anda
      to: email,
      subject: 'Reset Password Akun UISO 2025 Anda',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset Password Akun UISO Anda</h2>
          <p>Halo,</p>
          <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password Anda</a>
          <p>Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut di browser Anda:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Jika Anda tidak merasa meminta ini, Anda bisa mengabaikan email ini dengan aman.</p>
          <br>
          <p>Terima kasih,</p>
          <p><strong>Tim UISO 2025</strong></p>
        </div>
      `,
    })

    if (resendError) {
      console.error('Resend error:', resendError)
      return NextResponse.json({ error: 'Gagal mengirim email.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Password reset email sent' })
  } catch (error) {
    console.error('Generic error sending email:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengirim email.' }, { status: 500 })
  }
}
