import { useEffect, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  Clock3,
  Code2,
  Compass,
  Database,
  Flame,
  GraduationCap,
  Headphones,
  Heart,
  // LayoutDashboard,
  Lock,
  LogOut,
  Medal,
  Menu,
  MessageSquare,
  MonitorPlay,
  Pencil,
  PlayCircle,
  Quote,
  Reply,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  Trophy,
  // UserCircle,
  UserRoundPlus,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  HashRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

/* ══════════════════════════════════════
   TYPES
   ══════════════════════════════════════ */
type User = { name: string; email: string; track: string; bio: string; joined: string };
type Lesson = { title: string; duration: string; type: string; summary: string };
type Course = {
  slug: string; title: string; category: string; level: string; duration: string;
  students: string; rating: number; shortDescription: string; description: string;
  mentor: string; icon: LucideIcon; accent: string; outcomes: string[]; skills: string[];
  lessons: Lesson[];
};
type QuizQuestion = { prompt: string; options: string[]; answer: string; note: string };
type Quiz = {
  slug: string; title: string; category: string; difficulty: string; time: string;
  description: string; icon: LucideIcon; color: string; questions: QuizQuestion[];
};
type ForumReply = { id: number; author: string; body: string };
type ForumPost = {
  id: number; author: string; role: string; title: string; body: string;
  tag: string; replies: ForumReply[]; likes: number; liked: boolean;
};
type Booking = { mentorName: string; date: string; topic: string; status: string };
type AppState = {
  user: User | null; isLoggedIn: boolean;
  enrolledCourses: string[]; courseProgress: Record<string, number>;
  quizBestScores: Record<string, number>; forumPosts: ForumPost[];
  bookmarks: string[]; bookings: Booking[]; streak: number;
  signup: (p: User) => void; logout: () => void; updateProfile: (p: Partial<User>) => void;
  enrollCourse: (s: string) => void; completeLesson: (s: string) => void;
  saveQuizScore: (s: string, n: number) => void;
  createPost: (t: string, b: string, tag: string) => void;
  updatePost: (id: number, t: string, b: string, tag: string) => void;
  deletePost: (id: number) => void; likePost: (id: number) => void;
  addReply: (postId: number, body: string) => void;
  toggleBookmark: (slug: string) => void;
  addBooking: (b: Booking) => void;
};

/* ══════════════════════════════════════
   DATA
   ══════════════════════════════════════ */
const mentorPhotos = {
  ava: "https://images.pexels.com/photos/5905753/pexels-photo-5905753.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  noah: "https://images.pexels.com/photos/8837558/pexels-photo-8837558.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  mia: "https://images.pexels.com/photos/6981004/pexels-photo-6981004.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  ethan: "https://images.pexels.com/photos/28513050/pexels-photo-28513050.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
};
const studentsPhoto = "https://images.pexels.com/photos/8199558/pexels-photo-8199558.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400";

const mentors = [
  { name: "Ava Thomas", role: "Frontend Consultant", specialty: "React architecture & component systems", photo: mentorPhotos.ava, sessions: 340, rating: 4.9, bio: "10+ years building design systems for ed-tech startups. Former lead at a Y-Combinator ed platform. Specializes in making interfaces feel effortless.", available: ["Mon 10am", "Wed 2pm", "Fri 11am"] },
  { name: "Noah Bennett", role: "Backend Consultant", specialty: "Express APIs, auth flows & scaling", photo: mentorPhotos.noah, sessions: 280, rating: 4.8, bio: "Full-stack architect who scaled APIs serving 2M+ users. Passionate about clean service layers, proper auth, and performant endpoints.", available: ["Tue 9am", "Thu 3pm", "Sat 10am"] },
  { name: "Mia Carter", role: "Data Consultant", specialty: "MongoDB modeling & query tuning", photo: mentorPhotos.mia, sessions: 215, rating: 4.8, bio: "Database specialist with deep experience in document modeling, aggregation pipelines, and migration strategies for learning platforms.", available: ["Mon 2pm", "Wed 10am", "Fri 4pm"] },
  { name: "Ethan Cole", role: "Full-Stack Advisor", specialty: "Next.js product architecture & SEO", photo: mentorPhotos.ethan, sessions: 310, rating: 5.0, bio: "Product engineer who has shipped 15+ Next.js applications. Focuses on app architecture, SEO, and turning side projects into real businesses.", available: ["Tue 11am", "Thu 1pm", "Sat 2pm"] },
];

const testimonials = [
  { text: "The mentors didn't just teach — they reviewed my code, pointed out architecture mistakes, and helped me ship a real project.", author: "Riya S.", role: "Frontend learner → Junior dev" },
  { text: "I went from watching random tutorials to following a clear path with quizzes and leaderboards that kept me accountable every day.", author: "Omar K.", role: "Career switcher → Full-stack intern" },
  { text: "Being able to book a consultancy session and then immediately practice with the quiz module made concepts stick way faster.", author: "Sara L.", role: "CS student → Open-source contributor" },
];

const courses: Course[] = [
  { slug: "frontend-foundations", title: "Frontend Foundations", category: "Frontend", level: "Beginner", duration: "6 weeks", students: "12.4k learners", rating: 4.9, shortDescription: "Responsive UI, reusable React components, and polished product thinking.", description: "Master the fundamentals of modern interface development with React architecture, component design, layout systems, and motion-first interactions for learner-facing products.", mentor: "Ava Thomas", icon: MonitorPlay, accent: "from-violet-500 via-indigo-500 to-blue-500", outcomes: ["Build production-ready landing and dashboard interfaces", "Create reusable component systems with Tailwind CSS", "Ship accessible navigation, forms, and responsive layouts"], skills: ["React", "Tailwind CSS", "Component design", "Accessibility"], lessons: [{ title: "Designing layout systems for learning products", duration: "18 min", type: "Video", summary: "Create visual structure for hero areas, curriculum grids, and learning dashboards." }, { title: "Reusable cards and CTA sections", duration: "22 min", type: "Workshop", summary: "Build premium course cards and conversion-focused call-to-action blocks." }, { title: "Responsive navigation and page transitions", duration: "16 min", type: "Project", summary: "Connect sections and pages into a clean product flow with route-aware navigation." }, { title: "Accessible forms for learner onboarding", duration: "19 min", type: "Video", summary: "Create login, signup, and profile entry forms with strong UX patterns." }] },
  { slug: "express-api-lab", title: "Express API Lab", category: "Backend", level: "Intermediate", duration: "5 weeks", students: "8.9k learners", rating: 4.8, shortDescription: "Design APIs for auth, progress tracking, quizzes, and community modules.", description: "Build backend confidence through route design, middleware layering, validation, and scalable service structure tailored for full-stack education platforms.", mentor: "Noah Bennett", icon: Rocket, accent: "from-emerald-500 via-teal-500 to-cyan-500", outcomes: ["Design REST endpoints for quizzes, courses, and community posts", "Add middleware for auth, validation, and error handling", "Structure controllers and services for growth-ready apps"], skills: ["Express.js", "REST APIs", "Middleware", "Validation"], lessons: [{ title: "Designing auth and session routes", duration: "20 min", type: "Video", summary: "Plan login, signup, refresh, and protected endpoint strategies." }, { title: "Quiz scoring and leaderboard APIs", duration: "24 min", type: "Workshop", summary: "Store attempts, compute rankings, and return useful stats efficiently." }, { title: "Forum CRUD endpoints", duration: "17 min", type: "Project", summary: "Model post creation, updates, deletion, and moderation-ready handlers." }, { title: "Error boundaries for APIs", duration: "14 min", type: "Reading", summary: "Return consistent responses that frontends can render elegantly." }] },
  { slug: "mongodb-for-community-apps", title: "MongoDB for Community Apps", category: "Database", level: "Intermediate", duration: "4 weeks", students: "7.2k learners", rating: 4.8, shortDescription: "Model course data, forum threads, profiles, and quiz attempts with confidence.", description: "Learn to shape flexible MongoDB documents for education apps that need strong course metadata, community discussions, and scalable learner history.", mentor: "Mia Carter", icon: Database, accent: "from-amber-400 via-orange-500 to-rose-500", outcomes: ["Design document structures for discussions and replies", "Store learner progress and quiz history efficiently", "Choose indexes for common reads and leaderboard queries"], skills: ["MongoDB", "Schema design", "Indexes", "Aggregation"], lessons: [{ title: "Choosing documents vs references", duration: "15 min", type: "Video", summary: "Decide when discussion replies should be embedded or stored separately." }, { title: "Learning progress schema", duration: "18 min", type: "Workshop", summary: "Model enrolled courses, completion states, and timestamps for dashboards." }, { title: "Leaderboard queries with aggregation", duration: "21 min", type: "Project", summary: "Compute best scores, rank learners, and support analytics views." }, { title: "Index strategy for fast reads", duration: "12 min", type: "Reading", summary: "Improve response times for active discussions and learner search." }] },
  { slug: "nextjs-product-systems", title: "Next.js Product Systems", category: "Full Stack", level: "Advanced", duration: "7 weeks", students: "10.1k learners", rating: 5, shortDescription: "Route groups, hybrid rendering, SEO, and scalable app structure.", description: "Move from page building to product architecture with advanced Next.js patterns that power course libraries, protected dashboards, and content-rich learning experiences.", mentor: "Ethan Cole", icon: Code2, accent: "from-slate-800 via-slate-700 to-slate-500", outcomes: ["Architect route-driven learning experiences", "Render landing pages and protected areas cleanly", "Prepare production-ready folder and content structures"], skills: ["Next.js", "Routing", "SEO", "App architecture"], lessons: [{ title: "Course hubs with route-based UX", duration: "19 min", type: "Video", summary: "Build fast, navigable learning libraries with detail pages and CTAs." }, { title: "Protected learner dashboards", duration: "20 min", type: "Workshop", summary: "Separate public marketing pages from authenticated product surfaces." }, { title: "Metadata and SEO for course pages", duration: "13 min", type: "Reading", summary: "Improve discoverability for individual programs and topics." }, { title: "Structuring a scalable full-stack project", duration: "26 min", type: "Project", summary: "Organize domains, services, and routes for long-term maintainability." }] },
];

const quizzes: Quiz[] = [
  { slug: "react-ui-challenge", title: "React UI Challenge", category: "Frontend", difficulty: "Beginner", time: "8 min", description: "Test your understanding of React components, state, and responsive interface decisions.", icon: BrainCircuit, color: "from-violet-500 to-fuchsia-500", questions: [{ prompt: "What makes a component reusable in a course platform UI?", options: ["Hardcoded content only", "Flexible props and consistent styling", "Editing the DOM manually", "Avoiding state completely"], answer: "Flexible props and consistent styling", note: "Reusable components accept changing content while keeping behavior and styling predictable." }, { prompt: "Which state is best for a selected quiz answer?", options: ["A local component state value", "A CSS class", "A database migration", "A build script"], answer: "A local component state value", note: "Local state is ideal for current-screen interaction like selected options." }, { prompt: "What improves navigation between multiple product pages?", options: ["Route-based layout structure", "Inline event handlers only", "Random link labels", "Removing page headings"], answer: "Route-based layout structure", note: "Route-based structure makes moving between public and learning pages feel natural." }] },
  { slug: "express-quiz-engine", title: "Express Quiz Engine", category: "Backend", difficulty: "Intermediate", time: "10 min", description: "Practice the API and middleware concepts behind scores, attempts, and quiz submissions.", icon: ShieldCheck, color: "from-emerald-500 to-cyan-500", questions: [{ prompt: "Which Express feature is commonly used before route handlers?", options: ["Middleware", "SVG sprite maps", "Tailwind plugins", "Client hydration only"], answer: "Middleware", note: "Middleware handles authentication, validation, logging, and pre-processing." }, { prompt: "What should a quiz submission endpoint typically return?", options: ["The score and attempt summary", "A new CSS file", "Only HTML markup", "A browser refresh request"], answer: "The score and attempt summary", note: "Useful APIs return score-related data that the frontend can render immediately." }, { prompt: "Why centralize error handling in an API?", options: ["For consistent responses and easier maintenance", "To remove authentication", "To disable route files", "To avoid status codes"], answer: "For consistent responses and easier maintenance", note: "Shared error handling keeps API output predictable and easier to debug." }] },
  { slug: "mongodb-data-modeling", title: "MongoDB Data Modeling", category: "Database", difficulty: "Intermediate", time: "9 min", description: "Validate your understanding of schema flexibility, references, and aggregation patterns.", icon: Database, color: "from-amber-400 to-orange-500", questions: [{ prompt: "Why is MongoDB useful for forum posts and replies?", options: ["Flexible document structures", "It replaces React automatically", "It removes all backend code", "It only stores images"], answer: "Flexible document structures", note: "Flexible documents are great for evolving discussion and profile content." }, { prompt: "What helps improve common read performance?", options: ["Indexes", "Random field names", "No schema planning", "Large inline images"], answer: "Indexes", note: "Indexes improve query speed for repeated filters and lookups." }, { prompt: "What is aggregation useful for in a learning app?", options: ["Computing leaderboards and analytics", "Compiling CSS", "Handling SVG icons", "Writing JSX"], answer: "Computing leaderboards and analytics", note: "Aggregation helps calculate rankings, summaries, and performance insights." }] },
  { slug: "full-stack-product-review", title: "Full-Stack Product Review", category: "Full Stack", difficulty: "Advanced", time: "12 min", description: "A higher-level challenge covering architecture, feature design, and learner product decisions.", icon: Trophy, color: "from-slate-800 to-slate-500", questions: [{ prompt: "What connects the public website to the learner experience best?", options: ["Shared navigation and route flow", "Separate unrelated designs", "Removing course detail pages", "Only using anchor links"], answer: "Shared navigation and route flow", note: "A strong product makes the transition from marketing to usage feel intentional." }, { prompt: "What should an authenticated dashboard prioritize?", options: ["Progress, next actions, and recent performance", "Random animations only", "Long hero sections only", "Empty placeholders"], answer: "Progress, next actions, and recent performance", note: "A dashboard should help the learner continue quickly and confidently." }, { prompt: "What makes a discussion module feel usable?", options: ["Clear creation, editing, and deletion flows", "No structure for posts", "Hidden content everywhere", "No author details"], answer: "Clear creation, editing, and deletion flows", note: "A community feature becomes valuable when core interactions are easy and visible." }] },
];

const initialForumPosts: ForumPost[] = [
  { id: 1, author: "Riya", role: "Frontend learner", title: "How should I plan a clean course dashboard layout?", body: "I want a dashboard that shows progress, next lessons, and quiz history without feeling crowded. What should I prioritize first?", tag: "UI/UX", replies: [{ id: 101, author: "Ava (Mentor)", body: "Start with the three most important metrics, then add a 'continue learning' section below. Keep it scannable." }], likes: 28, liked: false },
  { id: 2, author: "Omar", role: "Backend mentor", title: "Best approach for storing quiz attempts in MongoDB", body: "Would you keep all attempts embedded under a learner or store them separately for easier leaderboard queries and analytics?", tag: "MongoDB", replies: [{ id: 102, author: "Mia (Mentor)", body: "Separate collection for attempts. Embed only the latest best score in the user doc for quick reads." }], likes: 21, liked: false },
  { id: 3, author: "Sara", role: "Full-stack learner", title: "How do you connect Next.js pages with Express APIs cleanly?", body: "I am trying to keep frontend and backend responsibilities clean while still making auth and course progress feel seamless.", tag: "Architecture", replies: [{ id: 103, author: "Ethan (Mentor)", body: "Use a shared types package and keep API calls in a dedicated service layer. Never call fetch directly in components." }], likes: 34, liked: false },
];

const mentorHighlights = [
  { title: "Career-ready curriculum", text: "From polished landing pages to protected learner dashboards, every screen mirrors a real SaaS learning product.", icon: GraduationCap },
  { title: "Practice with feedback", text: "Quizzes, leaderboards, progress cards, and guided next steps keep learners moving forward every session.", icon: Medal },
  { title: "Community-powered growth", text: "Students can ask, update, and manage discussion threads in a focused collaborative space.", icon: Users },
];

const baseLeaderboard = [
  { name: "Maya", score: 96, note: "11 day streak" },
  { name: "Aarav", score: 93, note: "8 day streak" },
  { name: "Noah", score: 89, note: "5 day streak" },
  { name: "Lina", score: 84, note: "4 day streak" },
];

const stats = [
  { value: "25k+", label: "active learners" },
  { value: "120+", label: "guided lessons" },
  { value: "40+", label: "hands-on quizzes" },
  { value: "4.9/5", label: "average rating" },
];

const categories = ["All", "Frontend", "Backend", "Database", "Full Stack"];
const forumTags = ["General", "UI/UX", "React", "Express", "MongoDB", "Architecture"];

/* ══════════════════════════════════════
   HOOK: localStorage persistence
   ══════════════════════════════════════ */
function useLS<T>(key: string, init: T) {
  const [val, setVal] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) as T : init; } catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal] as const;
}

