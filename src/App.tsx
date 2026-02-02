import { useState, useEffect, useRef, useCallback } from 'react'
import { Youtube, Play, Loader2 } from 'lucide-react'
import {
  SiX, SiInstagram, SiTiktok, SiYoutube, SiGithub, SiGitlab, SiLinkedin,
  SiFacebook, SiTwitch, SiDribbble, SiMedium, SiDevdotto, SiReddit,
  SiPinterest, SiThreads, SiBluesky, SiMastodon, SiSubstack, SiPatreon,
  SiKofi, SiBuymeacoffee, SiSnapchat, SiDiscord, SiTelegram, SiWhatsapp,
} from 'react-icons/si'
import { Globe, Link as LinkIcon } from 'lucide-react'
import type { IconType } from 'react-icons'
import type { LucideIcon } from 'lucide-react'


// Types
enum BlockType {
  LINK = 'LINK',
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
  SOCIAL = 'SOCIAL',
  SOCIAL_ICON = 'SOCIAL_ICON',
  MAP = 'MAP',
  SPACER = 'SPACER'
}

type SocialPlatform = 'x' | 'instagram' | 'tiktok' | 'youtube' | 'github' | 'gitlab' | 'linkedin' | 'facebook' | 'twitch' | 'dribbble' | 'medium' | 'devto' | 'reddit' | 'pinterest' | 'threads' | 'bluesky' | 'mastodon' | 'substack' | 'patreon' | 'kofi' | 'buymeacoffee' | 'website' | 'snapchat' | 'discord' | 'telegram' | 'whatsapp' | 'custom'

interface BlockData {
  id: string
  type: BlockType
  title?: string
  content?: string
  subtext?: string
  imageUrl?: string
  mediaPosition?: { x: number; y: number }
  colSpan: number
  rowSpan: number
  color?: string
  customBackground?: string
  textColor?: string
  gridColumn?: number
  gridRow?: number
  channelId?: string
  youtubeVideoId?: string
  channelTitle?: string
  youtubeMode?: 'single' | 'grid' | 'list'
  youtubeVideos?: Array<{ id: string; title: string; thumbnail: string }>
  socialPlatform?: SocialPlatform
  socialHandle?: string
  zIndex?: number
}


// Social platforms config
const SOCIAL_PLATFORMS: Record<string, { icon: IconType | LucideIcon; brandColor: string; buildUrl: (h: string) => string }> = {
  x: { icon: SiX, brandColor: '#000000', buildUrl: (h) => `https://x.com/${h}` },
  instagram: { icon: SiInstagram, brandColor: '#E4405F', buildUrl: (h) => `https://instagram.com/${h}` },
  tiktok: { icon: SiTiktok, brandColor: '#000000', buildUrl: (h) => `https://tiktok.com/@${h}` },
  youtube: { icon: SiYoutube, brandColor: '#FF0000', buildUrl: (h) => `https://youtube.com/@${h}` },
  github: { icon: SiGithub, brandColor: '#181717', buildUrl: (h) => `https://github.com/${h}` },
  gitlab: { icon: SiGitlab, brandColor: '#FC6D26', buildUrl: (h) => `https://gitlab.com/${h}` },
  linkedin: { icon: SiLinkedin, brandColor: '#0A66C2', buildUrl: (h) => `https://linkedin.com/in/${h}` },
  facebook: { icon: SiFacebook, brandColor: '#1877F2', buildUrl: (h) => `https://facebook.com/${h}` },
  twitch: { icon: SiTwitch, brandColor: '#9146FF', buildUrl: (h) => `https://twitch.tv/${h}` },
  dribbble: { icon: SiDribbble, brandColor: '#EA4C89', buildUrl: (h) => `https://dribbble.com/${h}` },
  medium: { icon: SiMedium, brandColor: '#000000', buildUrl: (h) => `https://medium.com/@${h}` },
  devto: { icon: SiDevdotto, brandColor: '#0A0A0A', buildUrl: (h) => `https://dev.to/${h}` },
  reddit: { icon: SiReddit, brandColor: '#FF4500', buildUrl: (h) => `https://reddit.com/user/${h}` },
  pinterest: { icon: SiPinterest, brandColor: '#BD081C', buildUrl: (h) => `https://pinterest.com/${h}` },
  threads: { icon: SiThreads, brandColor: '#000000', buildUrl: (h) => `https://threads.net/@${h}` },
  bluesky: { icon: SiBluesky, brandColor: '#0085FF', buildUrl: (h) => `https://bsky.app/profile/${h}` },
  mastodon: { icon: SiMastodon, brandColor: '#6364FF', buildUrl: (h) => h },
  substack: { icon: SiSubstack, brandColor: '#FF6719', buildUrl: (h) => `https://${h}.substack.com` },
  patreon: { icon: SiPatreon, brandColor: '#FF424D', buildUrl: (h) => `https://patreon.com/${h}` },
  kofi: { icon: SiKofi, brandColor: '#FF5E5B', buildUrl: (h) => `https://ko-fi.com/${h}` },
  buymeacoffee: { icon: SiBuymeacoffee, brandColor: '#FFDD00', buildUrl: (h) => `https://buymeacoffee.com/${h}` },
  snapchat: { icon: SiSnapchat, brandColor: '#FFFC00', buildUrl: (h) => `https://snapchat.com/add/${h}` },
  discord: { icon: SiDiscord, brandColor: '#5865F2', buildUrl: (h) => h },
  telegram: { icon: SiTelegram, brandColor: '#26A5E4', buildUrl: (h) => `https://t.me/${h}` },
  whatsapp: { icon: SiWhatsapp, brandColor: '#25D366', buildUrl: (h) => `https://wa.me/${h}` },
  website: { icon: Globe, brandColor: '#6B7280', buildUrl: (h) => h.startsWith('http') ? h : `https://${h}` },
  custom: { icon: LinkIcon, brandColor: '#6B7280', buildUrl: (h) => h },
}

