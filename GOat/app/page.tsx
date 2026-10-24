'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpLeft,
  Check,
  ChevronLeft,
  Copy,
  ExternalLink,
  Heart,
  Layers,
  Menu,
  Pin,
  PinOff,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react'

export type Track = 'الكل' | 'الويب' | 'صور' | 'فيديو' | 'صوت'
export type Tier = 'free' | 'trial' | 'pro'

export type Tool = {
  id: string
  name: string
  nameAr: string
  description: string
  tags: string[]
  subCategories: string[]
  track: Exclude<Track, 'الكل'>
  tier: Tier
  emoji: string
  domain: string
  url: string
}

export const tierInfo: Record<Tier, { label: string; dot: string; text: string }> = {
  free: { label: 'عِدة ببلاش', dot: 'bg-emerald-400', text: 'text-emerald-300' },
  trial: { label: 'جربها ببلاش', dot: 'bg-amber-300', text: 'text-amber-200' },
  pro: { label: 'عِدة متكلفة', dot: 'bg-violet-400', text: 'text-violet-300' },
}

export interface SubCategoryOption {
  id: string
  labelEn: string
  labelAr: string
}

export const subCategoriesByTrack: Record<Track, SubCategoryOption[]> = {
  'الكل': [
    { id: 'all', labelEn: 'All', labelAr: 'الكل' },
    { id: 'blocks', labelEn: 'Blocks', labelAr: 'مكونات وبلوكات' },
    { id: 'templates', labelEn: 'Templates', labelAr: 'قوالب جاهزة' },
    { id: 'mockup', labelEn: 'Mockups', labelAr: 'موكاب ونماذج' },
    { id: 'elements', labelEn: 'Elements', labelAr: 'عناصر وفيكتور' },
    { id: 'ai', labelEn: 'AI Powered', labelAr: 'ذكاء اصطناعي' },
  ],
  'الويب': [
    { id: 'all', labelEn: 'All', labelAr: 'الكل' },
    { id: 'blocks', labelEn: 'Blocks', labelAr: 'كتل ومكونات' },
    { id: 'templates', labelEn: 'Templates', labelAr: 'قوالب وصفحات' },
    { id: 'ai-builders', labelEn: 'AI Builders', labelAr: 'تطوير بالـ AI' },
    { id: 'elements-3d', labelEn: 'Elements & 3D', labelAr: 'عناصر وتصاميم 3D' },
  ],
  'صور': [
    { id: 'all', labelEn: 'All', labelAr: 'الكل' },
    { id: 'mockup', labelEn: 'Mockup', labelAr: 'موكابس ونماذج' },
    { id: 'elements', labelEn: 'Elements', labelAr: 'عناصر وتفريغ PNG' },
    { id: 'ai-gen', labelEn: 'AI Gen', labelAr: 'توليد بالـ AI' },
    { id: 'studio', labelEn: 'Studio & Edit', labelAr: 'استوديو وتكبير جودة' },
  ],
  'فيديو': [
    { id: 'all', labelEn: 'All', labelAr: 'الكل' },
    { id: 'stock', labelEn: 'Stock & B-Roll', labelAr: 'خامات وفيديوهات 4K' },
    { id: 'ai-video', labelEn: 'AI Video', labelAr: 'توليد فيديو بالـ AI' },
    { id: 'editing', labelEn: 'Editing & VFX', labelAr: 'مونتاج وكابشنز' },
    { id: 'templates', labelEn: 'Templates', labelAr: 'قوالب ومؤثرات' },
  ],
  'صوت': [
    { id: 'all', labelEn: 'All', labelAr: 'الكل' },
    { id: 'voice-ai', labelEn: 'Voice AI', labelAr: 'أصوات بشرية وتوليد' },
    { id: 'music', labelEn: 'Music', labelAr: 'موسيقى وألحان' },
    { id: 'sfx', labelEn: 'SFX', labelAr: 'مؤثرات صوتية' },
    { id: 'enhancement', labelEn: 'Enhancement', labelAr: 'تنقية وهندسة صوت' },
  ],
}