/* ══════════════════════════════════════
   ROOT APP
   ══════════════════════════════════════ */
function App() {
  const [user, setUser] = useLS<User | null>("learnify-user", null);
  const [enrolledCourses, setEnrolled] = useLS<string[]>("learnify-enrolled", []);
  const [courseProgress, setProgress] = useLS<Record<string, number>>("learnify-progress", {});
  const [quizBestScores, setScores] = useLS<Record<string, number>>("learnify-quiz-scores", {});
  const [forumPosts, setPosts] = useLS<ForumPost[]>("learnify-forum-v2", initialForumPosts);
  const [bookmarks, setBookmarks] = useLS<string[]>("learnify-bookmarks", []);
  const [bookings, setBookings] = useLS<Booking[]>("learnify-bookings", []);
  const [streak, setStreak] = useLS<number>("learnify-streak", 0);

  const signup = useCallback((p: User) => { setUser(p); setStreak(1); }, [setUser, setStreak]);
  const logout = useCallback(() => setUser(null), [setUser]);
  const updateProfile = useCallback((p: Partial<User>) => setUser(c => c ? { ...c, ...p } : c), [setUser]);
  const enrollCourse = useCallback((s: string) => { setEnrolled(c => c.includes(s) ? c : [...c, s]); setProgress(c => ({ ...c, [s]: c[s] ?? 12 })); setStreak(c => c + 1); }, [setEnrolled, setProgress, setStreak]);
  const completeLesson = useCallback((s: string) => { const total = courses.find(c => c.slug === s)?.lessons.length ?? 4; const step = Math.round(100 / total); setProgress(c => ({ ...c, [s]: Math.min(100, (c[s] ?? 0) + step) })); setStreak(c => c + 1); }, [setProgress, setStreak]);
  const saveQuizScore = useCallback((s: string, n: number) => { setScores(c => ({ ...c, [s]: Math.max(c[s] ?? 0, n) })); setStreak(c => c + 1); }, [setScores, setStreak]);
  const createPost = useCallback((t: string, b: string, tag: string) => { if (!user) return; setPosts(c => [{ id: Date.now(), author: user.name, role: `${user.track} learner`, title: t, body: b, tag, replies: [], likes: 0, liked: false }, ...c]); }, [user, setPosts]);
  const updatePost = useCallback((id: number, t: string, b: string, tag: string) => setPosts(c => c.map(p => p.id === id ? { ...p, title: t, body: b, tag } : p)), [setPosts]);
  const deletePost = useCallback((id: number) => setPosts(c => c.filter(p => p.id !== id)), [setPosts]);
  const likePost = useCallback((id: number) => setPosts(c => c.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)), [setPosts]);
  const addReply = useCallback((postId: number, body: string) => { if (!user) return; setPosts(c => c.map(p => p.id === postId ? { ...p, replies: [...p.replies, { id: Date.now(), author: user.name, body }] } : p)); }, [user, setPosts]);
  const toggleBookmark = useCallback((slug: string) => setBookmarks(c => c.includes(slug) ? c.filter(s => s !== slug) : [...c, slug]), [setBookmarks]);
  const addBooking = useCallback((b: Booking) => setBookings(c => [b, ...c]), [setBookings]);

  const S: AppState = { user, isLoggedIn: !!user, enrolledCourses, courseProgress, quizBestScores, forumPosts, bookmarks, bookings, streak, signup, logout, updateProfile, enrollCourse, completeLesson, saveQuizScore, createPost, updatePost, deletePost, likePost, addReply, toggleBookmark, addBooking };

  return (
    <HashRouter>
      <ScrollToTop />
      <Shell S={S}>
        <Routes>
          <Route path="/" element={<HomePage S={S} />} />
          <Route path="/courses" element={<CoursesPage S={S} />} />
          <Route path="/courses/:slug" element={<CourseDetailPage S={S} />} />
          <Route path="/quizzes" element={<QuizzesPage S={S} />} />
          <Route path="/quizzes/:slug" element={<QuizDetailPage S={S} />} />
          <Route path="/dashboard" element={<DashboardPage S={S} />} />
          <Route path="/community" element={<CommunityPage S={S} />} />
          <Route path="/mentors" element={<MentorsPage S={S} />} />
          <Route path="/profile" element={<ProfilePage S={S} />} />
          <Route path="/auth" element={<AuthPage S={S} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Shell>
    </HashRouter>
  );
}

