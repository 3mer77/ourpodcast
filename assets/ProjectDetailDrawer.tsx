import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { useTranslation } from "react-i18next";

interface ProjectDetailDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectDetail {
  longDescription: string;
  longDescriptionAr?: string;
  features: string[];
  featuresAr?: string[];
  images: string[];
}

const projectDetails: Record<string, ProjectDetail> = {
  "ourpodcast": {
    longDescription:
      "ourpodcast is a feature-rich, integrated mobile application built using React Native (Expo SDK 54) and Supabase. It bridges the gap between digital audio entertainment and classical literature by combining a comprehensive podcast listening platform and a free e-book reader. Designed specifically for the Arabic audience, it features full RTL support and custom IBM Plex Sans Arabic typography, delivering an incredibly polished experience with instant cloud synchronization.",
    longDescriptionAr:
      "تطبيق «بودكاست» هو تطبيق جوال متكامل وحائز على ميزات متقدمة، مبني باستخدام React Native و Expo SDK 54 مع خلفية سحابية مدعومة بالكامل بواسطة Supabase. يجمع التطبيق في واجهة واحدة مبتكرة بين منصة استماع متقدمة للبودكاست وقارئ كتب إلكترونية كلاسيكية مجانية. تم تصميم التطبيق خصيصاً للجمهور العربي مع دعم كامل للاتجاه من اليمين إلى اليسار (RTL) واستخدام خطوط عربية مخصصة مثل IBM Plex Sans Arabic، مما يوفر تجربة قراءة واستماع مريحة مع مزامنة سحابية فورية لتقدم المستخدم وسجلاته.",
    features: [
      "Supabase Authentication: Secure email-password registration, verification code screen, and Google OAuth flow with deep links (ourpodcast://).",
      "ListenNotes Podcast integration: Rich search and discovery feed including specialized categories like 'Hear it first' and Arabic Podcasts.",
      "Global Audio Player: Smooth playback controls, skip forward/backward 15s, playback speed controls (1x, 1.5x, 2x), and slider seek.",
      "Bottom Mini Player: Persistent micro-player docked at the screen bottom, allowing continuous listening while navigating the app.",
      "Integrated E-Book Reader: Custom Project Gutenberg client that splits long text into clean virtual pages dynamically based on word length.",
      "E-Book Settings: Complete custom settings modal to adjust reading font-size, line-height, and eye-friendly background themes (Dark, White, Sepia).",
      "Cloud Progress Mappings: Automatic sync of listening timestamps (in milliseconds) and last-read book page to Supabase tables, complete with visual resume indicators.",
      "RevenueCat Premium Gate: Free monthly tiers (limit 2 podcasts and 1 book) that triggers a premium subscription gate screen when exceeded.",
      "Developer settings tools: Easily toggle mock premium status to test subscription states locally."
    ],
    featuresAr: [
      "نظام الحسابات (Supabase Auth): يدعم التسجيل بالبريد مع التحقق برابط تفعيل سحري، وتسجيل Google OAuth بالمتصفح المدمج والعودة التلقائية عبر الروابط العميقة.",
      "منصة البودكاست (ListenNotes API): تغذية رئيسية تفاعلية تعرض تصنيفات 'اسمعها أولاً'، وتصنيفات تقنية وعربية مع ميزة تحميل المزيد والبحث السريع.",
      "المشغل الصوتي العام: يدعم التحكم بالسرعة (1x, 1.5x, 2x)، التقديم والتأخير بمقدار 15 ثانية، وشريط تمرير (Slider) متزامن بالملي ثانية.",
      "المشغل الصغير (Mini Player): مشغل ثابت يظهر أسفل الشاشة يتيح للمستخدم إكمال الاستماع أثناء تصفح الأقسام الأخرى.",
      "قارئ الكتب الذكي (Gutenberg API): يقسم محتوى الكتب تلقائياً لصفحات افتراضية مريحة بناءً على حجم الخط وحجم الشاشة لتفادي انقطاع الجمل.",
      "خيارات مخصصة للقراءة: لوحة إعدادات ديناميكية لتغيير حجم الخط، تباعد الأسطر، وسمات الخلفية (الوضع الداكن، وضع بيج/السيبييا، والوضع الفاتح).",
      "مزامنة سحابية مستمرة: حفظ قائمة المفضلة ومتابعة التقدم بالملي ثانية للبودكاست ورقم الصفحة للكتب في جداول Supabase مع شريط تقدم بصري.",
      "نظام اشتراك RevenueCat: جدار دفع ذكي (Paywall) يفرض حدوداً شهرية مجانية (بودكاستين وكتاب واحد شهرياً) لتشجيع الترقية مقابل $7.99/شهر.",
      "أدوات التطوير (Dev Tools): شاشة إعدادات المطور المدمجة لتفعيل وتعطيل الاشتراك المميز بضغطة زر لاختبار سلوك التطبيق وتخطي القيود محلياً."
    ],
    images: [
      "/projects/ourpodcast/home-feed.png",
      "/projects/ourpodcast/podcast-detail.png",
      "/projects/ourpodcast/book-library.png",
      "/projects/ourpodcast/reader-settings.png",
      "/projects/ourpodcast/paywall.png"
    ]
  },
  "1": {
    longDescription:
      "A comprehensive e-commerce platform built for modern retail. Features include real-time inventory management, Stripe payment integration, an admin dashboard with analytics, and server-side rendering for optimal SEO and performance. The application handles thousands of concurrent users with efficient caching strategies.",
    features: [
      "Real-time inventory tracking",
      "Stripe payment processing",
      "Admin dashboard with analytics",
      "Server-side rendering for SEO",
      "Role-based access control",
      "Order management system",
    ],
    images: [],
  },
  "2": {
    longDescription:
      "A collaborative project management tool inspired by modern agile workflows. Teams can create boards, manage sprints, and track progress with real-time updates via WebSocket connections. Features drag-and-drop task management and comprehensive team analytics.",
    features: [
      "Drag-and-drop Kanban boards",
      "Real-time collaboration via WebSocket",
      "Sprint planning and tracking",
      "Team performance analytics",
      "Custom workflow automation",
      "File attachments and comments",
    ],
    images: [],
  },
  "3": {
    longDescription:
      "An AI-powered content generation platform that leverages large language models to create high-quality blog posts, social media content, and marketing copy. Users can customize tone, style, and length while maintaining brand consistency across all generated content.",
    features: [
      "Multi-format content generation",
      "Brand voice customization",
      "Content scheduling and publishing",
      "SEO optimization suggestions",
      "Template library",
      "Usage analytics dashboard",
    ],
    images: [],
  },
  "4": {
    longDescription:
      "A secure real-time messaging platform with end-to-end encryption. Supports text messaging, voice notes, file sharing, and group conversations. Built with scalability in mind using Redis for message queuing and Socket.io for real-time communication.",
    features: [
      "End-to-end encryption",
      "Voice notes and file sharing",
      "Group conversations",
      "Message search and history",
      "Online presence indicators",
      "Push notifications",
    ],
    images: [],
  },
  "5": {
    longDescription:
      "A headless CMS specifically designed for developer portfolios. Supports markdown content, theme customization, and easy deployment. Built with a focus on developer experience and performance.",
    features: [
      "Markdown editor with live preview",
      "Custom theme engine",
      "API-first architecture",
      "Image optimization pipeline",
      "SEO management tools",
      "One-click deployment",
    ],
    images: [],
  },
  "6": {
    longDescription:
      "A beautiful weather application featuring interactive maps, detailed forecasts, and location-based alerts. Integrates with multiple weather APIs for accurate data and uses Mapbox for stunning map visualizations.",
    features: [
      "Interactive weather maps",
      "7-day detailed forecasts",
      "Location-based severe weather alerts",
      "Historical weather data",
      "Air quality index tracking",
      "Customizable widgets",
    ],
    images: [],
  },
};

