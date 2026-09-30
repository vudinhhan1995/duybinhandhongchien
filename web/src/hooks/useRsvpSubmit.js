import { useCallback, useRef, useState } from 'react'
import { rsvp } from '../data/weddingData'

/**
 * Giới hạn độ dài khớp với Apps Script gốc (validate phía server).
 */
export const RSVP_LIMITS = { guest: 200, relation: 200, wish: 2000 }

const EMPTY_FORM = { guest: '', relation: '', wish: '', attending: '' }

/** Kiểm tra phía client trước khi gửi. Trả về chuỗi lỗi tiếng Việt hoặc `null`. */
export function validateRsvp(values) {
  if (!values.guest.trim()) return 'Vui lòng nhập tên của bạn.'
  if (values.guest.trim().length > RSVP_LIMITS.guest)
    return `Tên không được vượt quá ${RSVP_LIMITS.guest} ký tự.`
  if (values.relation.trim().length > RSVP_LIMITS.relation)
    return `Quan hệ không được vượt quá ${RSVP_LIMITS.relation} ký tự.`
  if (values.wish.trim().length > RSVP_LIMITS.wish)
    return `Lời chúc không được vượt quá ${RSVP_LIMITS.wish} ký tự.`
  if (!values.attending) return 'Vui lòng chọn bạn có tham dự hay không.'
  return null
}

/**
 * Hook chứa toàn bộ state + logic gửi form RSVP.
 *
 * Apps Script không trả header CORS nên phải gửi `Content-Type:
 * text/plain;charset=utf-8` (simple request → không có preflight) kèm
 * `mode: 'no-cors'`. Response opaque nên không đọc được body — coi như
 * thành công, chỉ báo lỗi khi fetch ném exception (mất mạng...).
 *
 * @param {{onSuccess?: (data: object) => void}} options
 * @returns {{form, set, status, message, submit, reset}}
 *          status: 'idle' | 'sending' | 'success' | 'error'
 */
export function useRsvpSubmit({ onSuccess } = {}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const sendingRef = useRef(false)

  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const reset = useCallback(() => {
    setForm(EMPTY_FORM)
    setStatus('idle')
    setMessage('')
  }, [])

  const submit = useCallback(
    async (event) => {
      if (event && typeof event.preventDefault === 'function') event.preventDefault()
      if (sendingRef.current) return null

      const invalid = validateRsvp(form)
      if (invalid) {
        setStatus('error')
        setMessage(invalid)
        return null
      }
      // Chưa cấu hình endpoint ≠ lỗi mạng. Báo riêng để khách không bấm lại liên tục.
      if (!rsvp.endpoint) {
        setStatus('error')
        setMessage(rsvp.notConfiguredMessage)
        return null
      }

      sendingRef.current = true
      setStatus('sending')
      setMessage('')

      const data = {
        guest: form.guest.trim(),
        relation: form.relation.trim(),
        wish: form.wish.trim(),
        attending: form.attending,
        source: window.location.href,
        device: navigator.userAgent.slice(0, 200),
      }

      try {
        await fetch(rsvp.endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(data),
        })
        setStatus('success')
        setMessage(rsvp.successMessage)
        if (onSuccess) onSuccess(data)
        return data
      } catch {
        setStatus('error')
        setMessage(rsvp.offlineMessage)
        return null
      } finally {
        sendingRef.current = false
      }
    },
    [form, onSuccess],
  )

  return { form, set, status, message, submit, reset }
}