function ScrollToTop() { const l = useLocation(); useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [l.pathname]); return null; }

/* ══════════════════════════════════════
   SHELL (nav + footer)
   ══════════════════════════════════════ */
function Shell({ children, S }: { children: React.ReactNode; S: AppState }) {
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links: [string, string][] = [["/", "Home"], ["/courses", "Courses"], ["/quizzes", "Quizzes"], ["/mentors", "Mentors"], ["/dashboard", "Dashboard"], ["/community", "Community"]];

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-[#f6f1e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15"><GraduationCap className="h-5 w-5" /></span>
            <span className="text-xl">Learnify</span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {links.map(([p, l]) => <NavLink key={p} to={p} end={p === "/"} className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}>{l}</NavLink>)}
          </nav>

          <div className="flex items-center gap-3">
            {S.user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 transition hover:ring-2 hover:ring-emerald-300">{S.user.name[0].toUpperCase()}</Link>
                <button onClick={() => { S.logout(); nav("/"); }} className="hidden items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:inline-flex"><LogOut className="h-4 w-4" /> Logout</button>
              </div>
            ) : (
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"><UserRoundPlus className="h-4 w-4" /> Start learning</Link>
            )}
            <button onClick={() => setMobileOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 md:hidden"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40" onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} onClick={e => e.stopPropagation()} className="absolute right-0 top-0 h-full w-72 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-8"><span className="text-xl font-semibold">Menu</span><button onClick={() => setMobileOpen(false)}><X className="h-6 w-6" /></button></div>
              <div className="space-y-2">
                {links.map(([p, l]) => <Link key={p} to={p} onClick={() => setMobileOpen(false)} className="block rounded-2xl px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100">{l}</Link>)}
                {S.user && <Link to="/profile" onClick={() => setMobileOpen(false)} className="block rounded-2xl px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100">Profile & Settings</Link>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div><div className="flex items-center gap-3 font-semibold text-slate-950"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white"><GraduationCap className="h-5 w-5" /></span>Learnify</div><p className="mt-4 max-w-sm leading-7 text-slate-600">Full-stack e-learning platform with courses, quizzes, mentors, dashboards, and community.</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Learn</p><div className="mt-4 space-y-3 text-sm text-slate-600"><Link className="block hover:text-slate-950" to="/courses">Courses</Link><Link className="block hover:text-slate-950" to="/quizzes">Quizzes</Link><Link className="block hover:text-slate-950" to="/mentors">Mentors</Link></div></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Platform</p><div className="mt-4 space-y-3 text-sm text-slate-600"><Link className="block hover:text-slate-950" to="/dashboard">Dashboard</Link><Link className="block hover:text-slate-950" to="/community">Community</Link><Link className="block hover:text-slate-950" to="/auth">Sign up</Link></div></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Stack</p><p className="mt-4 text-sm text-slate-600 leading-7">Next.js · Express · React · MongoDB</p><p className="mt-3 text-sm text-slate-600 leading-7">Tailwind CSS · Framer Motion</p></div>
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════ */
function HomePage({ S }: { S: AppState }) {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#f6f1e8]">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:min-h-[90vh] lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-emerald-700"><Sparkles className="h-3.5 w-3.5" /> Courses · Quizzes · Mentors · Community</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="text-[2.75rem] font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-[4.25rem]">Learn from expert teachers. <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">Build real projects.</span></motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-6 text-lg leading-8 text-slate-600">Learnify combines structured courses, interactive quizzes, 1-on-1 teacher consultancy, and a supportive learner community into one polished platform.</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to={S.isLoggedIn ? "/dashboard" : "/auth"} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 font-semibold text-white shadow-xl shadow-slate-950/15 transition hover:bg-slate-800">{S.isLoggedIn ? "Go to dashboard" : "Start learning — free"} <ArrowRight className="h-5 w-5" /></Link>
              <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-950 transition hover:border-slate-400 hover:shadow-md">Browse courses <Compass className="h-5 w-5" /></Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-14 flex flex-wrap items-center gap-6 border-t border-slate-200 pt-8">
              <div className="flex -space-x-3">{Object.values(mentorPhotos).map((s, i) => <img key={i} src={s} alt="" className="h-11 w-11 rounded-full border-[3px] border-[#f6f1e8] object-cover" />)}<span className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#f6f1e8] bg-emerald-100 text-xs font-bold text-emerald-700">+20</span></div>
              <div className="text-sm text-slate-600"><span className="font-semibold text-slate-950">25,000+ learners</span> already studying with our mentors</div>
              <div className="flex items-center gap-1">{[1,2,3,4,5].map(n => <Star key={n} className="h-4 w-4 fill-amber-400 text-amber-400" />)}<span className="ml-1 text-sm font-semibold text-slate-950">4.9</span></div>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.7 }} className="relative">
            <div className="overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-950/10"><img src={studentsPhoto} alt="Learners collaborating" className="aspect-[4/3] w-full object-cover" /></div>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="absolute -left-4 top-8 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-xl sm:-left-8"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><PlayCircle className="h-5 w-5" /></div><div><p className="text-2xl font-bold tracking-tight text-slate-950">120+</p><p className="text-xs font-medium text-slate-500">Video lessons</p></div></div></motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }} className="absolute -right-3 bottom-10 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-xl sm:-right-6"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700"><Trophy className="h-5 w-5" /></div><div><p className="text-2xl font-bold tracking-tight text-slate-950">40+</p><p className="text-xs font-medium text-slate-500">Quiz challenges</p></div></div></motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="absolute -bottom-5 left-6 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-lg"><div className="flex items-center gap-2 text-sm"><Video className="h-4 w-4 text-emerald-600" /><span className="font-semibold text-slate-950">1-on-1 consultancy available</span></div></motion.div>
          </motion.div>
        </div>
      </section>

      {/* STAT BAR */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4">
          {stats.map(s => <div key={s.label} className="px-6 py-8 text-center sm:py-10"><p className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{s.value}</p><p className="mt-2 text-sm font-medium text-slate-500">{s.label}</p></div>)}
        </div>
      </section>

      {/* PLATFORM AREAS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Heading e="Everything in one place" t="Courses, quizzes, mentors, dashboard, and community — each on its own page." d="Navigate the full platform using the top menu or click any card below." />
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <PageCard to="/courses" title="Courses" text="Structured paths with lessons and enrollment." icon={BookOpen} />
          <PageCard to="/quizzes" title="Quizzes" text="Category-based challenges with live scoring." icon={BrainCircuit} />
          <PageCard to="/mentors" title="Mentors" text="Book 1-on-1 sessions with experts." icon={Headphones} />
          <PageCard to="/community" title="Community" text="Discussion threads with full CRUD & replies." icon={Users} />
        </div>
      </section>

      {/* MENTORS PREVIEW */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Heading e="Teacher & consultancy" t="Learn directly from industry mentors who've built real products." d="Every course is led by a mentor available for 1-on-1 consultancy. Get code reviews, career guidance, and architecture advice." />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {mentors.map((m, i) => <MentorCard key={m.name} m={m} i={i} S={S} />)}
          </div>
          <div className="mt-10 text-center"><Link to="/mentors" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-950 transition hover:border-slate-400 hover:shadow-md">View all mentors & book <ArrowRight className="h-5 w-5" /></Link></div>
        </div>
      </section>

      {/* COURSES */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Heading e="Featured learning paths" t="Pick a structured course and start building real skills today." d="Each card links to a full detail page with lessons, outcomes, mentor info, and enrollment." />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">{courses.slice(0, 4).map((c, i) => <CourseCard key={c.slug} course={c} index={i} progress={S.courseProgress[c.slug] ?? 0} bookmarked={S.bookmarks.includes(c.slug)} onBookmark={() => S.toggleBookmark(c.slug)} />)}</div>
        <div className="mt-10 text-center"><Link to="/courses" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-950 transition hover:border-slate-400 hover:shadow-md">View all courses <ArrowRight className="h-5 w-5" /></Link></div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-slate-200 bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Heading e="Student success stories" t="Hear what learners and mentees have to say." d="Real feedback from students who used courses, quizzes, and consultancy sessions to level up." />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => <motion.div key={t.author} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: i * 0.08 }} className="rounded-[2rem] border border-slate-200 bg-[#f6f1e8] p-7"><Quote className="h-8 w-8 text-emerald-400" /><p className="mt-5 text-lg leading-8 text-slate-700">"{t.text}"</p><div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-5"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">{t.author[0]}</div><div><p className="font-semibold text-slate-950">{t.author}</p><p className="text-sm text-slate-500">{t.role}</p></div></div></motion.div>)}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Heading e="Why Learnify" t="A complete learning product — not just another course page." d="Guest previews, auth gating, progress tracking, and real teacher interaction." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">{mentorHighlights.map(h => <div key={h.title} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white"><h.icon className="h-6 w-6" /></div><h3 className="mt-6 text-2xl font-bold tracking-tight">{h.title}</h3><p className="mt-3 leading-7 text-slate-600">{h.text}</p></div>)}</div>
      </section>

      {/* BOTTOM CTA */}
      <section className="px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-slate-950 text-white">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-16">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.28em] text-emerald-300"><Sparkles className="h-4 w-4" /> Ready to begin?</p>
              <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Your teachers are waiting. Your dashboard is empty. Let's fix that.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">Create a free account, enroll in a course, attempt a quiz, and book a mentor session — everything works end-to-end.</p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to={S.isLoggedIn ? "/dashboard" : "/auth"} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 py-4 font-semibold text-slate-950 transition hover:bg-emerald-300">{S.isLoggedIn ? "Open dashboard" : "Start your learning"} <ArrowRight className="h-5 w-5" /></Link>
                <Link to="/community" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 font-semibold text-white transition hover:bg-white/10">Join community <MessageSquare className="h-5 w-5" /></Link>
              </div>
            </div>
            <div className="hidden items-end lg:flex"><img src={studentsPhoto} alt="Students collaborating" className="h-full w-full object-cover" /></div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════
   COURSES PAGE
   ══════════════════════════════════════ */
function CoursesPage({ S }: { S: AppState }) {
  const [cat, setCat] = useState("All");
  const filtered = courses.filter(c => cat === "All" || c.category === cat);
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
      <Heading e="Course library" t="Explore learning paths across frontend, backend, database, and full-stack." d="Click any course to open its own page. Guests can explore content previews, signed-in learners enroll and track progress." />
      <div className="mt-8 flex flex-wrap gap-3">{categories.map(c => <button key={c} onClick={() => setCat(c)} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${cat === c ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>{c}</button>)}</div>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">{filtered.map((c, i) => <CourseCard key={c.slug} course={c} index={i} progress={S.courseProgress[c.slug] ?? 0} bookmarked={S.bookmarks.includes(c.slug)} onBookmark={() => S.toggleBookmark(c.slug)} />)}</div>
      <BottomCTA S={S} />
    </main>
  );
}

/* ══════════════════════════════════════
   COURSE DETAIL
   ══════════════════════════════════════ */
function CourseDetailPage({ S }: { S: AppState }) {
  const nav = useNavigate(); const { slug } = useParams();
  const course = courses.find(c => c.slug === slug);
  if (!course) return <NotFound type="course" />;
  const isEnrolled = S.enrolledCourses.includes(course.slug);
  const progress = S.courseProgress[course.slug] ?? 0;
  const Icon = course.icon;
  const mentor = mentors.find(m => m.name === course.mentor);
  const completedLessons = Math.round((progress / 100) * course.lessons.length);

  return (
    <main>
      <section className="border-b border-slate-200 bg-white/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-20">
          <div>
            <div className="flex items-center gap-4">
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${course.accent} text-white shadow-xl`}><Icon className="h-8 w-8" /></div>
              <button onClick={() => S.toggleBookmark(course.slug)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition hover:border-emerald-400">
                {S.bookmarks.includes(course.slug) ? <BookmarkCheck className="h-5 w-5 text-emerald-600" /> : <Bookmark className="h-5 w-5 text-slate-400" />}
              </button>
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">{course.category} · {course.level}</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">{course.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{course.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2"><Clock3 className="h-4 w-4" /> {course.duration}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2"><Users className="h-4 w-4" /> {course.students}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2"><Star className="h-4 w-4 fill-current text-amber-500" /> {course.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-[#f6f1e8] p-6 shadow-sm sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2"><MetaCard v={course.mentor} l="Mentor" /><MetaCard v={`${course.lessons.length} lessons`} l="Modules" /></div>
              <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between"><p className="font-semibold">Progress</p><span className="text-sm font-semibold text-emerald-700">{progress}%</span></div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} /></div>
                <p className="mt-3 text-sm text-slate-500">{completedLessons} of {course.lessons.length} lessons completed</p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                {S.isLoggedIn ? (<>
                  <button onClick={() => S.enrollCourse(course.slug)} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">{isEnrolled ? "✓ Enrolled" : "Enroll now"} <ArrowRight className="h-5 w-5" /></button>
                  <button onClick={() => S.completeLesson(course.slug)} disabled={!isEnrolled || progress >= 100} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50">{progress >= 100 ? "Course completed 🎉" : "Complete next lesson"} <CheckCircle2 className="h-5 w-5" /></button>
                </>) : (
                  <button onClick={() => nav("/auth")} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400">Start your learning <UserRoundPlus className="h-5 w-5" /></button>
                )}
              </div>
            </div>

            {mentor && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Course mentor</p>
                <div className="mt-4 flex items-center gap-4">
                  <img src={mentor.photo} alt={mentor.name} className="h-14 w-14 rounded-full object-cover" />
                  <div><p className="font-semibold text-slate-950">{mentor.name}</p><p className="text-sm text-slate-500">{mentor.role}</p></div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{mentor.bio}</p>
                <Link to="/mentors" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600">Book a session <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-20">
        <div>
          <Heading e="What you will learn" t="Clear outcomes and practical skills." d="Structured like a real learning product, with outcomes, skills, and a detailed syllabus." />
          <div className="mt-10 grid gap-4">{course.outcomes.map(o => <div key={o} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" /><p className="leading-7 text-slate-700">{o}</p></div>)}</div>
          <div className="mt-8 flex flex-wrap gap-3">{course.skills.map(s => <span key={s} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">{s}</span>)}</div>
        </div>
        <div className="relative mt-12 lg:mt-0">
          {!S.isLoggedIn && <Gate t="Start your learning" d="Create an account to unlock lessons, track progress, and continue this course." />}
          <div className={!S.isLoggedIn ? "pointer-events-none blur-[3px]" : ""}>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Syllabus</p>
              <div className="mt-6 space-y-4">
                {course.lessons.map((les, i) => (
                  <div key={les.title} className={`rounded-3xl border p-5 ${i < completedLessons ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {i < completedLessons && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Lesson {i + 1}</p>
                        </div>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{les.title}</h3>
                        <p className="mt-3 leading-7 text-slate-600">{les.summary}</p>
                      </div>
                      <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">{les.type} · {les.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════
   QUIZZES PAGE
   ══════════════════════════════════════ */
function QuizzesPage({ S }: { S: AppState }) {
  const [cat, setCat] = useState("All");
  const filtered = quizzes.filter(q => cat === "All" || q.category === cat);
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
      <Heading e="Quiz center" t="Challenge yourself with category-based quizzes and real saved progress." d="Each quiz opens as its own working page. Signed-in learners save best scores to the dashboard and leaderboard." />
      <div className="mt-8 flex flex-wrap gap-3">{categories.map(c => <button key={c} onClick={() => setCat(c)} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${cat === c ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>{c}</button>)}</div>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">{filtered.map((q, i) => <QuizCard key={q.slug} quiz={q} index={i} bestScore={S.quizBestScores[q.slug] ?? 0} />)}</div>
      <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-700">Personalized feedback</p><h3 className="mt-3 text-3xl font-semibold tracking-tight">Review best scores and keep improving.</h3><p className="mt-4 max-w-2xl leading-7 text-slate-600">Quiz attempts are stored for signed-in learners, making the website feel like a real usable product.</p></div>
        <LBoard user={S.user} scores={S.quizBestScores} />
      </div>
    </main>
  );
}

/* ══════════════════════════════════════
   QUIZ DETAIL
   ══════════════════════════════════════ */
function QuizDetailPage({ S }: { S: AppState }) {
  const { slug } = useParams(); const nav = useNavigate();
  const quiz = quizzes.find(q => q.slug === slug);
  const [step, setStep] = useState(0); const [sel, setSel] = useState<string | null>(null);
  const [score, setScore] = useState(0); const [done, setDone] = useState(false); const [note, setNote] = useState(false);
  if (!quiz) return <NotFound type="quiz" />;
  const q = quiz.questions[step]; const best = S.quizBestScores[quiz.slug] ?? 0; const QI = quiz.icon;

  const next = () => { if (!sel) return; const ns = sel === q.answer ? score + 1 : score; if (step === quiz.questions.length - 1) { const pct = Math.round((ns / quiz.questions.length) * 100); setScore(ns); S.saveQuizScore(quiz.slug, pct); setDone(true); setNote(false); return; } setScore(ns); setStep(s => s + 1); setSel(null); setNote(false); };
  const reset = () => { setStep(0); setSel(null); setScore(0); setDone(false); setNote(false); };

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${quiz.color} text-white shadow-xl`}><QI className="h-8 w-8" /></div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-indigo-700">{quiz.category} · {quiz.difficulty}</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">{quiz.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{quiz.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"><Clock3 className="h-4 w-4 text-indigo-600" /> {quiz.time}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"><Trophy className="h-4 w-4 text-amber-500" /> Best {best}%</span>
          </div>
        </div>
        <div className="relative">
          {!S.isLoggedIn ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 blur-[3px]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-700">Quiz preview</p><h3 className="mt-4 text-3xl font-semibold tracking-tight">{quiz.questions[0]?.prompt}</h3>
                <div className="mt-6 grid gap-3">{quiz.questions[0]?.options.map(o => <div key={o} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 font-medium text-slate-700">{o}</div>)}</div>
              </div>
              <Gate t="Start your learning" d="Sign up to attempt quizzes, save scores, and appear in the leaderboard." compact />
              <button onClick={() => nav("/auth")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400">Unlock quiz <ArrowRight className="h-5 w-5" /></button>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-700">Interactive quiz</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Question flow</h2></div><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{done ? "Completed" : `${step + 1}/${quiz.questions.length}`}</span></div>
              <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${done ? 100 : ((step + 1) / quiz.questions.length) * 100}%` }} /></div>
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div key="r" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Trophy className="h-8 w-8" /></div>
                    <h3 className="mt-6 text-4xl font-semibold tracking-tight">{Math.round((score / quiz.questions.length) * 100)}%</h3>
                    <p className="mt-4 max-w-xl leading-7 text-slate-600">Your best score has been saved to the dashboard and leaderboard.</p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">Try again <CirclePlay className="h-5 w-5" /></button>
                      <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:border-slate-500">Dashboard <ArrowRight className="h-5 w-5" /></Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={q.prompt} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                    <h3 className="text-3xl font-semibold tracking-tight text-slate-950">{q.prompt}</h3>
                    <div className="mt-7 grid gap-3">{q.options.map(o => { const a = sel === o; return <button key={o} onClick={() => setSel(o)} className={`rounded-2xl border px-5 py-4 text-left font-medium transition ${a ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-white"}`}><div className="flex items-center justify-between gap-3"><span>{o}</span><ChevronRight className="h-5 w-5" /></div></button>; })}</div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button onClick={() => setNote(n => !n)} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:border-slate-500">{note ? "Hide explanation" : "Show explanation"} <BookOpen className="h-5 w-5" /></button>
                      <button onClick={next} disabled={!sel} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">{step === quiz.questions.length - 1 ? "Finish" : "Next"} <ArrowRight className="h-5 w-5" /></button>
                    </div>
                    {note && <div className="mt-6 rounded-3xl border border-indigo-100 bg-indigo-50 p-5 text-slate-700"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700">Concept note</p><p className="mt-3 leading-7">{q.note}</p></div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════ */
function DashboardPage({ S }: { S: AppState }) {
  const enrolled = courses.filter(c => S.enrolledCourses.includes(c.slug));
  const rec = courses.find(c => !S.enrolledCourses.includes(c.slug)) ?? courses[0];
  const quizEntries = quizzes.map(q => ({ title: q.title, slug: q.slug, score: S.quizBestScores[q.slug] ?? 0 }));
  const bookmarkedCourses = courses.filter(c => S.bookmarks.includes(c.slug));
  const totalProgress = S.enrolledCourses.length ? Math.round(Object.values(S.courseProgress).reduce((a, b) => a + b, 0) / S.enrolledCourses.length) : 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
      <Heading e="Learner dashboard" t={S.user ? `Welcome back, ${S.user.name}.` : "Dashboard preview for guests."} d={S.user ? `You're on the ${S.user.track} track. Keep pushing forward.` : "Sign in to unlock your personalized dashboard."} />

      {!S.isLoggedIn ? (
        <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 blur-[3px] lg:grid-cols-2">
            <div className="grid gap-6 sm:grid-cols-2"><StatCard v="3" l="Enrolled courses" /><StatCard v="86%" l="Best quiz score" /><StatCard v="5" l="Streak days" /><StatCard v="12" l="Bookmarks" /></div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Next action</p><h3 className="mt-3 text-3xl font-semibold tracking-tight">Continue React UI Challenge</h3><p className="mt-4 leading-7 text-slate-600">Your dashboard helps you return to unfinished lessons, quizzes, and community activity.</p></div>
          </div>
          <Gate t="Start your learning" d="Sign up to save progress, access the dashboard, and manage your learning journey." />
        </div>
      ) : (
        <div className="mt-12 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard v={`${S.enrolledCourses.length}`} l="Enrolled" a="text-emerald-700" />
            <StatCard v={`${Math.max(0, ...Object.values(S.quizBestScores), 0)}%`} l="Best quiz" a="text-indigo-700" />
            <StatCard v={`${Object.values(S.courseProgress).filter(v => v >= 100).length}`} l="Completed" a="text-amber-600" />
            <StatCard v={`🔥 ${S.streak}`} l="Streak" a="text-orange-600" />
            <StatCard v={`${totalProgress}%`} l="Avg progress" a="text-slate-950" />
          </div>

          {/* daily goals */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Daily goals</p><h3 className="mt-2 text-2xl font-semibold tracking-tight">Keep momentum going</h3></div><Flame className="h-8 w-8 text-orange-500" /></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[{ done: S.enrolledCourses.length > 0, text: "Enroll in a course", link: "/courses" }, { done: Object.keys(S.quizBestScores).length > 0, text: "Complete a quiz", link: "/quizzes" }, { done: S.forumPosts.some(p => p.author === S.user?.name), text: "Post in community", link: "/community" }].map(g => (
                <Link key={g.text} to={g.link} className={`flex items-center gap-3 rounded-2xl border p-4 transition hover:shadow-sm ${g.done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                  <CheckCircle2 className={`h-5 w-5 ${g.done ? "text-emerald-600" : "text-slate-300"}`} /><span className={`font-medium ${g.done ? "text-emerald-700 line-through" : "text-slate-700"}`}>{g.text}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Your courses</p><h3 className="mt-2 text-3xl font-semibold tracking-tight">Continue learning</h3></div><Link to="/courses" className="text-sm font-semibold text-slate-600 hover:text-slate-950">Browse more →</Link></div>
              <div className="mt-8 space-y-4">
                {(enrolled.length ? enrolled : [rec]).map(c => (
                  <div key={c.slug} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div><h4 className="text-xl font-semibold tracking-tight">{c.title}</h4><p className="mt-2 text-slate-600">{c.shortDescription}</p></div>
                      <Link to={`/courses/${c.slug}`} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800">Open <ArrowRight className="h-5 w-5" /></Link>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${S.courseProgress[c.slug] ?? 8}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Quiz performance</p><h3 className="mt-2 text-3xl font-semibold tracking-tight">Best scores</h3>
              <div className="mt-8 space-y-4">{quizEntries.map(e => <div key={e.title} className="flex items-center justify-between gap-4 border-t border-white/10 pt-4"><div><p className="font-semibold">{e.title}</p><Link to={`/quizzes/${e.slug}`} className="text-sm text-slate-400 hover:text-emerald-300">Retake →</Link></div><span className="text-2xl font-semibold text-emerald-300">{e.score}%</span></div>)}</div>
            </div>
          </div>

          {/* bookmarks + bookings */}
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">Bookmarked courses</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{bookmarkedCourses.length ? "Saved for later" : "No bookmarks yet"}</h3>
              <div className="mt-6 space-y-3">{bookmarkedCourses.map(c => <Link key={c.slug} to={`/courses/${c.slug}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-emerald-300"><span className="font-medium text-slate-700">{c.title}</span><ArrowRight className="h-4 w-4 text-slate-400" /></Link>)}</div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-700">Mentor sessions</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{S.bookings.length ? "Upcoming bookings" : "No sessions booked"}</h3>
              <div className="mt-6 space-y-3">{S.bookings.slice(0, 4).map((b, i) => <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"><div><p className="font-medium text-slate-700">{b.mentorName}</p><p className="text-sm text-slate-500">{b.topic} · {b.date}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{b.status}</span></div>)}</div>
              {!S.bookings.length && <Link to="/mentors" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-600">Book your first session <ArrowRight className="h-4 w-4" /></Link>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ══════════════════════════════════════
   COMMUNITY (with replies + likes)
   ══════════════════════════════════════ */
function CommunityPage({ S }: { S: AppState }) {
  const nav = useNavigate();
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [tag, setTag] = useState("General"); const [editId, setEditId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null); const [replyBody, setReplyBody] = useState("");
  const [filterTag, setFilterTag] = useState("All");

  const submit = () => { const t = title.trim(), b = body.trim(); if (!t || !b) return; if (!S.isLoggedIn) { nav("/auth"); return; } if (editId) { S.updatePost(editId, t, b, tag); setEditId(null); } else { S.createPost(t, b, tag); } setTitle(""); setBody(""); setTag("General"); };
  const edit = (p: ForumPost) => { if (!S.isLoggedIn) { nav("/auth"); return; } setTitle(p.title); setBody(p.body); setTag(p.tag); setEditId(p.id); };
  const submitReply = (postId: number) => { if (!replyBody.trim() || !S.isLoggedIn) return; S.addReply(postId, replyBody.trim()); setReplyBody(""); setReplyTo(null); };

  const filteredPosts = S.forumPosts.filter(p => filterTag === "All" || p.tag === filterTag);

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
      <Heading e="Community forum" t="A usable discussion space with create, update, delete, replies, and likes." d="Guests can read discussions. Signed-in learners can post, edit, delete, reply, and like threads." />

      <div className="mt-6 flex flex-wrap gap-2">{["All", ...forumTags].map(t => <button key={t} onClick={() => setFilterTag(t)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filterTag === t ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{t}</button>)}</div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className={!S.isLoggedIn ? "blur-[2px]" : ""}>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Composer</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{editId ? "Edit thread" : "Start a discussion"}</h3>
            <div className="mt-6 space-y-5">
              <div><label className="text-sm font-semibold text-slate-700">Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ask about routes, MongoDB, UI, or architecture" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white" /></div>
              <div><label className="text-sm font-semibold text-slate-700">Tag</label><select value={tag} onChange={e => setTag(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white">{forumTags.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="text-sm font-semibold text-slate-700">Details</label><textarea rows={6} value={body} onChange={e => setBody(e.target.value)} placeholder="Share your question with enough detail for meaningful help." className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white" /></div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={submit} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">{editId ? "Save changes" : "Publish"} <Pencil className="h-5 w-5" /></button>
                {editId && <button onClick={() => { setEditId(null); setTitle(""); setBody(""); setTag("General"); }} className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:border-slate-500">Cancel</button>}
              </div>
            </div>
          </div>
          {!S.isLoggedIn && <Gate t="Start your learning" d="Join to ask questions, publish threads, and participate." />}
        </div>

        <div className="space-y-5">
          <AnimatePresence initial={false}>
            {filteredPosts.map(post => (
              <motion.article layout key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="font-semibold text-slate-900">{post.author}</span><span>{post.role}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{post.tag}</span>
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{post.title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{post.body}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <button onClick={() => S.isLoggedIn ? S.likePost(post.id) : nav("/auth")} className={`flex items-center gap-1 transition ${post.liked ? "text-red-500" : "hover:text-red-400"}`}><Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} /> {post.likes}</button>
                      <button onClick={() => setReplyTo(replyTo === post.id ? null : post.id)} className="flex items-center gap-1 hover:text-emerald-600"><Reply className="h-4 w-4" /> {post.replies.length} replies</button>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => edit(post)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-700"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => S.isLoggedIn ? S.deletePost(post.id) : nav("/auth")} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                {/* replies */}
                {(replyTo === post.id || post.replies.length > 0) && (
                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                    {post.replies.map(r => <div key={r.id} className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-sm"><span className="font-semibold text-slate-900">{r.author}</span></p><p className="mt-1 text-sm leading-6 text-slate-600">{r.body}</p></div>)}
                    {replyTo === post.id && S.isLoggedIn && (
                      <div className="flex gap-3">
                        <input value={replyBody} onChange={e => setReplyBody(e.target.value)} placeholder="Write a reply…" className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white" onKeyDown={e => e.key === "Enter" && submitReply(post.id)} />
                        <button onClick={() => submitReply(post.id)} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Reply</button>
                      </div>
                    )}
                  </div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════
   MENTORS PAGE (with booking)
   ══════════════════════════════════════ */
function MentorsPage({ S }: { S: AppState }) {
  const nav = useNavigate();
  const [bookingMentor, setBookingMentor] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState(""); const [bookingTopic, setBookingTopic] = useState("");
  const mentor = mentors.find(m => m.name === bookingMentor);

  const confirmBooking = () => {
    if (!S.isLoggedIn) { nav("/auth"); return; }
    if (!bookingSlot || !bookingTopic.trim()) return;
    S.addBooking({ mentorName: bookingMentor!, date: bookingSlot, topic: bookingTopic.trim(), status: "Confirmed" });
    setBookingMentor(null); setBookingSlot(""); setBookingTopic("");
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
      <Heading e="Meet your mentors" t="Book 1-on-1 consultancy sessions with industry experts." d="Each mentor leads courses and offers private sessions for code reviews, architecture advice, career coaching, and interview prep." />

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        {mentors.map(m => (
          <div key={m.name} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-5">
              <img src={m.photo} alt={m.name} className="h-20 w-20 rounded-3xl object-cover shadow-lg" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">{m.role}</p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{m.name}</h3>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500"><span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {m.sessions} sessions</span><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {m.rating}</span></div>
              </div>
            </div>
            <p className="mt-5 leading-7 text-slate-600">{m.bio}</p>
            <p className="mt-4 text-sm font-semibold text-slate-950">Specialty: <span className="font-normal text-slate-600">{m.specialty}</span></p>
            <div className="mt-5 flex flex-wrap gap-2">{m.available.map(s => <span key={s} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{s}</span>)}</div>
            <button onClick={() => S.isLoggedIn ? setBookingMentor(m.name) : nav("/auth")} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">{S.isLoggedIn ? "Book a session" : "Start your learning"} <ArrowUpRight className="h-5 w-5" /></button>
          </div>
        ))}
      </div>

      {/* booking modal */}
      <AnimatePresence>
        {bookingMentor && mentor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-5" onClick={() => setBookingMentor(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl">
              <div className="flex items-center justify-between"><h3 className="text-2xl font-bold tracking-tight">Book with {mentor.name}</h3><button onClick={() => setBookingMentor(null)}><X className="h-6 w-6 text-slate-400" /></button></div>
              <p className="mt-3 text-slate-600">{mentor.role} · {mentor.specialty}</p>
              <div className="mt-6 space-y-5">
                <div><label className="text-sm font-semibold text-slate-700">Select a time slot</label><select value={bookingSlot} onChange={e => setBookingSlot(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white"><option value="">Choose a slot…</option>{mentor.available.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="text-sm font-semibold text-slate-700">What do you want to discuss?</label><input value={bookingTopic} onChange={e => setBookingTopic(e.target.value)} placeholder="e.g. Code review, career advice, project architecture" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white" /></div>
                <button onClick={confirmBooking} disabled={!bookingSlot || !bookingTopic.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-300">Confirm booking <CheckCircle2 className="h-5 w-5" /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* consultancy info */}
      <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-10">
          <Headphones className="h-10 w-10 text-emerald-300" />
          <h3 className="mt-6 text-4xl font-bold tracking-tight">1-on-1 teacher consultancy</h3>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Book private sessions for code reviews, project architecture advice, career coaching, and interview prep — directly with the course mentor.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">{[{ icon: Target, label: "Code reviews" }, { icon: Award, label: "Career advice" }, { icon: Zap, label: "Fast feedback" }].map(i => <div key={i.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center"><i.icon className="mx-auto h-5 w-5 text-emerald-300" /><p className="mt-2 text-xs font-semibold text-slate-200">{i.label}</p></div>)}</div>
        </div>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-slate-200 bg-[#f6f1e8] p-7"><Flame className="h-8 w-8 text-orange-500" /><h4 className="mt-5 text-2xl font-bold tracking-tight">Structured guidance</h4><p className="mt-3 leading-7 text-slate-600">Teachers pair each consultancy session with a clear lesson path so you practice immediately after each review.</p></div>
          <div className="rounded-[2rem] border border-slate-200 bg-[#f6f1e8] p-7"><CheckCircle2 className="h-8 w-8 text-emerald-600" /><h4 className="mt-5 text-2xl font-bold tracking-tight">Actionable outcomes</h4><p className="mt-3 leading-7 text-slate-600">Every session ends with a task list: fix one bug, refactor one pattern, attempt one quiz — students leave knowing exactly what to do.</p></div>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════
   PROFILE / SETTINGS
   ══════════════════════════════════════ */
function ProfilePage({ S }: { S: AppState }) {
  const nav = useNavigate();
  const [name, setName] = useState(S.user?.name ?? "");
  const [email, setEmail] = useState(S.user?.email ?? "");
  const [bio, setBio] = useState(S.user?.bio ?? "");
  const [track, setTrack] = useState(S.user?.track ?? "Full Stack");
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (S.user) { setName(S.user.name); setEmail(S.user.email); setBio(S.user.bio); setTrack(S.user.track); } }, [S.user]);

  if (!S.isLoggedIn) { return <main className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8"><div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm"><Lock className="mx-auto h-10 w-10 text-slate-400" /><h2 className="mt-6 text-3xl font-bold tracking-tight">Sign in to view your profile</h2><p className="mt-4 text-slate-600">Create an account to access your profile, update settings, and manage your learning preferences.</p><Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400">Start your learning <ArrowRight className="h-5 w-5" /></Link></div></main>; }

  const save = () => { S.updateProfile({ name: name.trim() || "Learner", email: email.trim(), bio: bio.trim(), track }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-20">
      <div className="flex items-center gap-4">
         <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700">{S.user?.name[0].toUpperCase()}</div>
        <div><h1 className="text-4xl font-bold tracking-tight">{S.user?.name}</h1><p className="mt-1 text-slate-500">{S.user?.email} · Joined {S.user?.joined}</p></div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3"><Settings className="h-5 w-5 text-slate-500" /><h2 className="text-2xl font-bold tracking-tight">Profile settings</h2></div>
          <div className="mt-6 space-y-5">
            <div><label className="text-sm font-semibold text-slate-700">Name</label><input value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white" /></div>
            <div><label className="text-sm font-semibold text-slate-700">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white" /></div>
            <div><label className="text-sm font-semibold text-slate-700">Bio</label><textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell other learners about yourself…" className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white" /></div>
            <div><label className="text-sm font-semibold text-slate-700">Track</label><select value={track} onChange={e => setTrack(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white"><option>Full Stack</option><option>Frontend</option><option>Backend</option><option>Database</option></select></div>
            <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400">{saved ? "✓ Saved!" : "Save changes"} <CheckCircle2 className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Learning stats</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <StatCard v={`${S.enrolledCourses.length}`} l="Enrolled" a="text-emerald-700" />
              <StatCard v={`🔥 ${S.streak}`} l="Streak" a="text-orange-600" />
              <StatCard v={`${S.bookmarks.length}`} l="Bookmarks" a="text-amber-600" />
              <StatCard v={`${S.bookings.length}`} l="Sessions" a="text-indigo-700" />
            </div>
          </div>
          <div className="rounded-[2rem] border border-red-100 bg-red-50 p-6">
            <h3 className="font-semibold text-red-800">Danger zone</h3>
            <p className="mt-2 text-sm text-red-600">Logging out will keep your data saved in this browser.</p>
            <button onClick={() => { S.logout(); nav("/"); }} className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════
   AUTH
   ══════════════════════════════════════ */
function AuthPage({ S }: { S: AppState }) {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [track, setTrack] = useState("Full Stack");

  const submit = () => {
    const safeName = (name.trim() || email.split("@")[0] || "Learner").replace(/\s+/g, " ");
    const safeEmail = email.trim() || `${safeName.toLowerCase().replace(/\s+/g, "-")}@learnify.dev`;
    S.signup({ name: safeName, email: safeEmail, track, bio: "", joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }) });
    nav("/dashboard");
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700"><Sparkles className="h-4 w-4" /> Learner access</p>
        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">{mode === "signup" ? "Create your Learnify account" : "Welcome back to Learnify"}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Sign up or log in to unlock courses, dashboard, quiz history, mentor booking, and community features.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3"><StatCard v="Courses" l="Enroll and track" a="text-emerald-700" /><StatCard v="Quizzes" l="Save best scores" a="text-indigo-700" /><StatCard v="Mentors" l="Book sessions" a="text-slate-950" /></div>
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <div className="mb-8 flex gap-3 rounded-full bg-slate-100 p-1"><button onClick={() => setMode("signup")} className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${mode === "signup" ? "bg-slate-950 text-white" : "text-slate-600"}`}>Sign up</button><button onClick={() => setMode("login")} className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${mode === "login" ? "bg-slate-950 text-white" : "text-slate-600"}`}>Login</button></div>
        <div className="space-y-5">
          <div><label className="text-sm font-semibold text-slate-700">Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder={mode === "signup" ? "Your full name" : "Use any learner name"} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white" /></div>
          <div><label className="text-sm font-semibold text-slate-700">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white" /></div>
          <div><label className="text-sm font-semibold text-slate-700">Focus track</label><select value={track} onChange={e => setTrack(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white"><option>Full Stack</option><option>Frontend</option><option>Backend</option><option>Database</option></select></div>
          <button onClick={submit} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 font-semibold text-white transition hover:bg-emerald-400">{mode === "signup" ? "Create account" : "Login now"} <ArrowRight className="h-5 w-5" /></button>
          <p className="text-sm leading-6 text-slate-500">This demo stores learner state in your browser so the website behaves like a usable product with persistent progress.</p>
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════
   SHARED COMPONENTS
   ══════════════════════════════════════ */
function NotFoundPage() { return <NotFound type="page" />; }
function NotFound({ type }: { type: string }) { return <main className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8"><div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm sm:p-14"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Not found</p><h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em]">We couldn't find that {type}.</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Try the navigation above to open a valid page.</p><Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-slate-800">Back home <ArrowRight className="h-5 w-5" /></Link></div></main>; }

function Heading({ e, t, d }: { e: string; t: string; d: string }) { return <div className="max-w-3xl"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">{e}</p><h2 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">{t}</h2><p className="mt-5 text-lg leading-8 text-slate-600">{d}</p></div>; }

function Gate({ t, d, compact = false }: { t: string; d: string; compact?: boolean }) { return <div className={`absolute inset-0 z-10 flex items-center justify-center ${compact ? "bg-white/50" : "bg-white/70"}`}><div className="mx-4 max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/80"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Lock className="h-6 w-6" /></div><h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{t}</h3><p className="mt-3 leading-7 text-slate-600">{d}</p><Link to="/auth" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400">Start your learning <ArrowRight className="h-5 w-5" /></Link></div></div>; }

function PageCard({ to, title, text, icon: Ic }: { to: string; title: string; text: string; icon: LucideIcon }) { return <Link to={to} className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><Ic className="h-5 w-5" /></div><h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p><div className="mt-6 inline-flex items-center gap-2 font-semibold text-slate-950">Open page <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div></Link>; }

function MentorCard({ m, i, S }: { m: typeof mentors[0]; i: number; S: AppState }) {
  return (
    <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: i * 0.07 }} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f6f1e8] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[3/3.2] overflow-hidden"><img src={m.photo} alt={m.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">{m.role}</p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{m.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{m.specialty}</p>
        <div className="mt-5 flex items-center gap-4 border-t border-slate-200 pt-5 text-xs text-slate-500"><span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {m.sessions} sessions</span><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {m.rating}</span></div>
        <Link to="/mentors" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">{S.isLoggedIn ? "Book session" : "Start your learning"} <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </motion.div>
  );
}

function CourseCard({ course, index, progress, bookmarked, onBookmark }: { course: Course; index: number; progress: number; bookmarked: boolean; onBookmark: () => void }) {
  const Ic = course.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.45, delay: index * 0.05 }}>
      <div className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/courses/${course.slug}`} className="flex-1">
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${course.accent} text-white shadow-lg`}><Ic className="h-6 w-6" /></div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">{course.category} · {course.level}</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{course.title}</h3>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">{course.shortDescription}</p>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={e => { e.preventDefault(); onBookmark(); }} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition hover:border-emerald-400">{bookmarked ? <BookmarkCheck className="h-5 w-5 text-emerald-600" /> : <Bookmark className="h-5 w-5 text-slate-400" />}</button>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{course.duration}</span>
          </div>
        </div>
        <Link to={`/courses/${course.slug}`}>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-500"><span>{course.students}</span><span>•</span><span>{course.lessons.length} lessons</span><span>•</span><span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-current text-amber-500" /> {course.rating.toFixed(1)}</span></div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></div>
          <div className="mt-6 inline-flex items-center gap-2 font-semibold text-slate-950">Open course <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
        </Link>
      </div>
    </motion.div>
  );
}

function QuizCard({ quiz, index, bestScore }: { quiz: Quiz; index: number; bestScore: number }) {
  const Ic = quiz.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.45, delay: index * 0.05 }}>
      <Link to={`/quizzes/${quiz.slug}`} className="group block rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div><div className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${quiz.color} text-white shadow-lg`}><Ic className="h-6 w-6" /></div><p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-indigo-700">{quiz.category} · {quiz.difficulty}</p><h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{quiz.title}</h3><p className="mt-4 max-w-2xl leading-7 text-slate-600">{quiz.description}</p></div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{quiz.time}</span>
        </div>
        <div className="mt-8 flex items-center justify-between gap-3 rounded-3xl bg-slate-50 px-5 py-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Best score</p><p className="mt-1 text-2xl font-semibold text-slate-950">{bestScore}%</p></div><ArrowRight className="h-5 w-5 text-slate-700 transition group-hover:translate-x-1" /></div>
      </Link>
    </motion.div>
  );
}

function LBoard({ user, scores }: { user: User | null; scores: Record<string, number> }) {
  const avg = Object.values(scores).length ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length) : 0;
  const leaders = useMemo(() => { const l = [...baseLeaderboard]; if (user && avg > 0) l.push({ name: user.name, score: avg, note: `${user.track} learner` }); return l.sort((a, b) => b.score - a.score).slice(0, 5); }, [avg, user]);
  return (
    <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-950/20">
      <div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Leaderboard</p><h3 className="mt-2 text-3xl font-semibold tracking-tight">Top learners</h3></div><Trophy className="h-8 w-8 text-amber-300" /></div>
      <div className="mt-8 space-y-4">{leaders.map((l, i) => <div key={l.name} className="flex items-center gap-4 border-t border-white/10 pt-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-emerald-300">{i + 1}</span><div className="min-w-0 flex-1"><p className="font-semibold">{l.name}</p><p className="text-sm text-slate-400">{l.note}</p></div><span className="text-2xl font-semibold">{l.score}</span></div>)}</div>
    </div>
  );
}

function MetaCard({ v, l }: { v: string; l: string }) { return <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{l}</p><p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{v}</p></div>; }
function StatCard({ v, l, a = "text-slate-950" }: { v: string; l: string; a?: string }) { return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"><p className={`text-3xl font-semibold tracking-tight ${a}`}>{v}</p><p className="mt-2 text-sm text-slate-500">{l}</p></div>; }
function BottomCTA({ S }: { S: AppState }) { return <div className="mt-14 rounded-[2rem] bg-slate-950 p-8 text-white"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Need access?</p><h3 className="mt-2 text-3xl font-semibold tracking-tight">Create an account to unlock the full learning flow.</h3><p className="mt-3 max-w-2xl text-slate-300">Signed-in learners can enroll, save progress, book mentors, and join the community.</p></div><Link to={S.isLoggedIn ? "/dashboard" : "/auth"} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-100">{S.isLoggedIn ? "Open dashboard" : "Start your learning"} <ArrowRight className="h-5 w-5" /></Link></div></div>; }

export default App;