const ProjectDetailDrawer = ({ project, isOpen, onClose }: ProjectDetailDrawerProps) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const details = project ? projectDetails[project.id] : null;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setActiveImageIndex(0);
    setLightboxIndex(null);
  }, [project]);

  // Close lightbox on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight" && lightboxIndex !== null && details?.images)
        setLightboxIndex((i) => (i! + 1) % details.images.length);
      if (e.key === "ArrowLeft" && lightboxIndex !== null && details?.images)
        setLightboxIndex((i) => (i! - 1 + details.images.length) % details.images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, details]);

  const displayTitle = project ? (isAr && project.titleAr ? project.titleAr : project.title) : "";
  const displayLongDesc = details 
    ? (isAr && details.longDescriptionAr ? details.longDescriptionAr : details.longDescription) 
    : (project ? (isAr && project.descriptionAr ? project.descriptionAr : project.description) : "");
  
  const displayFeatures = details
    ? (isAr && details.featuresAr ? details.featuresAr : details.features)
    : [];

  const screens = isAr ? [
    { title: "الرئيسية", desc: "التغذية الرئيسية وقائمة البودكاست مع المشغل الصغير" },
    { title: "تفاصيل البودكاست", desc: "قائمة الحلقات الصوتية والتفاصيل المنظمة" },
    { title: "المكتبة", desc: "شبكة الكتب الكلاسيكية المدمجة وفلاتر التصنيف" },
    { title: "القارئ", desc: "القارئ الذكي وإعدادات الحجم والمظهر الخلفي" },
    { title: "الدفع", desc: "جدار الترقية للمميز ومفاتيح المطورين التجريبية" }
  ] : [
    { title: "Home", desc: "Curated home feed categories & mini-player" },
    { title: "Podcast Detail", desc: "Sanitized episode list & pagination support" },
    { title: "E-Books", desc: "Project Gutenberg integration & genre filter" },
    { title: "Reader Settings", desc: "Custom spacing, font sizes, & eye-friendly themes" },
    { title: "Paywall", desc: "RevenueCat limits wall & dev mock purchase bypass" }
  ];

  const drawerXInitial = isAr ? "100%" : "-100%";
  const drawerXExit = isAr ? "100%" : "-100%";
  const drawerPositionClass = isAr 
    ? "fixed top-0 right-0 h-full w-full max-w-lg bg-card border-l border-border z-50 overflow-y-auto" 
    : "fixed top-0 left-0 h-full w-full max-w-lg bg-card border-r border-border z-50 overflow-y-auto";

  return (
    <AnimatePresence>
      {isOpen && project && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: drawerXInitial }}
            animate={{ x: 0 }}
            exit={{ x: drawerXExit }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={drawerPositionClass}
            style={{ direction: isAr ? 'rtl' : 'ltr' }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-foreground">{displayTitle}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Media Preview Section */}
              {details?.images && details.images.length > 0 ? (
                <div className="flex flex-col items-center bg-gradient-to-b from-accent/10 to-transparent p-6 rounded-2xl border border-border/60">
                  {/* Active Screenshot — plain rounded image, no extra phone frame */}
                  <div className="relative w-[210px] rounded-2xl overflow-hidden shadow-2xl select-none">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImageIndex}
                        src={details.images[activeImageIndex]}
                        alt="mockup screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="w-full h-auto object-contain"
                      />
                    </AnimatePresence>
                  </div>

                  {/* Dot Tabs Selector */}
                  <div className="mt-5 w-full space-y-2">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {screens.map((screen, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${
                            activeImageIndex === idx
                              ? "bg-highlight text-highlight-foreground border-highlight font-medium shadow-sm"
                              : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                        >
                          {screen.title}
                        </button>
                      ))}
                    </div>
                    {screens[activeImageIndex] && (
                      <p className="text-[11px] text-center text-muted-foreground leading-relaxed h-7 px-2">
                        {screens[activeImageIndex].desc}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Project preview placeholder for standard web projects */
                <div className="aspect-video rounded-xl bg-surface border border-border flex items-center justify-center">
                  <span className="font-mono text-xs text-muted-foreground">
                    {`// ${project.title.toLowerCase().replace(/\s/g, "-")}-preview`}
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider opacity-85">
                  {isAr ? "نظرة عامة" : "Overview"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {displayLongDesc}
                </p>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider opacity-85">
                  {isAr ? "التقنيات المستخدمة" : "Tech Stack"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              {displayFeatures.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider opacity-85">
                    {isAr ? "الميزات الرئيسية" : "Key Features"}
                  </h3>
                  <ul className="space-y-2.5">
                    {displayFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-highlight mt-2 shrink-0" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Thumbnail Gallery — clickable, opens fullscreen lightbox */}
              {details?.images && details.images.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider opacity-85">
                    {isAr ? "جميع الشاشات" : "All Screens"}
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {details.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className={`flex-shrink-0 w-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none hover:scale-105 ${
                          activeImageIndex === idx
                            ? "border-highlight shadow-md shadow-highlight/20"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <img
                          src={img}
                          alt={screens[idx]?.title || `screen-${idx}`}
                          className="w-full h-auto object-cover object-top"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pb-6 pt-2">
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={14} /> {isAr ? "معاينة حية" : "Live Demo"}
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-grow inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border text-muted-foreground text-sm font-medium cursor-not-allowed opacity-50"
                  >
                    <ExternalLink size={14} /> {isAr ? "معاينة غير متوفرة" : "Demo Offline"}
                  </button>
                )}
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Github size={14} /> {isAr ? "رمز المصدر" : "Source Code"}
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-grow inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium cursor-not-allowed opacity-50"
                  >
                    <Github size={14} /> {isAr ? "مستودع خاص" : "Private Repo"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Lightbox ── */}
          <AnimatePresence>
            {lightboxIndex !== null && details?.images && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setLightboxIndex(null)}
                  className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
                />

                {/* Lightbox content */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="fixed inset-0 z-[101] flex flex-col items-center justify-center px-4 py-6 pointer-events-none"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setLightboxIndex(null)}
                    className="pointer-events-auto absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X size={20} />
                  </button>

                  {/* Screen label */}
                  <p className="pointer-events-none text-white/60 text-xs uppercase tracking-wider mb-3 font-medium">
                    {screens[lightboxIndex]?.title} · {lightboxIndex + 1} / {details.images.length}
                  </p>

                  {/* Large image */}
                  <div className="pointer-events-auto relative flex items-center gap-4">
                    {/* Prev */}
                    <button
                      onClick={() => setLightboxIndex((i) => (i! - 1 + details.images.length) % details.images.length)}
                      className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      {isAr ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
                    </button>

                    <AnimatePresence mode="wait">
                      <motion.img
                        key={lightboxIndex}
                        src={details.images[lightboxIndex]}
                        alt={screens[lightboxIndex]?.title}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="max-h-[65vh] max-w-[260px] w-auto rounded-2xl shadow-2xl object-contain"
                      />
                    </AnimatePresence>

                    {/* Next */}
                    <button
                      onClick={() => setLightboxIndex((i) => (i! + 1) % details.images.length)}
                      className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      {isAr ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
                    </button>
                  </div>

                  {/* Thumbnail strip */}
                  <div className="pointer-events-auto mt-5 flex gap-2 overflow-x-auto max-w-sm px-2 pb-1">
                    {details.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className={`flex-shrink-0 w-14 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                          lightboxIndex === idx
                            ? "border-white scale-105"
                            : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={screens[idx]?.title || `screen-${idx}`}
                          className="w-full h-auto object-cover object-top"
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailDrawer;
