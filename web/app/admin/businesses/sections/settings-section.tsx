'use client'

import { useBusinessForm } from '../business-form-context'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function SettingsSection() {
  const ctx = useBusinessForm()
  return (
    <>
      <div className={styles.checkRow}>
        <input
          id="is_published"
          type="checkbox"
          checked={ctx.isPublished}
          onChange={(e) => ctx.setIsPublished(e.target.checked)}
        />
        <label htmlFor="is_published">منشور على المنصة</label>
      </div>
      <div className={styles.checkRow}>
        <input
          id="is_open"
          type="checkbox"
          checked={ctx.isOpen}
          onChange={(e) => ctx.setIsOpen(e.target.checked)}
        />
        <label htmlFor="is_open">مفتوح حالياً</label>
      </div>
      <div className={styles.checkRow}>
        <input
          id="accepts_whatsapp_orders"
          type="checkbox"
          checked={ctx.acceptsWhatsapp}
          onChange={(e) => ctx.setAcceptsWhatsapp(e.target.checked)}
        />
        <label htmlFor="accepts_whatsapp_orders">تفعيل زر تواصل واتساب</label>
      </div>

      <p
        style={{
          margin: '4px 0 12px',
          fontSize: '0.72rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.5,
        }}
      >
        ملاحظة: استقبال الطلبات نفسها يُدار من لوحة Order Settings فوق (تفعيل/إيقاف + مدة الرد
        والتسليم).
      </p>

      <div className={styles.checkRow}>
        <input
          id="is_featured"
          type="checkbox"
          checked={ctx.isFeatured}
          onChange={(e) => ctx.setIsFeatured(e.target.checked)}
        />
        <label htmlFor="is_featured">مميز (Featured)</label>
      </div>

      <div className={styles.checkRow}>
        <input
          id="is_verified"
          type="checkbox"
          checked={ctx.isVerified}
          onChange={(e) => ctx.setIsVerified(e.target.checked)}
        />
        <label htmlFor="is_verified">☑️ موثق (Verified) — شهادة EAH الرسمية</label>
      </div>

      <p className={styles.hint}>
        لا يظهر النشاط في قسم المميزين بالرئيسية إلا بعد اعتماد اشتراك مدفوع ساري يتضمن «ظهور في الرئيسية». باقة الشارة فقط أو التجربة المجانية لا تكفي. بعد تحقق الاستحقاق يختار الأدمن الأنشطة، وتظهر كلها بكروت متساوية ودون ترتيب أول.
      </p>
      <p className={styles.hint}>
        يبدأ عرض الميزة 30 يومًا من تفعيلها. بعد انتهاء المدة يتوقف الظهور حتى تجديدها، مع استمرار ظهور النشاط بشكل عادي على المنصة.
      </p>

      <div className={styles.checkRow}>
        <input
          id="is_new_project"
          type="checkbox"
          checked={ctx.isNewProject}
          onChange={(e) => ctx.setIsNewProject(e.target.checked)}
        />
        <label htmlFor="is_new_project">إظهار في قسم الأنشطة الجديدة لمدة شهر</label>
      </div>
      <p className={styles.hint}>
        عند التفعيل تبدأ 30 يومًا تلقائيًا. بعد انتهائها يتوقف الظهور في هذا القسم، ويظل النشاط منشورًا عاديًا. فعّل الاختيار مرة أخرى لتجديد شهر جديد.
      </p>

      <SaveBar
        onClick={ctx.saveSettings}
        pending={ctx.pending}
        saved={ctx.savedSection === 'settings'}
      />
    </>
  )
}
