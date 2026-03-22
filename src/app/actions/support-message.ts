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

  // 1. الحفظ في قاعدة البيانات (يعمل بنجاح)
  const { error: insertError } = await supabase.from('support_messages').insert({
    user_id: user.id,
    email,
    message,
  })

  if (insertError) {
    return { ok: false, code: 'database' }
  }

  // 2. إعدادات الإرسال (تم تعديلها لتتوافق مع Office 365)
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // يجب أن تكون false للمنفذ 587
    requireTLS: true, // إجباري لمايكروسوفت
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      ciphers: 'SSLv3', // تشفير إضافي يمنع مايكروسوفت من رفض الاتصال
      rejectUnauthorized: false // يساعد في بيئة التطوير المحلية
    }
  })

  // 3. محاولة الإرسال
  try {
    await transporter.sendMail({
      from: smtpUser, // يجب أن يكون الإيميل الرسمي
      to: 'customerservice@planora.app',
      replyTo: email,
      subject: `[Planora Support] ${email}`,
      text: `User ID: ${user.id}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>User ID:</strong> ${escapeHtml(user.id)}</p><p><strong>Email:</strong> ${escapeHtml(
        email
      )}</p><pre style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(message)}</pre>`,
    })
  } catch (error) {
    // هذا السطر مهم جداً لكشف أي خطأ من مايكروسوفت
    console.error("❌ تفاصيل رفض خادم البريد:", error);
    return { ok: false, code: 'email' }
  }

  return { ok: true }
}