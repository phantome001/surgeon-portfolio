'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { ArrowRight, Play, Eye, Clock, X } from 'lucide-react'

interface Category {
  id: string
  slug: string
  name_ar: string
  name_fr: string
  emoji: string
  sort_order: number
}

interface Video {
  id: string
  category_id: string
  title_ar: string
  title_fr: string
  desc_ar: string
  desc_fr: string
  embed_url: string
  duration: string
  views: number
}

export default function VideosPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  const getVideoId = (embedUrl: string) => {
    const match = embedUrl.match(/embed\/([^?&#]+)/)
    return match ? match[1] : null
  }

  const getThumbnail = (embedUrl: string) => {
    const videoId = getVideoId(embedUrl)
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cats } = await (supabase
          .from('video_categories') as any)
          .select('*')
          .order('sort_order')

        if (cats) setCategories(cats)
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  useEffect(() => {
    if (!selectedCategory) return
    const fetchVideos = async () => {
      setLoading(true)
      try {
        const { data } = await (supabase
          .from('videos') as any)
          .select('*')
          .eq('category_id', selectedCategory)
          .eq('is_published', true)

        if (data) setVideos(data)
      } catch (err) {
        console.error('Error fetching videos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [selectedCategory, supabase])

  const handleWatchVideo = async (video: Video) => {
    // Update local state immediately to show new count
    const updatedVideo = { ...video, views: (video.views || 0) + 1 }
    setSelectedVideo(updatedVideo)
    setVideos(prev => prev.map(v => v.id === video.id ? updatedVideo : v))
    // Increment view count in database
    try {
      await (supabase.from('videos') as any)
        .update({ views: (video.views || 0) + 1 })
        .eq('id', video.id)
    } catch (err) {
      console.error('Error incrementing views:', err)
    }
  }

  if (selectedVideo) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text">{selectedVideo.title_ar}</h2>
            <button
              onClick={() => setSelectedVideo(null)}
              className="p-2 rounded-lg bg-surface hover:bg-surface2 text-muted hover:text-text transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden bg-navy-800">
            <iframe
              src={selectedVideo.embed_url}
              title={selectedVideo.title_ar}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="mt-4 card">
            <p className="text-muted">{selectedVideo.desc_ar}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedVideo.duration}</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedVideo.views} مشاهدة</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-heading">🎬 مكتبة الفيديوهات الجراحية</h1>
          <p className="section-subheading">فيديوهات تعليمية لعمليات جراحية بالمنظار</p>
        </div>

        {/* Back button */}
        {selectedCategory && (
          <button
            onClick={() => { setSelectedCategory(null); setVideos([]) }}
            className="flex items-center gap-2 text-gold hover:text-gold-light mb-6 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة للفئات</span>
          </button>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !selectedCategory ? (
          /* Category Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="card-glow text-start group"
              >
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <h3 className="font-semibold text-text group-hover:text-gold transition-colors">
                  {cat.name_ar}
                </h3>
                <p className="text-sm text-muted mt-1">{cat.name_fr}</p>
              </button>
            ))}
          </div>
        ) : (
          /* Video List */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => handleWatchVideo(video)}
                className="card-glow text-start group overflow-hidden"
              >
                <div className="aspect-video bg-navy-700 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  {getThumbnail(video.embed_url) ? (
                    <img
                      src={getThumbnail(video.embed_url)!}
                      alt={video.title_ar}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  ) : null}
                  <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-gold/80 transition-colors z-10">
                    <Play className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1 z-10">
                    <Eye className="w-3 h-3" /> {video.views || 0}
                  </div>
                </div>
                <h3 className="font-semibold text-text group-hover:text-gold transition-colors mb-2">
                  {video.title_ar}
                </h3>
                <p className="text-sm text-muted line-clamp-2">{video.desc_ar}</p>
              </button>
            ))}
            {videos.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted">لا توجد فيديوهات في هذه الفئة حالياً</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
