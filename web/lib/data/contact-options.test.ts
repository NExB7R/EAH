import { describe, expect, it } from 'vitest'
import { buildContactOptions, safeContactOptionLabel } from './contact-options'

describe('business detail contact options', () => {
  it('keeps several phone and WhatsApp destinations from public contacts and active branches', () => {
    const options = buildContactOptions(
      [
        {
          id: 'branch-1',
          name: 'الفرع الرئيسي',
          is_primary: true,
          phone: '+12125550121',
          whatsapp: '+12125550131',
        },
        {
          id: 'branch-2',
          name: 'فرع السوق',
          is_primary: false,
          phone: '+12125550122',
          whatsapp: '+12125550132',
        },
      ],
      [
        {
          id: 'contact-phone-1',
          method_type: 'phone',
          value: '+12125550101',
          label: 'خدمة العملاء',
          is_primary: true,
        },
        {
          id: 'contact-phone-2',
          method_type: 'phone',
          value: '+12125550102',
          label: null,
          is_primary: false,
        },
        {
          id: 'contact-wa-1',
          method_type: 'whatsapp',
          value: '+12125550111',
          label: 'واتساب الطلبات',
          is_primary: true,
        },
        {
          id: 'contact-wa-2',
          method_type: 'whatsapp',
          value: '+12125550112',
          label: null,
          is_primary: false,
        },
      ],
    )

    expect(options.filter((option) => option.method === 'phone')).toHaveLength(4)
    expect(options.filter((option) => option.method === 'whatsapp')).toHaveLength(4)
    expect(options.filter((option) => option.branchId !== null)).toHaveLength(4)
    expect(options.filter((option) => option.contactId !== null)).toHaveLength(4)
    expect(options.map((option) => option.label)).not.toContain('+12125550121')
    expect(options.every((option) => Object.keys(option).sort().join(',') === 'branchId,contactId,isPrimary,label,method')).toBe(true)
    const serialized = JSON.stringify(options)
    for (const number of [
      '+12125550121', '+12125550131', '+12125550122', '+12125550132',
      '+12125550101', '+12125550102', '+12125550111', '+12125550112',
    ]) {
      expect(serialized).not.toContain(number)
    }
  })

  it('removes duplicate destinations after number normalization without mixing phone and WhatsApp', () => {
    const options = buildContactOptions(
      [
        {
          id: 'branch-1',
          name: 'فرع رئيسي',
          is_primary: true,
          phone: '+201012345678',
          whatsapp: '+201012345678',
        },
      ],
      [
        {
          id: 'contact-phone',
          method_type: 'phone',
          value: '+201012345678',
          label: 'رقم مكرر',
          is_primary: false,
        },
        {
          id: 'contact-wa',
          method_type: 'whatsapp',
          value: '01012345678',
          label: 'واتساب مكرر',
          is_primary: false,
        },
      ],
    )

    expect(options.filter((option) => option.method === 'phone')).toHaveLength(1)
    expect(options.filter((option) => option.method === 'whatsapp')).toHaveLength(1)
  })

  it('ignores invalid destinations and prevents phone numbers from being used as labels', () => {
    const options = buildContactOptions(
      [
        {
          id: 'branch-invalid',
          name: '01012345678',
          is_primary: true,
          phone: 'not-a-phone',
          whatsapp: 'bad-number',
        },
      ],
      [],
    )

    expect(options).toHaveLength(0)
    expect(safeContactOptionLabel('  فرع   السوق  ', 'فرع النشاط')).toBe('فرع السوق')
    expect(safeContactOptionLabel('+201012345678', 'رقم اتصال إضافي')).toBe(
      'رقم اتصال إضافي',
    )
  })
})