export const tools: Tool[] = [
  // 🌐 مسار الويب والتطوير
  { id: 'aceternity', name: 'Aceternity UI', nameAr: 'أسيتيرنيتي يو آي', description: 'مكونات واجهات وأنيميشن تفاعلية خرافية مبنية بـ Tailwind و Framer Motion', tags: ['UI', 'React', 'Animation', 'Tailwind'], subCategories: ['blocks', 'elements-3d'], track: 'الويب', tier: 'free', emoji: '✨', domain: 'ui.aceternity.com', url: 'https://ui.aceternity.com' },
  { id: 'v0', name: 'v0.dev', nameAr: 'ڤي زيرو', description: 'ابني واجهات وتطبيقات تفاعلية بالذكاء الاصطناعي مع كود جاهز للنسخ', tags: ['AI', 'React', 'Next.js', 'Vercel'], subCategories: ['ai-builders', 'blocks', 'templates'], track: 'الويب', tier: 'trial', emoji: '◈', domain: 'v0.dev', url: 'https://v0.dev' },
  { id: 'shadcn', name: 'shadcn/ui', nameAr: 'شاد سي إن', description: 'مكتبة المكونات الأكثر شعبية في عالم React، مرنة وقابلة للتخصيص بالكامل', tags: ['React', 'Tailwind', 'UI', 'Components'], subCategories: ['blocks'], track: 'الويب', tier: 'free', emoji: '◫', domain: 'ui.shadcn.com', url: 'https://ui.shadcn.com' },
  { id: 'uiverse', name: 'Uiverse', nameAr: 'يوآيڤيرس', description: 'مكتبة مجانية ضخمة من زراير، كروت، وأنيميشن CSS جاهزة بضغطة زر', tags: ['CSS', 'Buttons', 'UI', 'OpenSource'], subCategories: ['blocks', 'elements-3d'], track: 'الويب', tier: 'free', emoji: '🧩', domain: 'uiverse.io', url: 'https://uiverse.io' },
  { id: 'cursor', name: 'Cursor AI', nameAr: 'كيرسور', description: 'محرر الأكواد الذكي رقم #1 عالمياً المعتمد على نماذج Claude و GPT البرمجية', tags: ['IDE', 'Code', 'AI', 'Editor'], subCategories: ['ai-builders'], track: 'الويب', tier: 'trial', emoji: '⚡', domain: 'cursor.com', url: 'https://cursor.com' },
  { id: 'bolt', name: 'Bolt.new', nameAr: 'بولت', description: 'بيئة تطوير ذكية متكاملة في المتصفح تنشئ وتشغل تطبيقات Full-Stack فورياً', tags: ['AI', 'Fullstack', 'WebContainer', 'Prompt'], subCategories: ['ai-builders', 'templates'], track: 'الويب', tier: 'trial', emoji: '⚡', domain: 'bolt.new', url: 'https://bolt.new' },
  { id: 'vscode', name: 'Visual Studio Code', nameAr: 'فيجوال ستوديو كود', description: 'برنامج المطورين المكتبي الأشهر والأقوى لتطوير البرمجيات بآلاف الإضافات', tags: ['Desktop', 'IDE', 'OpenSource', 'Code'], subCategories: ['ai-builders'], track: 'الويب', tier: 'free', emoji: '💻', domain: 'code.visualstudio.com', url: 'https://code.visualstudio.com' },
  { id: 'tailblocks', name: 'Tailblocks', nameAr: 'تيل بلوكس', description: 'أقسام وتصاميم جاهزة للمواقع (Hero, Pricing, Features) بـ Tailwind CSS', tags: ['Tailwind', 'Templates', 'Free', 'Sections'], subCategories: ['blocks', 'templates'], track: 'الويب', tier: 'free', emoji: '🧱', domain: 'tailblocks.cc', url: 'https://tailblocks.cc' },
  { id: 'shadcnblocks', name: 'Shadcnblocks', nameAr: 'شاد سي إن بلوكس', description: 'أكثر من 500 قسم وبلوك جاهز مبني بـ Tailwind و Shadcn للتطبيقات والمواقع', tags: ['Blocks', 'Shadcn', 'Tailwind', 'Free'], subCategories: ['blocks', 'templates'], track: 'الويب', tier: 'free', emoji: '🧱', domain: 'shadcnblocks.com', url: 'https://shadcnblocks.com' },
  { id: 'haikei', name: 'Haikei', nameAr: 'هايكي', description: 'مولد خلفيات وتدرجات وتموجات SVG هندسية جذابة وفريدة للواجهات', tags: ['SVG', 'Background', 'Generators', 'Design'], subCategories: ['elements-3d'], track: 'الويب', tier: 'free', emoji: '🌊', domain: 'haikei.app', url: 'https://haikei.app' },
  { id: 'spline', name: 'Spline 3D', nameAr: 'سبلاين', description: 'صمم كائنات وتجارب ثلاثية الأبعاد تفاعلية وصدرها مباشرة لموقعك', tags: ['3D', 'Web', 'Interactive', 'Design'], subCategories: ['elements-3d'], track: 'الويب', tier: 'trial', emoji: '◉', domain: 'spline.design', url: 'https://spline.design' },
  { id: 'fontshare', name: 'Fontshare', nameAr: 'فونت شير', description: 'مكتبة خطوط احترافية مجانية بنسبة 100% للاستخدام الشخصي والتجاري', tags: ['Typography', 'Fonts', 'Free', 'Commercial'], subCategories: ['elements-3d'], track: 'الويب', tier: 'free', emoji: '🔤', domain: 'fontshare.com', url: 'https://fontshare.com' },
  { id: 'supabase', name: 'Supabase', nameAr: 'سوبابيز', description: 'بديل Firebase مفتوح المصدر؛ قاعدة بيانات Postgres، Auth، وتخزين فوري', tags: ['Database', 'Postgres', 'Backend', 'Auth'], subCategories: ['blocks', 'ai-builders'], track: 'الويب', tier: 'trial', emoji: '⚡', domain: 'supabase.com', url: 'https://supabase.com' },
  { id: 'rayso', name: 'Ray.so', nameAr: 'راي سو', description: 'حوّل مقتطفات الأكواد إلى لقطات وصور أنيقة وبألوان فخمة للنشر', tags: ['Code', 'Screenshots', 'Branding', 'Free'], subCategories: ['elements-3d'], track: 'الويب', tier: 'free', emoji: '📸', domain: 'ray.so', url: 'https://ray.so' },
  { id: 'tailwindui', name: 'Tailwind UI', nameAr: 'تيلويند يو آي', description: 'المكتبة الرسمية المتميزة من صناع Tailwind، قوالب متكاملة للمشاريع الفاخرة', tags: ['Premium', 'Tailwind', 'Templates', 'Pro'], subCategories: ['templates', 'blocks'], track: 'الويب', tier: 'pro', emoji: '💎', domain: 'tailwindui.com', url: 'https://tailwindui.com' },

  // 🎨 مسار الصور والتصميم
  { id: 'shots', name: 'Shots.so', nameAr: 'شوتس', description: 'حوّل سكرين شوتس موقعك أو تطبيقك إلى موكابس وإطارات أجهزة احترافية', tags: ['Mockup', 'Devices', 'Social', 'Free'], subCategories: ['mockup'], track: 'صور', tier: 'free', emoji: '▧', domain: 'shots.so', url: 'https://shots.so' },
  { id: 'cleanpng', name: 'CleanPNG', nameAr: 'كلين بي إن جي', description: 'ملايين صور المنتجات والعناصر الشفافة المقصوصة بجودة عالية وجاهزة للتحميل', tags: ['PNG', 'Transparent', 'Cutout', 'Free'], subCategories: ['elements'], track: 'صور', tier: 'free', emoji: '✂️', domain: 'cleanpng.com', url: 'https://www.cleanpng.com' },
  { id: 'svgrepo', name: 'SVG Repo', nameAr: 'إس في جي ريبو', description: 'أكثر من 500 ألف أيقونة وعنصر فيكتور SVG مجاني للاستخدام التجاري المباشر', tags: ['SVG', 'Icons', 'Vector', 'Elements'], subCategories: ['elements'], track: 'صور', tier: 'free', emoji: '💠', domain: 'svgrepo.com', url: 'https://www.svgrepo.com' },
  { id: 'mockupworld', name: 'Mockup World', nameAr: 'موكاب وورلد', description: 'أضخم مكتبة موكابس PSD مجانية ونظيفة للمنتجات، الهواتف، والعبوات', tags: ['Mockups', 'PSD', 'Packaging', 'Free'], subCategories: ['mockup'], track: 'صور', tier: 'free', emoji: '📦', domain: 'mockupworld.co', url: 'https://www.mockupworld.co' },
  { id: 'clipdrop', name: 'Clipdrop', nameAr: 'كليب دروب', description: 'أزل الخلفية، امسح أي عنصر غير مرغوب، واضبط الإضاءة بالذكاء الاصطناعي', tags: ['AI', 'Cleanup', 'RemoveBG', 'Product'], subCategories: ['ai-gen', 'studio'], track: 'صور', tier: 'trial', emoji: '✦', domain: 'clipdrop.co', url: 'https://clipdrop.co' },
  { id: 'upscayl', name: 'Upscayl', nameAr: 'أبسكايل', description: 'برنامج مكتبي مجاني ومفتوح المصدر لتكبير دقة الصور 4X و 8X بتقنية AI محلياً', tags: ['Desktop', 'AI', 'Upscale', 'OpenSource'], subCategories: ['studio'], track: 'صور', tier: 'free', emoji: '↗', domain: 'upscayl.org', url: 'https://upscayl.org' },
  { id: 'flux', name: 'FLUX.1', nameAr: 'فلوكس', description: 'أقوى نموذج مفتوح لتوليد الصور والمنتجات بواقعية متناهية ودقة تفاصيل خارقة', tags: ['AI', 'ImageGen', 'Photorealistic', 'StateOfTheArt'], subCategories: ['ai-gen'], track: 'صور', tier: 'trial', emoji: '⚡', domain: 'blackforestlabs.ai', url: 'https://blackforestlabs.ai' },
  { id: 'midjourney', name: 'Midjourney', nameAr: 'ميدجورني', description: 'المنصة الأقوى عالمياً في توليد الصور الفنية والتجارية فائقة الإتقان', tags: ['AI', 'Art', 'Premium', 'Creative'], subCategories: ['ai-gen'], track: 'صور', tier: 'pro', emoji: '🎨', domain: 'midjourney.com', url: 'https://www.midjourney.com' },
  { id: 'vectorizer', name: 'Vectorizer.ai', nameAr: 'فيكتورايزر', description: 'تحويل أي لوجو أو صورة بيكسلية (PNG/JPG) إلى فيكتور SVG هندسي حاد', tags: ['SVG', 'Vector', 'Trace', 'AI'], subCategories: ['elements'], track: 'صور', tier: 'trial', emoji: '📐', domain: 'vectorizer.ai', url: 'https://vectorizer.ai' },
  { id: 'photoroom', name: 'Photoroom', nameAr: 'فوتوروم', description: 'استوديو تصوير إلكتروني يضع منتجاتك في خلفيات تجارية واستوديو احترافي بلمسة', tags: ['E-commerce', 'Products', 'Studio', 'AI'], subCategories: ['mockup', 'studio', 'ai-gen'], track: 'صور', tier: 'trial', emoji: '🛍️', domain: 'photoroom.com', url: 'https://www.photoroom.com' },
  { id: 'yellowimages', name: 'Yellow Images', nameAr: 'يلو إيمدجز', description: 'أضخم منصة مدفوعة للموكابس الحصرية ثلاثية الأبعاد وعناصر التغليف للمنتجات', tags: ['Mockups', '3D', 'Apparel', 'Pro'], subCategories: ['mockup', 'elements'], track: 'صور', tier: 'pro', emoji: '⭐', domain: 'yellowimages.com', url: 'https://yellowimages.com' },
  { id: 'unsplash', name: 'Unsplash', nameAr: 'أنسبلاش', description: 'مكتبة عالمية لصور فوتوغرافية فائقة الجودة من مصورين محترفين مجاناً', tags: ['Stock', 'HighRes', 'Photos', 'Free'], subCategories: ['elements'], track: 'صور', tier: 'free', emoji: '📷', domain: 'unsplash.com', url: 'https://unsplash.com' },
  { id: 'figma', name: 'Figma', nameAr: 'فيجما', description: 'بيئة التصميم السحابية التشاركية رقم 1 لتصميم الواجهات وتجربة المستخدم والأنظمة', tags: ['UI/UX', 'Design', 'Prototyping', 'Vector'], subCategories: ['studio', 'mockup'], track: 'صور', tier: 'trial', emoji: '❖', domain: 'figma.com', url: 'https://www.figma.com' },

  // 🎬 مسار الفيديو والمونتاج
  { id: 'capcut', name: 'CapCut', nameAr: 'كاب كت', description: 'برنامج المونتاج الأكثر انتشاراً؛ تفريغ ذكي، كابشن تلقائي، وقوالب سريعة', tags: ['Editing', 'Shorts', 'Captions', 'Desktop'], subCategories: ['editing', 'templates'], track: 'فيديو', tier: 'trial', emoji: '◒', domain: 'capcut.com', url: 'https://www.capcut.com' },
  { id: 'kling', name: 'Kling AI', nameAr: 'كلينج', description: 'توليد لقطات ومشاهد فيديو سينمائية مذهلة ومحاكاة فيزيائية عالية الواقعية', tags: ['AI', 'VideoGen', 'Cinematic', 'Realistic'], subCategories: ['ai-video'], track: 'فيديو', tier: 'trial', emoji: '◌', domain: 'klingai.com', url: 'https://klingai.com' },
  { id: 'runway', name: 'Runway Gen-3 Alpha', nameAr: 'رن واي', description: 'أداة الإخراج السينمائي المتقدمة بالذكاء الاصطناعي مع تحكم فائق في زوايا الكاميرا', tags: ['AI', 'Video', 'Motion', 'VFX'], subCategories: ['ai-video'], track: 'فيديو', tier: 'trial', emoji: '🎬', domain: 'runwayml.com', url: 'https://runwayml.com' },
  { id: 'davinci', name: 'DaVinci Resolve', nameAr: 'دافينشي ريزولف', description: 'البرنامج المكتبي الأقوى لهوليوود في المونتاج، الجرافيك، وتصحيح الألوان (نسخة مجانية)', tags: ['Desktop', 'ProEditing', 'ColorGrading', 'Free'], subCategories: ['editing'], track: 'فيديو', tier: 'free', emoji: '🎞️', domain: 'blackmagicdesign.com', url: 'https://www.blackmagicdesign.com/products/davinciresolve' },
  { id: 'pexels', name: 'Pexels Video', nameAr: 'بيكسلز فيديو', description: 'مكتبة ضخمة من مقاطع الفيديو الحرة بدقة 4K جاهزة للتحميل والاستخدام الفوري', tags: ['Stock', '4K', 'Footage', 'B-roll'], subCategories: ['stock'], track: 'فيديو', tier: 'free', emoji: '▶', domain: 'pexels.com', url: 'https://www.pexels.com/videos' },
  { id: 'mixkit', name: 'Mixkit', nameAr: 'ميكس كيت', description: 'مقاطع فيديو ومؤثرات وموسيقى وقوالب Premiere Pro مجانية بدون حقوق', tags: ['Templates', 'Free', 'StockVideo', 'Premiere'], subCategories: ['stock', 'templates'], track: 'فيديو', tier: 'free', emoji: '🎦', domain: 'mixkit.co', url: 'https://mixkit.co' },
  { id: 'submagic', name: 'Submagic', nameAr: 'سب ماجيك', description: 'توليد نصوص كابشن ديناميكية مع إيموجي ومؤثرات تلقائية لريلز وتيك توك', tags: ['Captions', 'Reels', 'TikTok', 'AI'], subCategories: ['editing'], track: 'فيديو', tier: 'trial', emoji: '✨', domain: 'submagic.co', url: 'https://www.submagic.co' },
  { id: 'luma', name: 'Luma Dream Machine', nameAr: 'لوما دريم مشين', description: 'كاميرا ومحرك فيديو ذكي يولد حركة كاميرا سينمائية سلسة ثلاثية الأبعاد', tags: ['AI', 'VideoGen', 'CameraMovements', '3D'], subCategories: ['ai-video'], track: 'فيديو', tier: 'trial', emoji: '🎥', domain: 'lumalabs.ai', url: 'https://lumalabs.ai/dream-machine' },
  { id: 'envato', name: 'Envato Elements', nameAr: 'إنفاتو إليمنتس', description: 'الاشتراك الشامل الأضخم في العالم لقوالب الفيديو، المونتاج، والمؤثرات الاحترافية', tags: ['Templates', 'Premiere', 'AfterEffects', 'Pro'], subCategories: ['templates', 'stock'], track: 'فيديو', tier: 'pro', emoji: '👑', domain: 'elements.envato.com', url: 'https://elements.envato.com' },

  // 🎙️ مسار الصوت والمؤثرات
  { id: 'elevenlabs', name: 'ElevenLabs', nameAr: 'إليفن لابس', description: 'محاكي الصوت البشري الأكثر طبيعية مع استنساخ النبرات ودعم الدبلجة العربية بدقة', tags: ['AI', 'Voice', 'TTS', 'VoiceCloning'], subCategories: ['voice-ai'], track: 'صوت', tier: 'trial', emoji: '🎙️', domain: 'elevenlabs.io', url: 'https://elevenlabs.io' },
  { id: 'adobe', name: 'Adobe Podcast', nameAr: 'أدوبي بودكاست', description: 'تنقية الصوت عبر الذكاء الاصطناعي وإزالة الضوضاء ليصبح بجودة ميكروفون استوديو', tags: ['AI', 'Denoise', 'Podcast', 'Enhance'], subCategories: ['enhancement'], track: 'صوت', tier: 'trial', emoji: '🎧', domain: 'podcast.adobe.com', url: 'https://podcast.adobe.com' },
  { id: 'audacity', name: 'Audacity', nameAr: 'أوداسيتي', description: 'برنامج الديسكتوب المفتوح المصدر الأقدم والأشهر لتسجيل وتحرير وهندسة الصوتيات', tags: ['Desktop', 'OpenSource', 'DAW', 'Recording'], subCategories: ['enhancement'], track: 'صوت', tier: 'free', emoji: '🎛️', domain: 'audacityteam.org', url: 'https://www.audacityteam.org' },
  { id: 'freesound', name: 'Freesound', nameAr: 'فري ساوند', description: 'أكبر مجتمع ومكتبة عالمية لمؤثرات الأصوات (SFX) الحرة والمجانية لمشاريعك', tags: ['SFX', 'Free', 'SoundEffects', 'CreativeCommons'], subCategories: ['sfx'], track: 'صوت', tier: 'free', emoji: '♬', domain: 'freesound.org', url: 'https://freesound.org' },
  { id: 'pixabaymusic', name: 'Pixabay Music', nameAr: 'بيكساباي ميوزك', description: 'تراكات موسيقية مجانية مرخصة بالكامل بدون حقوق ملكية للمحتوى والإعلانات', tags: ['RoyaltyFree', 'Music', 'BackgroundAudio', 'Free'], subCategories: ['music'], track: 'صوت', tier: 'free', emoji: '🎶', domain: 'pixabay.com', url: 'https://pixabay.com/music' },
  { id: 'suno', name: 'Suno AI', nameAr: 'سونو', description: 'صانع الأغاني والموسيقى بالذكاء الاصطناعي؛ ولّد أغنية كاملة بكلمات وألحان من فكرتك', tags: ['AI', 'MusicGen', 'Songs', 'Audio'], subCategories: ['music', 'voice-ai'], track: 'صوت', tier: 'trial', emoji: '🎵', domain: 'suno.com', url: 'https://suno.com' },
  { id: 'fishaudio', name: 'Fish Audio', nameAr: 'فيش أوديو', description: 'محرك استنساخ أصوات سريع وتوليد تعابير صوتية عالية الدقة للمحتوى التفاعلي', tags: ['AI', 'VoiceCloning', 'LowLatency', 'Audio'], subCategories: ['voice-ai'], track: 'صوت', tier: 'trial', emoji: '🐟', domain: 'fish.audio', url: 'https://fish.audio' },
  { id: 'epidemicsound', name: 'Epidemic Sound', nameAr: 'إبيديميك ساوند', description: 'المعيار الذهبي لموسيقى اليوتيوب وصناع الأفلام بدون أي تحذيرات حقوق (Copyright-safe)', tags: ['Music', 'Licensing', 'Creators', 'Pro'], subCategories: ['music'], track: 'صوت', tier: 'pro', emoji: '🎼', domain: 'epidemicsound.com', url: 'https://www.epidemicsound.com' },
]

