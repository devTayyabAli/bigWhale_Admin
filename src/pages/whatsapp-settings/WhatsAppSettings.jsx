import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { MessageCircle } from 'react-feather'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { fetchSettings, createSetting, updateSetting } from '@/services/whatsappSettings'
import { fadeInUp } from '@/animations'

const schema = yup.object({
  whatsapp_number: yup
    .string()
    .required('WhatsApp number is required')
    .matches(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number'),
  whatsapp_channel_url: yup
    .string()
    .required('WhatsApp channel URL is required')
    .test('is-url', 'Enter a valid URL', (value) => {
      if (!value) return false
      try {
        const url = new URL(value)
        return (url.protocol === 'http:' || url.protocol === 'https:') && url.host.length > 0
      } catch {
        return false
      }
    }),
})

export default function WhatsAppSettings() {
  const [isFetching, setIsFetching] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settingIds, setSettingIds] = useState({
    whatsapp_number: null,
    whatsapp_channel_url: null,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    fetchSettings()
      .then(({ data }) => {
        const items = data?.data ?? []
        const ids = { whatsapp_number: null, whatsapp_channel_url: null }
        const values = { whatsapp_number: '', whatsapp_channel_url: '' }

        items.forEach((item) => {
          if (item.key === 'whatsapp_number') {
            ids.whatsapp_number = item._id
            values.whatsapp_number = item.value
          } else if (item.key === 'whatsapp_channel_url') {
            ids.whatsapp_channel_url = item._id
            values.whatsapp_channel_url = item.value
          }
        })

        setSettingIds(ids)
        reset(values)
      })
      .catch(() => {
        toast.error('Failed to load settings')
      })
      .finally(() => {
        setIsFetching(false)
      })
  }, [reset])

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      const keys = ['whatsapp_number', 'whatsapp_channel_url']
      const results = await Promise.allSettled(
        keys.map(async (key) => {
          const value = data[key]
          const id = settingIds[key]
          if (id) {
            try {
              const res = await updateSetting(id, { value })
              return res
            } catch (err) {
              // 404 fallback: create instead
              if (err?.response?.status === 404) {
                return createSetting({ key, value })
              }
              throw err
            }
          } else {
            return createSetting({ key, value })
          }
        })
      )
      const anyFailed = results.some((r) => r.status === 'rejected')
      if (anyFailed) {
        toast.error('Failed to update some settings')
      } else {
        toast.success('WhatsApp settings updated successfully')
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="WhatsApp Settings" subtitle="Update contact information" />
      <div className="w-full sm:max-w-md">
        <Card>
          <CardHeader title="Contact Settings" actions={<MessageCircle size={16} className="text-bw-primary" />} />
          <CardBody className="space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="WhatsApp Number"
                type="tel"
                placeholder="e.g. +1234567890"
                error={errors.whatsapp_number?.message}
                disabled={isFetching || isSaving}
                {...register('whatsapp_number')}
              />
              <Input
                label="WhatsApp Channel URL"
                type="url"
                placeholder="https://wa.me/channel/..."
                error={errors.whatsapp_channel_url?.message}
                disabled={isFetching || isSaving}
                {...register('whatsapp_channel_url')}
              />
              <Button type="submit" fullWidth loading={isSaving} disabled={isFetching || isSaving}>
                {isSaving ? 'Saving…' : 'Save Settings'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  )
}