// Format follower count: 220430 → "220k", 1500000 → "1.5M"
const formatFollowerCount = (count: number | undefined): string => {
  if (count === undefined || count === null) return ''
  if (count < 1000) return String(count)
  if (count < 1000000) {
    const k = count / 1000
    return k >= 100 ? `${Math.round(k)}k` : `${k.toFixed(k % 1 === 0 ? 0 : 1)}k`
  }
  const m = count / 1000000
  return m >= 100 ? `${Math.round(m)}M` : `${m.toFixed(m % 1 === 0 ? 0 : 1)}M`
}


// Tilt effect hook
const useTiltEffect = (isEnabled = true) => {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({})
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled || !elementRef.current) return
    const rect = elementRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    const shadowX = rotateY * 1.5
    const shadowY = rotateX * -1.5
    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      boxShadow: `${shadowX}px ${shadowY}px 25px rgba(0,0,0,0.15), 0 8px 30px rgba(0,0,0,0.1)`,
      transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
      '--glare-x': `${glareX}%`,
      '--glare-y': `${glareY}%`,
    } as React.CSSProperties)
  }, [isEnabled])

  const handleMouseLeave = useCallback(() => {
    if (!isEnabled) return
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
    })
  }, [isEnabled])

  return { elementRef, tiltStyle, handleMouseMove, handleMouseLeave }
}