export interface RoadmapStep {
  number: string
  title: string
  defaultTool: string
  defaultUrl: string
  recommendedToolIds: string[]
}

export interface Roadmap {
  id: string
  icon: string
  title: string
  subtitle: string
  steps: RoadmapStep[]
}

export const roadmaps: Roadmap[] = [
  {
    id: 'site',
    icon: '⌘',
    title: 'عايز أعمل موقع',
    subtitle: 'من الفكرة لأول نسخة شغالة',
    steps: [
      { number: '01', title: 'اكتب فكرتك', defaultTool: 'v0.dev', defaultUrl: 'https://v0.dev', recommendedToolIds: ['v0', 'bolt', 'cursor', 'vscode'] },
      { number: '02', title: 'ركّب الواجهة', defaultTool: 'shadcn/ui', defaultUrl: 'https://ui.shadcn.com', recommendedToolIds: ['shadcn', 'tailblocks', 'shadcnblocks', 'tailwindui', 'aceternity'] },
      { number: '03', title: 'ضيف لمستك', defaultTool: 'Uiverse', defaultUrl: 'https://uiverse.io', recommendedToolIds: ['uiverse', 'aceternity', 'spline', 'haikei', 'fontshare'] },
      { number: '04', title: 'انشرها', defaultTool: 'Vercel', defaultUrl: 'https://vercel.com', recommendedToolIds: ['supabase', 'rayso'] },
    ],
  },
  {
    id: 'product',
    icon: '▧',
    title: 'عايز صورة منتج',
    subtitle: 'صورة تبيع وتشد العين',
    steps: [
      { number: '01', title: 'نضّف الصورة', defaultTool: 'Clipdrop', defaultUrl: 'https://clipdrop.co', recommendedToolIds: ['clipdrop', 'cleanpng', 'photoroom'] },
      { number: '02', title: 'اعمل موكاب', defaultTool: 'Shots.so', defaultUrl: 'https://shots.so', recommendedToolIds: ['shots', 'mockupworld', 'yellowimages'] },
      { number: '03', title: 'كبّر الجودة', defaultTool: 'Upscayl', defaultUrl: 'https://upscayl.org', recommendedToolIds: ['upscayl', 'vectorizer'] },
      { number: '04', title: 'ولّد أفكار', defaultTool: 'FLUX.1', defaultUrl: 'https://blackforestlabs.ai', recommendedToolIds: ['flux', 'midjourney', 'photoroom'] },
    ],
  },
  {
    id: 'video',
    icon: '▶',
    title: 'عايز أعمل فيديو',
    subtitle: 'من خامة لفيديو جاهز للنشر',
    steps: [
      { number: '01', title: 'هات الخامة', defaultTool: 'Pexels Video', defaultUrl: 'https://www.pexels.com/videos', recommendedToolIds: ['pexels', 'mixkit', 'envato'] },
      { number: '02', title: 'منتج بسرعة', defaultTool: 'CapCut Web', defaultUrl: 'https://www.capcut.com', recommendedToolIds: ['capcut', 'davinci', 'submagic'] },
      { number: '03', title: 'ولّد لقطة', defaultTool: 'Kling AI', defaultUrl: 'https://klingai.com', recommendedToolIds: ['kling', 'runway', 'luma'] },
      { number: '04', title: 'انشره', defaultTool: 'Runway', defaultUrl: 'https://runwayml.com', recommendedToolIds: ['runway', 'submagic', 'capcut'] },
    ],
  },
  {
    id: 'podcast',
    icon: '◉',
    title: 'عايز أعمل بودكاست',
    subtitle: 'صوت نظيف وحضور مختلف',
    steps: [
      { number: '01', title: 'سجّل صوتك', defaultTool: 'Adobe Podcast', defaultUrl: 'https://podcast.adobe.com', recommendedToolIds: ['adobe', 'audacity'] },
      { number: '02', title: 'حسّن الصوت', defaultTool: 'ElevenLabs', defaultUrl: 'https://elevenlabs.io', recommendedToolIds: ['elevenlabs', 'fishaudio', 'adobe'] },
      { number: '03', title: 'ضيف مؤثرات', defaultTool: 'Freesound', defaultUrl: 'https://freesound.org', recommendedToolIds: ['freesound', 'pixabaymusic', 'epidemicsound'] },
      { number: '04', title: 'انشر الحلقة', defaultTool: 'Spotify', defaultUrl: 'https://spotify.com', recommendedToolIds: ['suno', 'epidemicsound'] },
    ],
  },
]

