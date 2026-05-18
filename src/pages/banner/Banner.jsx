import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Upload, Trash2, Image } from 'react-feather'
import toast from 'react-hot-toast'
import { addBanner, fetchBanners, deleteBanner } from '@/store/slices/usersSlice'
import { selectBanners } from '@/store/selectors'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmModal from '@/components/ui/ConfirmModal'
import PageHeader from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations'

const BannerCard = memo(function BannerCard({ banner, onDelete }) {
  return (
    <motion.div variants={staggerItem} className="bw-card overflow-hidden group">
      <div className="relative">
        <img
          src={banner.image || banner.imageUrl}
          alt={banner.title}
          loading="lazy"
          className="w-full h-36 sm:h-40 object-cover"
          onError={(e) => { e.target.src = 'https://placehold.co/400x160/111827/6B7280?text=Banner' }}
        />
        {/* Delete overlay — always visible on touch, hover on desktop */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                        sm:opacity-0 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onDelete(banner)}
            className="p-2 rounded-xl bg-red-500/80 text-white hover:bg-red-500 transition-colors"
            aria-label={`Delete ${banner.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
        {/* Mobile: always-visible delete button */}
        <button
          onClick={() => onDelete(banner)}
          className="absolute top-2 right-2 sm:hidden p-1.5 rounded-lg bg-red-500/80 text-white"
          aria-label={`Delete ${banner.title}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-bw-text truncate">{banner.title}</p>
        <p className="text-xs text-bw-muted mt-0.5">{formatDate(banner.createdAt)}</p>
      </div>
    </motion.div>
  )
})

export default function Banner() {
  const dispatch = useDispatch()
  const banners = useSelector(selectBanners)
  const fileRef = useRef(null)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { dispatch(fetchBanners()) }, [dispatch])

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const handleFileChange = useCallback((e) => {
    const f = e.target.files[0]
    if (!f) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [preview])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Please select an image'); return }
    if (!title.trim()) { toast.error('Please enter a title'); return }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('title', title)

    setUploading(true)
    await dispatch(addBanner(formData))
    setUploading(false)
    setTitle(''); setFile(null); setPreview(null)
    dispatch(fetchBanners())
  }, [file, title, dispatch])

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return
    dispatch(deleteBanner(deleteTarget._id))
    setDeleteTarget(null)
  }, [deleteTarget, dispatch])

  const bannerList = banners.data?.banners || banners.data?.data || []

  return (
    <motion.div {...fadeInUp} className="space-y-5 sm:space-y-6">
      <PageHeader title="Banner Management" subtitle="Manage news and announcement banners" />

      {/* Upload form */}
      <Card>
        <CardHeader title="Add New Banner" />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Banner Title"
              placeholder="Enter banner title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />

            {/* Drop zone — larger tap area on mobile */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
              className={[
                'border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors',
                preview ? 'border-bw-primary/40' : 'border-bw-border hover:border-bw-primary/40',
              ].join(' ')}
              aria-label="Upload banner image"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-32 sm:max-h-40 mx-auto rounded-xl object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-bw-muted">
                  <Image size={28} />
                  <p className="text-sm">Tap to upload banner image</p>
                  <p className="text-xs">PNG, JPG, GIF up to 5 MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <Button type="submit" loading={uploading} disabled={!file || !title.trim()} fullWidth>
              <Upload size={15} />
              Upload Banner
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Banner list */}
      <Card>
        <CardHeader title="Active Banners" subtitle={`${bannerList.length} banners`} />
        <CardBody>
          {banners.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : bannerList.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-bw-muted">
              <Image size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No banners yet. Add one above.</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            >
              {bannerList.map((banner) => (
                <BannerCard key={banner._id} banner={banner} onDelete={setDeleteTarget} />
              ))}
            </motion.div>
          )}
        </CardBody>
      </Card>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </motion.div>
  )
}
