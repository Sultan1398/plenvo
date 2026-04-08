export function mapAuthError(message: string, locale: 'ar' | 'en'): string {
  const m = (message || '').toLowerCase()

  if (m.includes('invalid email')) {
    return locale === 'ar'
      ? 'يرجى إدخال بريد إلكتروني صالح.'
      : 'Please enter a valid email address.'
  }

  if (m.includes('invalid login credentials')) {
    return locale === 'ar'
      ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
      : 'The email or password is incorrect.'
  }

  if (m.includes('password should be at least')) {
    return locale === 'ar'
      ? 'كلمة المرور ضعيفة، يجب أن تحتوي على 6 أحرف على الأقل.'
      : 'Your password is too weak; it must be at least 6 characters long.'
  }

  if (m.includes('user already registered')) {
    return locale === 'ar'
      ? 'هذا البريد الإلكتروني مسجل لدينا بالفعل.'
      : 'This email address is already registered.'
  }

  if (m.includes('expired') || m.includes('invalid_recovery_code')) {
    return locale === 'ar'
      ? 'الرابط غير صالح أو منتهي الصلاحية. الرجاء طلب رابط جديد.'
      : 'This link is invalid or has expired. Please request a new one.'
  }

  return locale === 'ar'
    ? 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى لاحقاً.'
    : 'Something unexpected went wrong. Please try again later.'
}