export interface PinnedStepInfo {
  toolId?: string
  name: string
  url: string
  isPinned: boolean
}

export type PinnedStepsMap = Record<string, PinnedStepInfo>

export default function Page() {
  const [query, setQuery] = useState('')
  const [track, setTrack] = useState<Track>('الكل')
  const [subCategory, setSubCategory] = useState<string>('all')
  const [tier, setTier] = useState<'all' | Tier>('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedRoadmap, setSelectedRoadmap] = useState('site')
  const [pinnedSteps, setPinnedSteps] = useState<PinnedStepsMap>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Step Picker Modal State (changing tool on a specific roadmap step)
  const [stepPickerTarget, setStepPickerTarget] = useState<{
    roadmapId: string
    stepIndex: number
    step: RoadmapStep
  } | null>(null)
  const [stepPickerSearch, setStepPickerSearch] = useState('')

  // Tool Pin Modal State (pinning a specific tool to any roadmap step)
  const [toolToPin, setToolToPin] = useState<Tool | null>(null)

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem('hangar-favorites') || '[]'))
    } catch {
      setFavorites([])
    }

    try {
      setPinnedSteps(JSON.parse(localStorage.getItem('hangar-pinned-steps') || '{}'))
    } catch {
      setPinnedSteps({})
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hangar-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('hangar-pinned-steps', JSON.stringify(pinnedSteps))
  }, [pinnedSteps])

  // Reset subcategory filter when track changes
  const handleTrackChange = (newTrack: Track) => {
    setTrack(newTrack)
    setSubCategory('all')
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(null), 3000)
  }

  const toggleFavorite = (id: string) =>
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  const copyLink = async (url: string) => {
    await navigator.clipboard?.writeText(url)
    showToast('تم نسخ الرابط المباشر إلى الحافظة! 📋')
  }

  // Active roadmap object
  const activeRoadmap = roadmaps.find((item) => item.id === selectedRoadmap) || roadmaps[0]

  // Pin a tool to a roadmap step
  const handlePinTool = (roadmapId: string, stepIndex: number, toolName: string, toolUrl: string, toolId?: string) => {
    const key = `${roadmapId}-${stepIndex}`
    setPinnedSteps((prev) => ({
      ...prev,
      [key]: {
        toolId,
        name: toolName,
        url: toolUrl,
        isPinned: true,
      },
    }))
    showToast(`تم تثبيت ${toolName} في الخطوة بنجاح! 📌`)
    setStepPickerTarget(null)
    setToolToPin(null)
  }

  // Unpin / Reset a specific step to its default tool
  const handleUnpinStep = (roadmapId: string, stepIndex: number) => {
    const key = `${roadmapId}-${stepIndex}`
    setPinnedSteps((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    showToast('تمت استعادة الأداة الافتراضية للخطوة!')
    setStepPickerTarget(null)
  }

  // Reset entire active roadmap
  const handleResetRoadmap = (roadmapId: string) => {
    setPinnedSteps((prev) => {
      const next = { ...prev }
      roadmaps
        .find((r) => r.id === roadmapId)
        ?.steps.forEach((_, idx) => {
          delete next[`${roadmapId}-${idx}`]
        })
      return next
    })
    showToast('تمت استعادة جميع أدوات المسار إلى الافتراضي!')
  }

  // Check if current roadmap has any pinned step
  const hasCustomPinnedSteps = activeRoadmap.steps.some((_, idx) => !!pinnedSteps[`${activeRoadmap.id}-${idx}`])

  // Current subcategories list for active track
  const currentSubCategories = subCategoriesByTrack[track] || subCategoriesByTrack['الكل']

  // Count tools per subcategory
  const getSubCategoryCount = (subId: string) => {
    return tools.filter((tool) => {
      const matchesTrack = track === 'الكل' || tool.track === track
      if (!matchesTrack) return false

      if (subId === 'all') return true
      if (track === 'الكل') {
        if (subId === 'blocks') return tool.subCategories.includes('blocks')
        if (subId === 'templates') return tool.subCategories.includes('templates')
        if (subId === 'mockup') return tool.subCategories.includes('mockup')
        if (subId === 'elements') return tool.subCategories.includes('elements') || tool.subCategories.includes('elements-3d')
        if (subId === 'ai') return tool.subCategories.some((sc) => sc.includes('ai') || sc.includes('voice'))
        return true
      }
      return tool.subCategories.includes(subId)
    }).length
  }

  // Filtered tools
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesQuery = `${tool.name} ${tool.nameAr} ${tool.description} ${tool.tags.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesTrack = track === 'الكل' || tool.track === track
      const matchesTier = tier === 'all' || tool.tier === tier
      const matchesFavorites = !showFavorites || favorites.includes(tool.id)

      let matchesSub = true
      if (subCategory !== 'all') {
        if (track === 'الكل') {
          if (subCategory === 'blocks') matchesSub = tool.subCategories.includes('blocks')
          else if (subCategory === 'templates') matchesSub = tool.subCategories.includes('templates')
          else if (subCategory === 'mockup') matchesSub = tool.subCategories.includes('mockup')
          else if (subCategory === 'elements') matchesSub = tool.subCategories.includes('elements') || tool.subCategories.includes('elements-3d')
          else if (subCategory === 'ai') matchesSub = tool.subCategories.some((sc) => sc.includes('ai') || sc.includes('voice'))
        } else {
          matchesSub = tool.subCategories.includes(subCategory)
        }
      }

      return matchesQuery && matchesTrack && matchesTier && matchesFavorites && matchesSub
    })
  }, [query, track, subCategory, tier, showFavorites, favorites])

  // Filtered tools for the Step Picker Modal search
  const stepPickerFilteredTools = useMemo(() => {
    if (!stepPickerSearch.trim()) return tools
    const q = stepPickerSearch.toLowerCase()
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.nameAr.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }, [stepPickerSearch])

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-[#f6f5f0] text-[#14232a] selection:bg-[#f4b844] selection:text-[#14232a]">
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-7 lg:px-10">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#d9ddd5] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[4px_4px_0_#f4b844] transition duration-300 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#f4b844]">
              <img src="/site-logo.png" alt="شعار الهنجر" className="size-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-xl font-bold leading-none">الهنجر</p>
                <span className="rounded-full border border-[#f4b844]/60 bg-[#f4b844]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#b97812]">
                  v1.1.0
                </span>
              </div>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71807f]">The Hangar · Toolbox</p>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#516160] md:flex">
            <a className="text-[#14232a] transition hover:text-[#d89124]" href="#roadmap">
              الطريق السريع
            </a>
            <a className="transition hover:text-[#d89124]" href="#tools">
              كل العدد
            </a>
            <a
              href="https://github.com/AMOXMorad/Hanger/releases/download/Dev-Editor-Tools/The_Hangar_Setup.exe"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#14232a] px-3.5 py-1.5 text-xs text-white shadow-[2px_2px_0_#f4b844] transition hover:-translate-y-0.5 hover:bg-[#1f343e]"
            >
              <span>تحميل لويندوز</span>
              <span className="rounded bg-[#f4b844] px-1 py-0.5 font-mono text-[9px] font-bold text-[#14232a]">Setup</span>
            </a>
            <button
              onClick={() => setShowProfile(true)}
              className="rounded-full border border-[#cad1c9] px-4 py-2 text-[#14232a] transition hover:bg-white"
            >
              المطور والإلهام <span className="text-[#d89124]">✦</span>
            </button>
          </nav>
          <button
            aria-label="فتح القائمة"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 hover:bg-white md:hidden"
          >
            <Menu />
          </button>
        </header>

        {menuOpen && (
          <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[#d9ddd5] bg-white p-4 text-sm font-semibold md:hidden">
            <a
              href="https://github.com/AMOXMorad/Hanger/releases/download/Dev-Editor-Tools/The_Hangar_Setup.exe"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14232a] py-2.5 text-white"
              onClick={() => setMenuOpen(false)}
            >
              <span>تحميل البرنامج لويندوز (The_Hangar_Setup.exe)</span>
            </a>
            <a href="#roadmap" onClick={() => setMenuOpen(false)}>
              الطريق السريع
            </a>
            <a href="#tools" onClick={() => setMenuOpen(false)}>
              كل العدد
            </a>
            <button
              className="text-right"
              onClick={() => {
                setShowProfile(true)
                setMenuOpen(false)
              }}
            >
              المطور والإلهام
            </button>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#d9ddd5_1px,transparent_1px),linear-gradient(90deg,#d9ddd5_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute -left-20 top-6 size-72 rounded-full border border-[#f4b844]/30 bg-[#f4b844]/15 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -16, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute left-[38%] top-14 size-3 rounded-full bg-[#f4b844] shadow-[0_0_24px_8px_#f4b84466]"
          />
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [0.25, 0.7, 0.25] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="pointer-events-none absolute left-[52%] top-32 size-2 rounded-full bg-[#14232a]"
          />
          <div className="relative max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9ddd5] bg-white/70 px-3.5 py-1.5 text-xs font-bold text-[#62706c]"
            >
              <span className="size-2 rounded-full bg-emerald-400" /> مفتوحين دلوقتي · الإصدار 1.1.0 · {tools.length} أداة متجمعة
            </motion.div>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="font-display text-5xl font-black leading-[1.04] tracking-tight sm:text-7xl">
              {['ورشتك', 'الرقمية،'].map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.12 + index * 0.12, type: 'spring', stiffness: 160, damping: 14 }}
                  whileHover={{ y: -2 }}
                  className="ml-3 inline-block cursor-default transition-colors duration-300 hover:text-[#d89124]"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.38, type: 'spring', stiffness: 150, damping: 13 }}
                whileHover={{ y: -2 }}
                className="inline-block cursor-default text-[#d89124] transition-colors duration-300 hover:text-[#b97812]"
              >
                من الفكرة للإنجاز.
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-7 max-w-xl cursor-default text-lg leading-8 text-[#62706c] transition-colors duration-300"
            >
              العدد الصح لكل خطوة. اختار هدفك، ثبّت أداتك المفضلة (Pin) في كل خطوة، واستكشف التفريعات المتخصصة لكل مجال.
            </motion.p>
          </div>
          <div className="pointer-events-none absolute left-0 top-16 hidden text-left font-mono text-[10px] leading-5 text-[#b7bfba] lg:block">
            WORKSHOP_1.1.0<br />
            PINNING / SUB-TAXONOMY / SPEED<br />
            <span className="text-[#d89124]">● SYSTEM READY</span>
          </div>
        </section>

        {/* Roadmap / Quick Start Section */}
        <section id="roadmap" className="rounded-[28px] bg-[#14232a] p-5 text-white shadow-[8px_8px_0_#dfe4dc] sm:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <motion.p whileHover={{ x: -4, color: '#ffffff' }} className="mb-2 w-fit cursor-default font-mono text-[10px] font-bold tracking-[0.18em] text-[#f4b844] transition-colors duration-300">
                QUICK START / 01
              </motion.p>
              <motion.h2 whileHover={{ y: -4, x: -5, letterSpacing: '0.01em' }} className="w-fit cursor-default font-display text-3xl font-bold transition-colors duration-300 hover:text-[#f4b844]">
                عايز تعمل إيه النهاردة؟
              </motion.h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#9cacaa]">
              قولنا هدفك، وثبّت أداتك في أي خطوة لتفصيل مسارك السريع.
            </p>
          </div>

          {/* Goal Selector Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roadmaps.map((roadmap) => (
              <button
                key={roadmap.id}
                onClick={() => setSelectedRoadmap(roadmap.id)}
                className={`group rounded-2xl border p-5 text-right transition duration-300 ease-out hover:-translate-y-0.5 ${
                  selectedRoadmap === roadmap.id
                    ? 'border-[#f4b844] bg-[#f4b844] text-[#14232a]'
                    : 'border-white/10 bg-white/[.04] hover:border-white/30'
                }`}
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-3xl">{roadmap.icon}</span>
                  <ArrowUpLeft className="opacity-40 transition group-hover:-translate-x-1 group-hover:-translate-y-1" />
                </div>
                <p className="font-display text-xl font-bold">{roadmap.title}</p>
                <p className={`mt-2 text-xs ${selectedRoadmap === roadmap.id ? 'text-[#53605b]' : 'text-[#9cacaa]'}`}>
                  {roadmap.subtitle}
                </p>
              </button>
            ))}
          </div>

          {/* Dynamic Suggested Path / Steps */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0f1b20] p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs font-bold tracking-wider text-[#f4b844]">
                  مسارك المقترح · {activeRoadmap.title}
                </p>
                {hasCustomPinnedSteps && (
                  <button
                    onClick={() => handleResetRoadmap(activeRoadmap.id)}
                    className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[#9cacaa] transition hover:border-[#f4b844] hover:bg-[#f4b844]/10 hover:text-white"
                    title="استعادة الأدوات الافتراضية لهذا المسار"
                  >
                    <RotateCcw className="size-3 text-[#f4b844]" />
                    <span>استعادة الافتراضي</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-[11px] text-[#788886] sm:inline">اضغط 📌 لتخصيص أو تثبيت أداتك في أي خطوة</span>
                <Zap className="size-4 text-[#f4b844]" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {activeRoadmap.steps.map((step, index) => {
                const stepKey = `${activeRoadmap.id}-${index}`
                const pinned = pinnedSteps[stepKey]
                const toolName = pinned ? pinned.name : step.defaultTool
                const toolUrl = pinned ? pinned.url : step.defaultUrl
                const isPinned = !!pinned

                return (
                  <div
                    key={step.number}
                    className={`group/step relative flex items-center justify-between rounded-xl border p-3 transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_#00000033] ${
                      isPinned
                        ? 'border-[#f4b844]/70 bg-[#f4b844]/15'
                        : 'border-white/10 bg-white/[.02] hover:border-[#f4b844]/60 hover:bg-[#f4b844]/10'
                    }`}
                  >
                    <a
                      href={toolUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center gap-3 overflow-hidden"
                      title={`فتح ${toolName}`}
                    >
                      <span className="font-mono text-xs font-bold text-[#f4b844] transition-transform duration-300 group-hover/step:scale-125">
                        {step.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-white transition duration-300 group-hover/step:translate-x-1 group-hover/step:text-[#f4b844]">
                            {step.title}
                          </p>
                          {isPinned && (
                            <span className="rounded bg-[#f4b844]/25 px-1 py-0.2 font-mono text-[9px] font-bold text-[#f4b844]">
                              مثبتة
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-[#9cacaa] transition duration-300 group-hover/step:translate-x-1 group-hover/step:text-white">
                          {toolName}
                        </p>
                      </div>
                    </a>

                    {/* Step Pin Action Button */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setStepPickerTarget({
                            roadmapId: activeRoadmap.id,
                            stepIndex: index,
                            step,
                          })
                          setStepPickerSearch('')
                        }}
                        className={`rounded-lg p-1.5 transition ${
                          isPinned
                            ? 'bg-[#f4b844] text-[#14232a] shadow-sm hover:bg-[#ffc657]'
                            : 'text-[#9cacaa] hover:bg-white/10 hover:text-[#f4b844]'
                        }`}
                        title={isPinned ? 'تغيير أو إزالة الأداة المثبتة' : 'تثبيت أداة أخرى في هذه الخطوة'}
                        aria-label="تثبيت أو تغيير الأداة"
                      >
                        <Pin className="size-3.5" fill={isPinned ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {index < 3 && (
                      <ChevronLeft className="absolute -left-3 hidden text-[#f4b844] transition-transform duration-300 group-hover/step:-translate-x-1 md:block" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* The Tool Wall / Catalog Section */}
        <section id="tools" className="py-16 sm:py-20">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.18em] text-[#d89124]">
                THE TOOL WALL / 02
              </p>
              <h2 className="font-display text-4xl font-black">كل العدد في مكان واحد</h2>
            </div>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-bold transition ${
                showFavorites
                  ? 'border-[#f4b844] bg-[#f4b844] text-[#14232a]'
                  : 'border-[#cad1c9] bg-white hover:bg-[#f4b844]'
              }`}
            >
              <Heart className="size-4" fill={showFavorites ? 'currentColor' : 'none'} /> المفضلة{' '}
              <span className="rounded-full bg-[#14232a] px-2 py-0.5 text-xs text-white">
                {favorites.length}
              </span>
            </button>
          </div>

          {/* Search & Main Tracks Bar */}
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#d9ddd5] bg-white p-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8b9893]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="دوّر على أداة، وصف، أو تاج..."
                className="w-full rounded-xl bg-[#f6f5f0] py-3 pr-10 pl-4 text-sm outline-none ring-[#f4b844] placeholder:text-[#9da7a2] focus:ring-2"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['الكل', 'الويب', 'صور', 'فيديو', 'صوت'] as Track[]).map((item) => (
                <button
                  key={item}
                  onClick={() => handleTrackChange(item)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    track === item
                      ? 'bg-[#14232a] text-white shadow-sm'
                      : 'bg-[#f6f5f0] text-[#61706d] hover:bg-[#e9ece6]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories (تفريعات التصنيفات) Bar */}
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#e1e5de] bg-[#fdfdfb] p-3 shadow-sm">
            <span className="ml-2 flex items-center gap-1.5 font-mono text-xs font-bold text-[#71807f]">
              <Layers className="size-3.5 text-[#d89124]" />
              تفريعات {track !== 'الكل' ? track : 'العدد'}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentSubCategories.map((sub) => {
                const isSelected = subCategory === sub.id
                const count = getSubCategoryCount(sub.id)
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSubCategory(sub.id)}
                    className={`group flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition duration-200 ${
                      isSelected
                        ? 'bg-[#14232a] text-[#f4b844] shadow'
                        : 'border border-[#d9ddd5] bg-white text-[#556461] hover:border-[#b9c4ba] hover:bg-[#f6f5f0]'
                    }`}
                  >
                    <span>{sub.labelEn}</span>
                    <span className="text-[10px] font-normal opacity-70">({sub.labelAr})</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                        isSelected ? 'bg-[#f4b844] text-[#14232a]' : 'bg-[#eef1eb] text-[#71807f]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Pricing Tier Filter */}
          <div className="mb-7 flex flex-wrap items-center gap-2">
            <span className="ml-2 text-xs font-bold text-[#71807f]">التكلفة:</span>
            {(
              [
                ['all', 'الكل'],
                ['free', 'ببلاش'],
                ['trial', 'جربها ببلاش'],
                ['pro', 'متكلفة'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTier(value)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  tier === value
                    ? 'border-[#14232a] bg-[#14232a] text-white'
                    : 'border-[#d9ddd5] bg-white text-[#61706d] hover:bg-[#fafaf8]'
                }`}
              >
                {value !== 'all' && <span className={`size-2 rounded-full ${tierInfo[value].dot}`} />}
                {label}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                index={index}
                favorite={favorites.includes(tool.id)}
                onFavorite={() => toggleFavorite(tool.id)}
                onCopy={() => copyLink(tool.url)}
                onPin={() => setToolToPin(tool)}
              />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#cbd3ca] py-16 text-center text-[#71807f]">
              مفيش عدد مطابق للبحث ده أو الفلتر المختار. جرّب تصنيف أو كلمة تانية.
            </div>
          )}
        </section>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-full bg-[#14232a] px-5 py-3 text-sm font-bold text-white shadow-2xl"
          >
            <Check className="size-4 text-emerald-300" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developer Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfile(false)}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#14232a]/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-[28px] bg-[#f6f5f0] p-6 shadow-2xl sm:p-8"
            >
              <button
                aria-label="إغلاق"
                onClick={() => setShowProfile(false)}
                className="absolute left-5 top-5 rounded-full p-2 hover:bg-white"
              >
                <X />
              </button>
              <p className="mb-2 font-mono text-[10px] font-bold tracking-widest text-[#d89124]">
                PEOPLE BEHIND THE HANGAR · v1.1.0
              </p>
              <h2 className="font-display text-3xl font-black">المطور والإلهام</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <ProfileCard
                  title="مراد · Morad"
                  handle="@AMOXMorad"
                  text="Software Developer & Tech Enthusiast"
                  links={[
                    { label: 'GitHub', url: 'https://github.com/AMOXMorad' },
                    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/amoxmorad' },
                    { label: 'Email', url: 'mailto:morad@amox.dev' },
                  ]}
                  icon="◈"
                />
                <ProfileCard
                  title="عمار محمدي"
                  handle="@ammar1080p"
                  text="صاحب مشروع The Pickles Fridge — الإلهام البصري"
                  links={[{ label: 'Instagram', url: 'https://www.instagram.com/ammar1080p/' }]}
                  icon="✦"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Picker Modal (Customizing / Pinning to a specific step from Roadmap) */}
      <AnimatePresence>
        {stepPickerTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setStepPickerTarget(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#14232a]/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-[#f6f5f0] p-6 shadow-2xl sm:p-8"
            >
              <button
                aria-label="إغلاق"
                onClick={() => setStepPickerTarget(null)}
                className="absolute left-5 top-5 rounded-full p-2 transition hover:bg-white"
              >
                <X className="size-5" />
              </button>

              <div className="mb-6">
                <span className="font-mono text-[10px] font-bold tracking-widest text-[#d89124]">
                  ROADMAP CUSTOMIZATION · الخطوة {stepPickerTarget.step.number}
                </span>
                <h3 className="font-display text-2xl font-black">
                  تخصيص خطوة: {stepPickerTarget.step.title}
                </h3>
                <p className="mt-1 text-xs text-[#71807f]">
                  المسار الحالي: {roadmaps.find((r) => r.id === stepPickerTarget.roadmapId)?.title}
                </p>
              </div>

              {/* Current Active Tool & Reset Button */}
              {(() => {
                const key = `${stepPickerTarget.roadmapId}-${stepPickerTarget.stepIndex}`
                const currentPinned = pinnedSteps[key]
                const activeName = currentPinned ? currentPinned.name : stepPickerTarget.step.defaultTool
                const isCustom = !!currentPinned

                return (
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d9ddd5] bg-white p-4">
                    <div>
                      <p className="text-xs text-[#71807f]">الأداة النشطة حالياً:</p>
                      <p className="text-base font-bold text-[#14232a] flex items-center gap-1.5">
                        {activeName}
                        {isCustom && <span className="rounded bg-[#f4b844]/20 px-2 py-0.5 text-[10px] text-[#b97812]">مثبتة 📌</span>}
                      </p>
                    </div>
                    {isCustom && (
                      <button
                        onClick={() => handleUnpinStep(stepPickerTarget.roadmapId, stepPickerTarget.stepIndex)}
                        className="flex items-center gap-1.5 rounded-xl border border-[#d9ddd5] bg-[#f6f5f0] px-3 py-1.5 text-xs font-bold text-[#14232a] transition hover:border-[#f4b844] hover:bg-white"
                      >
                        <RotateCcw className="size-3.5 text-[#d89124]" />
                        استعادة الافتراضية ({stepPickerTarget.step.defaultTool})
                      </button>
                    )}
                  </div>
                )
              })()}

              {/* Recommended Tools for this Step */}
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold text-[#516160]">
                  💡 مقترحات سريعة تناسب هذه الخطوة:
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {stepPickerTarget.step.recommendedToolIds.map((recId) => {
                    const toolObj = tools.find((t) => t.id === recId)
                    if (!toolObj) return null
                    return (
                      <button
                        key={recId}
                        onClick={() =>
                          handlePinTool(
                            stepPickerTarget.roadmapId,
                            stepPickerTarget.stepIndex,
                            toolObj.name,
                            toolObj.url,
                            toolObj.id
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-[#d9ddd5] bg-white p-2.5 text-right transition hover:-translate-y-0.5 hover:border-[#f4b844] hover:shadow-sm"
                      >
                        <span className="text-lg">{toolObj.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[#14232a]">{toolObj.name}</p>
                          <p className="text-[10px] text-[#8a9791]">{tierInfo[toolObj.tier].label}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Search any tool */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-bold text-[#516160]">أو اختر أي أداة من الهنجر:</p>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8b9893]" />
                  <input
                    value={stepPickerSearch}
                    onChange={(e) => setStepPickerSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو المجال..."
                    className="w-full rounded-xl border border-[#d9ddd5] bg-white py-2.5 pr-9 pl-3 text-xs outline-none focus:ring-2 focus:ring-[#f4b844]"
                  />
                </div>
              </div>

              {/* Filtered Tools List */}
              <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
                {stepPickerFilteredTools.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-[#e4e7e0] bg-white p-2.5 transition hover:border-[#f4b844]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{t.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-[#14232a]">{t.name}</p>
                        <p className="text-[10px] text-[#8a9791]">{t.nameAr} · {t.track}</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handlePinTool(
                          stepPickerTarget.roadmapId,
                          stepPickerTarget.stepIndex,
                          t.name,
                          t.url,
                          t.id
                        )
                      }
                      className="flex items-center gap-1 rounded-lg bg-[#14232a] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#f4b844] hover:text-[#14232a]"
                    >
                      <Pin className="size-3" />
                      تثبيت هنا
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tool Pin Modal (Pinning a specific tool to any Roadmap Step from ToolCard) */}
      <AnimatePresence>
        {toolToPin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setToolToPin(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#14232a]/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-[#f6f5f0] p-6 shadow-2xl sm:p-8"
            >
              <button
                aria-label="إغلاق"
                onClick={() => setToolToPin(null)}
                className="absolute left-5 top-5 rounded-full p-2 transition hover:bg-white"
              >
                <X className="size-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <span className="text-3xl">{toolToPin.emoji}</span>
                <div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-[#d89124]">
                    PIN TOOL TO ROADMAP
                  </span>
                  <h3 className="font-display text-2xl font-black">
                    تثبيت {toolToPin.name}
                  </h3>
                  <p className="text-xs text-[#71807f]">
                    اختر المسار والخطوة التي تريد تثبيت الأداة فيها:
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {roadmaps.map((rm) => (
                  <div key={rm.id} className="rounded-2xl border border-[#d9ddd5] bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">{rm.icon}</span>
                      <p className="font-display text-sm font-bold text-[#14232a]">{rm.title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {rm.steps.map((st, sIdx) => {
                        const stepKey = `${rm.id}-${sIdx}`
                        const currentPinned = pinnedSteps[stepKey]
                        const currentName = currentPinned ? currentPinned.name : st.defaultTool
                        const isThisToolPinned = currentPinned?.name === toolToPin.name

                        return (
                          <button
                            key={st.number}
                            onClick={() => {
                              handlePinTool(rm.id, sIdx, toolToPin.name, toolToPin.url, toolToPin.id)
                              setSelectedRoadmap(rm.id)
                            }}
                            className={`flex flex-col rounded-xl border p-2.5 text-right transition hover:-translate-y-0.5 ${
                              isThisToolPinned
                                ? 'border-[#f4b844] bg-[#f4b844]/15'
                                : 'border-[#e4e7e0] bg-[#fafaf8] hover:border-[#f4b844] hover:bg-white'
                            }`}
                          >
                            <span className="font-mono text-[10px] text-[#d89124]">خطوة {st.number}</span>
                            <span className="truncate text-xs font-bold text-[#14232a]">{st.title}</span>
                            <span className="mt-1 truncate text-[10px] text-[#8a9791]">
                              (الحالية: {currentName})
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function ToolCard({
  tool,
  index,
  favorite,
  onFavorite,
  onCopy,
  onPin,
}: {
  tool: Tool
  index: number
  favorite: boolean
  onFavorite: () => void
  onCopy: () => void
  onPin: () => void
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.035, 0.25), duration: 0.3, ease: 'easeOut' }}
      className={`group rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#dfe4dc] ${
        favorite
          ? 'border-[#f4b844] bg-[#fffaf0] shadow-[4px_4px_0_#f4b844]'
          : 'border-[#d9ddd5] bg-white hover:border-[#b9c4ba]'
      }`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-[#f0f2ec] text-2xl">
          <img
            src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=128`}
            alt=""
            className="size-7"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
              if (event.currentTarget.parentElement) {
                event.currentTarget.parentElement.textContent = tool.emoji
              }
            }}
          />
        </div>
        <div className="flex items-center gap-1">
          {/* Pin Tool Action */}
          <button
            aria-label="تثبيت الأداة في مسار عمل"
            onClick={onPin}
            className="rounded-lg p-2 text-[#91a09a] opacity-0 transition hover:bg-[#f6f5f0] hover:text-[#d89124] group-hover:opacity-100"
            title="تثبيت الأداة في مسار عمل (Pin)"
          >
            <Pin className="size-4" />
          </button>
          {/* Copy Link Action */}
          <button
            aria-label="نسخ الرابط"
            onClick={onCopy}
            className="rounded-lg p-2 text-[#91a09a] opacity-0 transition hover:bg-[#f6f5f0] hover:text-[#14232a] group-hover:opacity-100"
            title="نسخ الرابط المباشر"
          >
            <Copy className="size-4" />
          </button>
          {/* Favorite Action */}
          <button
            aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            onClick={onFavorite}
            className={`rounded-lg p-2 transition hover:bg-[#f6f5f0] ${
              favorite ? 'text-[#d89124]' : 'text-[#b1bbb3]'
            }`}
            title="إضافة للمفضلة"
          >
            <Star className="size-4" fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold transition duration-300 group-hover:translate-x-1 group-hover:text-[#d89124]">
            {tool.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-[#8a9791]">{tool.nameAr}</p>
          {favorite && (
            <motion.p
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              className="mt-1 text-[10px] font-bold text-[#d89124]"
            >
              على مزاجك ✦
            </motion.p>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#71807f]">
          <span className={`size-2 rounded-full ${tierInfo[tool.tier].dot}`} />
          {tierInfo[tool.tier].label}
        </span>
      </div>

      <p className="min-h-10 text-sm leading-5 text-[#65736f]">{tool.description}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tool.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-[#f4f5f1] px-2 py-1 font-mono text-[10px] text-[#84908b]">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#edf0eb] pt-4">
        <a
          href={tool.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold text-[#14232a] transition hover:text-[#d89124]"
        >
          افتح الأداة <ExternalLink className="size-3.5" />
        </a>
        <button
          onClick={onPin}
          className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#8a9791] transition hover:text-[#d89124]"
          title="تثبيت الأداة في خطوات المسار"
        >
          <Pin className="size-3" />
          ثبّت في مسار
        </button>
      </div>
    </motion.article>
  )
}

function ProfileCard({
  title,
  handle,
  text,
  links,
  icon,
}: {
  title: string
  handle: string
  text: string
  links: { label: string; url: string }[]
  icon: string
}) {
  return (
    <div className="rounded-2xl border border-[#d9ddd5] bg-white p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#14232a] text-xl text-[#f4b844]">
          {icon}
        </div>
        <div>
          <h3 className="font-display font-bold">{title}</h3>
          <p className="text-xs text-[#8a9791]">{handle}</p>
        </div>
      </div>
      <p className="min-h-12 text-sm leading-6 text-[#65736f]">{text}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#f6f5f0] px-3 py-1.5 text-xs font-bold transition hover:bg-[#f4b844]"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
