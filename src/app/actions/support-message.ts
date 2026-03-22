'use server'

import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'

export type SubmitSupportMessageResult =
  | { ok: true }
  | { ok: false; code: 'unauthorized' | 'invalid' | 'config' | 'database' | 'email' }

const MAX_MESSAGE = 8000

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitSupportMessage(input: {
  email: string
  message: string
}): Promise<SubmitSupportMessageResult> {
  const email = input.email.trim().slice(0, 254)
  const message = input.message.trim()

  if (!EMAIL_RE.test(email) || message.length < 1 || message.length > MAX_MESSAGE) {
    return { ok: false, code: 'invalid' }
  }

  const smtpUser = process.env.EMAIL_USER
  const smtpPass = process.env.EMAIL_PASS
  if (!smtpUser || !smtpPass) {
    return { ok: false, code: 'config' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, code: 'unauthorized' }
  }

  const { error: insertError } = await supabase.from('support_messages').insert({
    user_id: user.id,
    email,
    message,
  })

  if (insertError) {
    return { ok: false, code: 'database' }
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: 'customerservice@planora.app',
      replyTo: email,
      subject: `[Planora Support] ${email}`,
      text: `User ID: ${user.id}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>User ID:</strong> ${escapeHtml(user.id)}</p><p><strong>Email:</strong> ${escapeHtml(
        email
      )}</p><pre style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(message)}</pre>`,
    })
  } catch {
    return { ok: false, code: 'email' }
  }

  return { ok: true }
}
