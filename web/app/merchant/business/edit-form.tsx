'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import {
  CheckCircleIcon,
  AlertIcon,
  StoreIcon,
  PhoneIcon,
  WhatsAppIcon,
  MapPinIcon,
  FileTextIcon,
} from '@/components/icons'
import { updateMyBusiness } from './actions'
import ImageUploader from './image-uploader'
import styles from './edit.module.css'

type Props = {
  initial: {
    name: string
    area: string
    description: string
    hook: string
    address: string
    isOpen: boolean
    acceptsWhatsapp: boolean
    phone: string
    whatsapp: string
    businessType: string
    latitude: number | null
    longitude: number | null
    logoUrl: string | null
    coverUrl: string | null
  }
}

const TYPES: { value: string; label: string }[] = [
  { value: 'restaurant', label: 'مطعم / كافيه' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'delivery_office', label: 'مكتب توصيل' },
  { value: 'misc', label: 'نشاط آخر' },
]

export default function BusinessEditForm({ initial }: Props) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const res = await updateMyBusiness(formData)
      if (res.ok) {
        setMsg({ type: 'ok', text: 'اتحفظ ✓' })
      } else {
        setMsg({ type: 'err', text: res.error })
      }
      setTimeout(() => setMsg(null), 3000)
    })
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح مش بيدعم تحديد الموقع')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latInput = document.querySelector<HTMLInputElement>('input[name="latitude"]')
        const lngInput = document.querySelector<HTMLInputElement>('input[name="longitude"]')
        if (latInput) latInput.value = pos.coords.latitude.toFixed(6)
        if (lngInput) lngInput.value = pos.coords.longitude.toFixed(6)
      },
      () => alert('مقدرناش نجيب موقعك — اكتبه يدوي'),
    )
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {/* ═══ الصور ═══ */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <StoreIcon size={14} />
          <span>صور النشاط</span>
        </legend>

        <ImageUploader
          category="cover"
          initialUrl={initial.coverUrl}
          label="صورة الغلاف (Cover)"
          aspect="wide"
        />

        <ImageUploader
          category="logo"
          initialUrl={initial.logoUrl}
          label="اللوجو"
          aspect="square"
        />
      </fieldset>

      {/* ═══ الأساسي ═══ */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <FileTextIcon size={14} />
          <span>الأساسي</span>
        </legend>

        <label className={styles.field}>
          <span className={styles.label}>اسم النشاط *</span>
          <input
            className={styles.input}
            name="name"
            defaultValue={initial.name}
            maxLength={80}
            required
            dir="rtl"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>نوع النشاط</span>
          <select
            className={styles.select}
            name="business_type"
            defaultValue={initial.businessType}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>المنطقة</span>
            <input
              className={styles.input}
              name="area"
              defaultValue={initial.area}
              maxLength={50}
              placeholder="شبين القناطر"
              dir="rtl"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>العنوان التفصيلي</span>
            <input
              className={styles.input}
              name="address_text"
              defaultValue={initial.address}
              maxLength={200}
              placeholder="شارع الجمهورية — أمام مسجد النور"
              dir="rtl"
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>
            الهوك <span className={styles.hint}>سطر قصير يلفت الانتباه</span>
          </span>
          <input
            className={styles.input}
            name="hook"
            defaultValue={initial.hook}
            maxLength={120}
            placeholder="أحلى بيتزا في شبين — جرّبها مرة وهتعرف"
            dir="rtl"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>الوصف</span>
          <textarea
            className={styles.textarea}
            name="description"
            defaultValue={initial.description}
            maxLength={500}
            rows={3}
            placeholder="اكتب عن نشاطك — إيه اللي يميزك؟"
            dir="rtl"
          />
        </label>
      </fieldset>

      {/* ═══ الموقع ═══ */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <MapPinIcon size={14} />
          <span>الموقع الجغرافي</span>
        </legend>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>خط العرض (Latitude)</span>
            <input
              className={styles.input}
              name="latitude"
              type="number"
              step="0.000001"
              defaultValue={initial.latitude ?? ''}
              placeholder="30.123"
              dir="ltr"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>خط الطول (Longitude)</span>
            <input
              className={styles.input}
              name="longitude"
              type="number"
              step="0.000001"
              defaultValue={initial.longitude ?? ''}
              placeholder="31.123"
              dir="ltr"
            />
          </label>
        </div>

        <button type="button" onClick={useMyLocation} className={styles.gpsBtn}>
          <MapPinIcon size={14} />
          <span>استخدم موقعي الحالي</span>
        </button>

        <p className={styles.gpsHint}>
          الإحداثيات بتساعد المشترين يلاقوك على الخريطة وفي قسم &quot;قريب مني&quot;.
        </p>
      </fieldset>

      {/* ═══ التواصل ═══ */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <PhoneIcon size={14} />
          <span>التواصل</span>
        </legend>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>رقم التليفون</span>
            <input
              className={styles.input}
              name="phone"
              type="tel"
              defaultValue={initial.phone}
              placeholder="010xxxxxxxx"
              dir="ltr"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>رقم الواتساب</span>
            <input
              className={styles.input}
              name="whatsapp"
              type="tel"
              defaultValue={initial.whatsapp}
              placeholder="010xxxxxxxx"
              dir="ltr"
            />
          </label>
        </div>
      </fieldset>

      {/* ═══ الحالة ═══ */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <CheckCircleIcon size={14} />
          <span>الحالة</span>
        </legend>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="is_open"
            defaultChecked={initial.isOpen}
            className={styles.checkbox}
          />
          <span className={styles.toggleTrack} aria-hidden />
          <span className={styles.toggleLabel}>النشاط مفتوح دلوقتي</span>
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="accepts_whatsapp_orders"
            defaultChecked={initial.acceptsWhatsapp}
            className={styles.checkbox}
          />
          <span className={styles.toggleTrack} aria-hidden />
          <span className={styles.toggleLabel}>
            <WhatsAppIcon size={14} />
            تفعيل زر تواصل واتساب
          </span>
        </label>

        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(85, 231, 209, 0.06)',
            border: '1px solid rgba(85, 231, 209, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: '1 1 200px' }}>
            <strong style={{ fontSize: '0.85rem', color: '#8ff0e1' }}>
              استقبال الطلبات المباشرة (Orders)
            </strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              فعّل أو اقفل استلام الطلبات · حدد مدة الرد والتسليم
            </span>
          </div>
          <Link
            href="/merchant/orders/settings"
            style={{
              padding: '9px 16px',
              borderRadius: 10,
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'rgb(255, 255, 255)',
              background:
                'linear-gradient(135deg, rgba(85, 231, 209, 0.45), rgba(85, 231, 209, 0.22))',
              border: '1px solid rgba(85, 231, 209, 0.5)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            إدارة الاستلام ←
          </Link>
        </div>
      </fieldset>

      {msg && (
        <div className={`${styles.msg} ${msg.type === 'ok' ? styles.msgOk : styles.msgErr}`}>
          {msg.type === 'ok' ? <CheckCircleIcon size={14} /> : <AlertIcon size={14} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? 'بيحفظ…' : 'حفظ التعديلات'}
        </button>
      </div>
    </form>
  )
}
