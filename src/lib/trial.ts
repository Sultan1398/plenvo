/** نهاية العرض الترويجي: وصول مجاني حتى نهاية 30 يونيو 2026 (UTC) */
export const PROMO_TRIAL_END_UTC = new Date('2026-06-30T23:59:59.999Z')

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * يحدد تاريخ انتهاء الفترة التجريبية عند التسجيل:
 * - إذا كان التسجيل في أو قبل 30 يونيو 2026 → انتهاء التجربة في نهاية ذلك اليوم (UTC).
 * - بعد ذلك → 14 يوماً من تاريخ التسجيل.
 */
export function calculateTrialEndDate(signupDate: Date): Date {
  const signup = signupDate.getTime()
  if (signup <= PROMO_TRIAL_END_UTC.getTime()) {
    return new Date(PROMO_TRIAL_END_UTC)
  }
  return new Date(signup + 14 * MS_PER_DAY)
}

/** للعرض في الواجهة: ما زلنا ضمن فترة العرض الترويجي (قبل أو عند نهاية 30 يونيو 2026). */
export function isPromoTrialPeriodActive(now: Date = new Date()): boolean {
  return now.getTime() <= PROMO_TRIAL_END_UTC.getTime()
}