// Block component
const Block = ({ block }: { block: BlockData }) => {
  const { elementRef, tiltStyle, handleMouseMove, handleMouseLeave } = useTiltEffect(true)
  const [videos, setVideos] = useState(block.youtubeVideos || [])
  const [loading, setLoading] = useState(false)
  const mediaPos = block.mediaPosition || { x: 50, y: 50 }

  useEffect(() => {
    if (block.type === BlockType.SOCIAL && block.channelId && !block.youtubeVideos?.length) {
      setLoading(true)
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${block.channelId}`
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`
      fetch(proxyUrl).then(r => r.text()).then(text => {
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'text/xml')
        const entries = Array.from(xml.querySelectorAll('entry'))
        const vids = entries.slice(0, 4).map(e => {
          const id = e.getElementsByTagName('yt:videoId')[0]?.textContent || ''
          const title = e.getElementsByTagName('title')[0]?.textContent || ''
          return { id, title, thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg` }
        })
        if (vids.length) setVideos(vids)
      }).catch(() => {}).finally(() => setLoading(false))
    }
  }, [block.channelId, block.youtubeVideos, block.type])

  const getBorderRadius = () => {
    const minDim = Math.min(block.colSpan, block.rowSpan)
    if (minDim <= 1) return '0.5rem'
    if (minDim <= 2) return '0.625rem'
    if (minDim <= 3) return '0.75rem'
    return '0.875rem'
  }
  const borderRadius = getBorderRadius()

  const gridStyle: React.CSSProperties = {}
  if (block.gridColumn !== undefined) {
    gridStyle.gridColumnStart = block.gridColumn
    gridStyle.gridColumnEnd = block.gridColumn + block.colSpan
  }
  if (block.gridRow !== undefined) {
    gridStyle.gridRowStart = block.gridRow
    gridStyle.gridRowEnd = block.gridRow + block.rowSpan
  }

  const handleClick = () => {
    let url = block.content
    if (block.type === BlockType.SOCIAL && block.socialPlatform && block.socialHandle) {
      url = SOCIAL_PLATFORMS[block.socialPlatform]?.buildUrl(block.socialHandle)
    } else if (block.channelId) {
      url = `https://youtube.com/channel/${block.channelId}`
    }
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const isYoutube = block.type === BlockType.SOCIAL && block.channelId
  const activeVideoId = block.youtubeVideoId || videos[0]?.id
  const isRichYT = isYoutube && activeVideoId && block.youtubeMode !== 'grid' && block.youtubeMode !== 'list'
  const isYTGrid = isYoutube && (block.youtubeMode === 'grid' || block.youtubeMode === 'list')
  const isLinkImg = block.type === BlockType.LINK && block.imageUrl

  if (block.type === BlockType.SPACER) return <div style={{ borderRadius, ...gridStyle }} className="h-full" />

  if (block.type === BlockType.SOCIAL_ICON) {
    const platform = SOCIAL_PLATFORMS[block.socialPlatform || 'custom']
    const Icon = platform?.icon
    const url = block.socialHandle ? platform?.buildUrl(block.socialHandle) : ''
    return (
      <a href={url || undefined} target="_blank" rel="noopener noreferrer" onClick={handleClick}
        className={`bento-item relative h-full ${block.color || 'bg-white'} flex items-center justify-center shadow-sm border border-gray-100 hover:shadow-md transition-all`}
        style={{ borderRadius, ...gridStyle, ...(block.customBackground ? { background: block.customBackground } : {}) }}>
        {Icon && <span style={{ color: platform.brandColor }}><Icon size={24} /></span>}
      </a>
    )
  }

  if (isYTGrid) {
    return (
      <div onClick={handleClick} style={{ borderRadius, ...gridStyle, ...(block.customBackground ? { background: block.customBackground } : {}) }}
        className={`bento-item group cursor-pointer h-full ${block.color || 'bg-white'} ring-1 ring-black/5 shadow-sm hover:shadow-xl transition-all`}>
        <div className="w-full h-full flex flex-col p-2 md:p-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center"><Youtube size={12} /></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] md:text-xs font-bold text-gray-900 truncate">{block.channelTitle || 'YouTube'}</h3>
              <span className="text-[8px] text-gray-400">Latest videos</span>
            </div>
          </div>
          {loading ? <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={16} /></div> : (
            <div className="flex-1 grid grid-cols-2 gap-1 overflow-hidden">
              {videos.slice(0, 4).map((v, i) => (
                <a key={i} href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="relative overflow-hidden rounded bg-gray-100 group/vid">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover/vid:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity">
                      <Play size={10} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  let bgStyle: React.CSSProperties = block.customBackground ? { background: block.customBackground } : {}
  if (isRichYT) bgStyle = { backgroundImage: `url(https://img.youtube.com/vi/${activeVideoId}/maxresdefault.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }
  else if (isLinkImg && block.imageUrl) bgStyle = { backgroundImage: `url(${block.imageUrl})`, backgroundSize: 'cover', backgroundPosition: `${mediaPos.x}% ${mediaPos.y}%` }

  return (
    <div onClick={handleClick} style={{ ...gridStyle }} className="cursor-pointer h-full transform-gpu">
      <div ref={elementRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
        style={{ ...bgStyle, borderRadius, ...tiltStyle, width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
        className={`bento-item group relative overflow-hidden w-full h-full ${!block.customBackground && !isLinkImg && !isRichYT ? (block.color || 'bg-white') : ''} ${block.textColor || 'text-gray-900'} ring-1 ring-black/5 shadow-sm transition-all`}>
        <div className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.25) 0%, transparent 60%)' }} />
        {(isRichYT || isLinkImg) && (block.title || block.subtext) && (
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-0" />
        )}
        <div className="w-full h-full relative z-10">
          {block.type === BlockType.MEDIA && block.imageUrl ? (
            <div className="w-full h-full relative overflow-hidden">
              {/\.(mp4|webm|ogg|mov)$/i.test(block.imageUrl) ? (
                <video src={block.imageUrl} className="full-img" style={{ objectPosition: `${mediaPos.x}% ${mediaPos.y}%` }} autoPlay loop muted playsInline />
              ) : (
                <img src={block.imageUrl} alt={block.title || ''} className="full-img" style={{ objectPosition: `${mediaPos.x}% ${mediaPos.y}%` }} />
              )}
              {block.title && <div className="media-overlay"><p className="media-title text-sm">{block.title}</p>{block.subtext && <p className="media-subtext">{block.subtext}</p>}</div>}
            </div>
          ) : block.type === BlockType.MAP ? (
            <div className="w-full h-full relative bg-gray-100 overflow-hidden">
              <iframe width="100%" height="100%" className="opacity-95 grayscale-[20%] group-hover:grayscale-0 transition-all"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(block.content || 'Paris')}&t=&z=13&ie=UTF8&iwloc=&output=embed`} loading="lazy" sandbox="allow-scripts allow-same-origin" />
              {block.title && <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent"><p className="font-semibold text-white text-sm">{block.title}</p></div>}
            </div>
          ) : isRichYT ? (
            <div className="w-full h-full relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play size={16} className="text-white ml-0.5" fill="white" />
                </div>
              </div>
              {(block.channelTitle || block.title) && <div className="absolute bottom-0 left-0 right-0 p-3"><h3 className="font-semibold text-white text-sm drop-shadow-lg">{block.channelTitle || block.title}</h3></div>}
            </div>
          ) : (
            <div className="p-3 h-full flex flex-col justify-between">
              {block.type === BlockType.SOCIAL && block.socialPlatform && (() => {
                const platform = SOCIAL_PLATFORMS[block.socialPlatform]
                const Icon = platform?.icon
                return Icon ? (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${block.textColor === 'text-white' || isLinkImg ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'}`}
                    style={{ color: block.textColor === 'text-brand' ? platform.brandColor : undefined }}>
                    <Icon size={14} />
                  </div>
                ) : null
              })()}
              <div className={block.type === BlockType.TEXT ? 'flex flex-col justify-center h-full' : 'mt-auto'}>
                <h3 className={`font-bold leading-tight ${isLinkImg ? 'text-white drop-shadow-lg' : ''}`}>{block.title}</h3>
                {block.subtext && <p className={`text-xs mt-1 ${isLinkImg ? 'text-white/80' : 'opacity-60'}`}>{block.subtext}</p>}
                {block.type === BlockType.TEXT && block.content && <p className="opacity-70 mt-2 text-sm whitespace-pre-wrap">{block.content}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// Profile data
const profile = {"name":"JB1101","bio":"Lifelong student","avatarUrl":"./assets/avatar.png","theme":"light","primaryColor":"blue","showBranding":false,"analytics":{"enabled":true,"supabaseUrl":"https://lqvyathsidkfelhphgmf.supabase.co","anonKey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdnlhdGhzaWRrZmVsaHBoZ21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MzQ4MTYsImV4cCI6MjA4NTUxMDgxNn0.3bFfWdQaGWDXqo2iMCKttFCEHg5WV2xIXKVBXMuoo94"},"socialAccounts":[{"platform":"telegram","handle":"bl1tz2200"},{"platform":"github","handle":"bl1tz2200"},{"platform":"discord","handle":"https://discord.com/users/637926492898328577"}],"showSocialInHeader":true,"showFollowerCount":false,"backgroundColor":"#ffffff","openGraph":{"title":"Bl1tz2200","image":"data:image/jpeg;base64,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","description":"Here's some info about me","siteName":"Bio"}}
const blocks: BlockData[] = [{"id":"vrnumf33u","type":"TEXT","title":"What's about me?","content":"","colSpan":9,"rowSpan":1,"color":"bg-white","textColor":"text-gray-900","gridColumn":1,"gridRow":1},{"id":"05vb0jmv9","type":"MEDIA","title":"Observe","content":"","colSpan":2,"rowSpan":3,"color":"bg-white","textColor":"text-gray-900","gridColumn":1,"gridRow":2,"imageUrl":"./assets/block-05vb0jmv9.png"},{"id":"9a9ddq079","type":"MEDIA","title":"Create","content":"","colSpan":3,"rowSpan":3,"color":"bg-white","textColor":"text-gray-900","gridColumn":3,"gridRow":2,"imageUrl":"./assets/block-9a9ddq079.png"},{"id":"8f1323f4-80df-41e7-86a8-65f5ad424ea1","type":"MEDIA","title":"Control","content":"","colSpan":2,"rowSpan":7,"color":"bg-red-500","textColor":"text-white","gridColumn":6,"gridRow":2,"imageUrl":"./assets/block-8f1323f4-80df-41e7-86a8-65f5ad424ea1.png"},{"id":"y1sfpljzr","type":"MEDIA","title":"Play","content":"","colSpan":2,"rowSpan":7,"color":"bg-red-500","textColor":"text-white","gridColumn":8,"gridRow":2,"imageUrl":"./assets/block-y1sfpljzr.png"},{"id":"9p6fmmd4d","type":"MEDIA","title":"Imagine","content":"","colSpan":3,"rowSpan":3,"color":"bg-white","textColor":"text-gray-900","gridColumn":1,"gridRow":5,"imageUrl":"./assets/block-9p6fmmd4d.png"},{"id":"vrsn21m9g","type":"MEDIA","title":"Handle","content":"","colSpan":2,"rowSpan":3,"color":"bg-white","textColor":"text-gray-900","gridColumn":4,"gridRow":5,"imageUrl":"./assets/block-vrsn21m9g.png"},{"id":"26cpo29if","type":"TEXT","title":"SciFi | Study | Space | Sec","content":"","colSpan":5,"rowSpan":1,"color":"bg-gray-900","textColor":"text-white","gridColumn":1,"gridRow":8},{"id":"md373nqat","type":"MEDIA","title":"","content":"","colSpan":5,"rowSpan":4,"color":"bg-white","textColor":"text-gray-900","gridColumn":1,"gridRow":9,"imageUrl":"./assets/block-md373nqat.png"},{"id":"so2qrvsuv","type":"MEDIA","title":"","content":"","colSpan":4,"rowSpan":4,"color":"bg-white","textColor":"text-gray-900","gridColumn":6,"gridRow":9,"imageUrl":"./assets/block-so2qrvsuv.png"},{"id":"p7afrcqtu","type":"TEXT","title":"Music closet","content":"","colSpan":9,"rowSpan":1,"color":"bg-white","textColor":"text-gray-900","gridColumn":1,"gridRow":13},{"id":"ff821b62-5985-415f-9f09-9e8d937e75eb","type":"LINK","title":"Ghost - 3Force","content":"https://www.shazam.com/song/1621405201/ghost","colSpan":2,"rowSpan":3,"color":"bg-white","textColor":"text-gray-900","gridColumn":1,"gridRow":14,"imageUrl":"./assets/block-ff821b62-5985-415f-9f09-9e8d937e75eb.png","zIndex":14,"mediaPosition":{"x":55.113834989552146,"y":8.035714285714299}},{"id":"m8n52ql85","type":"LINK","title":"Rush S - Noice Cream","content":"https://www.shazam.com/song/1635365285/rush-s","colSpan":2,"rowSpan":3,"color":"bg-white","textColor":"text-gray-900","gridColumn":3,"gridRow":14,"imageUrl":"./assets/block-m8n52ql85.png","zIndex":12,"mediaPosition":{"x":54.68770808363298,"y":47.93956043956045}},{"id":"0da8a045-0e66-4748-a249-0c01376365fb","type":"LINK","title":"Loud Silence - Oudate Electro","content":"https://www.shazam.com/song/1760543302/loud-silence-2","colSpan":3,"rowSpan":3,"color":"bg-white","textColor":"text-gray-900","gridColumn":5,"gridRow":14,"imageUrl":"./assets/block-0da8a045-0e66-4748-a249-0c01376365fb.png","zIndex":13,"mediaPosition":{"x":53.83545427179464,"y":64.76648351648353}},{"id":"969622fe-dc52-4727-ab28-8c6730799e06","type":"LINK","title":"Lonely Night - Fury Weekend","content":"https://www.shazam.com/song/1523903309/lonely-night","colSpan":2,"rowSpan":3,"color":"bg-white","textColor":"text-gray-900","gridColumn":8,"gridRow":14,"imageUrl":"./assets/block-969622fe-dc52-4727-ab28-8c6730799e06.png","mediaPosition":{"x":54.68770808363298,"y":47.93956043956045}},{"id":"w0g4v0nwf","type":"TEXT","title":"Get in Touch","content":"","colSpan":9,"rowSpan":1,"color":"bg-white","textColor":"text-gray-900","gridColumn":1,"gridRow":17},{"id":"pskjsp1hf","type":"LINK","title":"Anon Ask","content":"http://t.me/anonaskbot?start=bl1tz2200","colSpan":3,"rowSpan":3,"color":"bg-pink-500","textColor":"text-white","gridColumn":3,"gridRow":18,"imageUrl":"./assets/block-pskjsp1hf.png","zIndex":21,"mediaPosition":{"x":47.35318444995865,"y":65}},{"id":"o125le600","type":"SOCIAL","title":"Telegram","content":"https://t.me/bl1tz2200","colSpan":2,"rowSpan":3,"color":"bg-white","textColor":"text-brand","gridColumn":1,"gridRow":18,"socialPlatform":"telegram","socialHandle":"bl1tz2200","subtext":"@bl1tz2200"},{"id":"770e4fb6-c9f1-4a69-84ac-2aeb117fcd86","type":"SOCIAL","title":"Discord","content":"<a>https://discord.com/users/637926492898328577","colSpan":2,"rowSpan":3,"color":"bg-white","textColor":"text-brand","gridColumn":6,"gridRow":18,"socialPlatform":"discord","socialHandle":"users","subtext":"#bl1tz2200"},{"id":"2gwh3s2ts","type":"SOCIAL","title":"GitHub","content":"https://github.com/bl1tz2200","colSpan":2,"rowSpan":3,"color":"bg-gray-900","textColor":"text-white","gridColumn":8,"gridRow":18,"socialPlatform":"github","socialHandle":"bl1tz2200","subtext":"@bl1tz2200"}]

// Analytics hook (uses Edge Function - no API keys exposed)
const useAnalytics = () => {
  const sessionStart = useRef(Date.now())
  const maxScroll = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
      maxScroll.current = Math.max(maxScroll.current, scrollPercent)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const config = profile.analytics
    if (!config?.enabled || !config?.supabaseUrl) return

    const track = async (eventType: 'page_view' | 'click', extra: { blockId?: string; destinationUrl?: string } = {}) => {
      const utm = new URLSearchParams(window.location.search)
      const payload = {
        siteId: 'bento_1769938863911_ha7m3e8zb',
        event: eventType,
        blockId: extra.blockId,
        destinationUrl: extra.destinationUrl,
        pageUrl: window.location.href,
        referrer: document.referrer || undefined,
        utm: {
          source: utm.get('utm_source') || undefined,
          medium: utm.get('utm_medium') || undefined,
          campaign: utm.get('utm_campaign') || undefined,
          term: utm.get('utm_term') || undefined,
          content: utm.get('utm_content') || undefined,
        },
        language: navigator.language,
        screenW: window.screen?.width,
        screenH: window.screen?.height,
      }
      // Use Edge Function endpoint (secure - no API keys needed)
      const endpoint = config.supabaseUrl.replace(/\/+$/, '') + '/functions/v1/openbento-analytics-track'
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {})
    }

    track('page_view')

    // Note: session_end is not supported by the Edge Function, only page_view and click
    // If you need session tracking, extend the Edge Function
  }, [])
}


// Mobile layout helper - calculates responsive grid spans
const getMobileLayout = (block: BlockData) => ({
  colSpan: block.colSpan >= 4 ? 2 : 1,
  rowSpan: block.colSpan >= 3 && block.colSpan < 5 ? Math.max(block.rowSpan, 2) : block.rowSpan
})

// Sort blocks for mobile
const sortedBlocks = [...blocks].sort((a, b) => {
  const aRow = a.gridRow ?? 999
  const bRow = b.gridRow ?? 999
  const aCol = a.gridColumn ?? 999
  const bCol = b.gridColumn ?? 999
  if (aRow !== bRow) return aRow - bRow
  return aCol - bCol
})

export default function App() {
  useAnalytics()

  const avatarStyle = { borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '4px solid #ffffff' }
  const bgStyle: React.CSSProperties = { backgroundColor: '#ffffff' }

  return (
    <div className="min-h-screen font-sans" style={bgStyle}>
      
      <div className="relative z-10">

        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <div className="fixed left-0 top-0 w-[420px] h-screen flex flex-col justify-center items-start px-12">
            <div className="w-40 h-40 overflow-hidden bg-gray-100 mb-8" style={avatarStyle}>
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">{profile.name}</h1>
            <p className="text-base text-gray-500 font-medium whitespace-pre-wrap max-w-xs">{profile.bio}</p>
            
            <div className="flex flex-wrap gap-3 mt-4">
              {profile.socialAccounts?.map((acc: any) => {
                const platform = SOCIAL_PLATFORMS[acc.platform]
                const Icon = platform?.icon
                const url = platform?.buildUrl(acc.handle)
                const showCount = profile.showFollowerCount && acc.followerCount
                return (
                  <a key={acc.platform} href={url} target="_blank" rel="noopener noreferrer"
                    className={`${showCount ? 'px-3 py-2' : 'w-10 h-10'} bg-white rounded-full shadow-md flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg transition-all`}
                    style={{ color: platform?.brandColor }}>
                    {Icon && <Icon size={20} />}
                    {showCount && (
                      <span className="text-sm font-semibold text-gray-700">
                        {formatFollowerCount(acc.followerCount)}
                      </span>
                    )}
                  </a>
                )
              })}
            </div>
          </div>
          <div className="ml-[420px] flex-1 p-12">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(9, 1fr)', gridAutoRows: '64px' }}>
              {blocks.map(block => <Block key={block.id} block={block} />)}
            </div>
          </div>
        </div>


        {/* Mobile Layout - 2 columns adaptive */}
        <div className="lg:hidden">
          <div className="p-4 pt-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 overflow-hidden bg-gray-100" style={avatarStyle}>
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">{profile.name}</h1>
            <p className="text-sm text-gray-500 font-medium whitespace-pre-wrap max-w-xs">{profile.bio}</p>
            
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {profile.socialAccounts?.map((acc: any) => {
                const platform = SOCIAL_PLATFORMS[acc.platform]
                const Icon = platform?.icon
                const url = platform?.buildUrl(acc.handle)
                const showCount = profile.showFollowerCount && acc.followerCount
                return (
                  <a key={acc.platform} href={url} target="_blank" rel="noopener noreferrer"
                      className={`${showCount ? 'px-3 py-2' : 'w-10 h-10'} bg-white rounded-full shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform`}
                    style={{ color: platform?.brandColor }}>
                    {Icon && <Icon size={20} />}
                    {showCount && (
                      <span className="text-sm font-semibold text-gray-900">
                        {formatFollowerCount(acc.followerCount)}
                      </span>
                    )}
                  </a>
                )
              })}
            </div>
          </div>
          <div className="p-4">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridAutoRows: '80px', gap: '12px' }}>
              {sortedBlocks.map(block => {
                const mobile = getMobileLayout(block)
                return (
                  <div key={block.id} style={{ gridColumn: `span ${mobile.colSpan}`, gridRow: `span ${mobile.rowSpan}` }}>
                    <Block block={{ ...block, gridColumn: undefined, gridRow: undefined }} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
