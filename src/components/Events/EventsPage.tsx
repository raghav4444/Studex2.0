import React, { useState, useMemo, useCallback } from "react";
import {
  Calendar, MapPin, Users, Plus, Search, Filter, TrendingUp, Star, Clock,
  Heart, Bookmark, Share2, Globe, Sparkles, Trophy,
  AlertCircle, Tag, ArrowUpRight
} from "lucide-react";
import { Event, EventCategory } from "../../types";
import { useEvents } from "../../hooks/useEvents";
import CreateEventModal from "./CreateEventModal";
import EventDetailModal from "./EventDetailModal";

const categoryLabels: Record<string, string> = {
  hackathon: "Hackathon", workshop: "Workshop", conference: "Conference",
  competition: "Competition", webinar: "Webinar", meetup: "Meetup",
  cultural: "Cultural", sports: "Sports", fest: "Fest", seminar: "Seminar",
};

const categoryColors: Record<string, string> = {
  hackathon: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  workshop: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  conference: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  competition: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  webinar: "bg-green-500/20 text-green-300 border-green-500/30",
  meetup: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  cultural: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  sports: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  fest: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  seminar: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
};

const categoryIconGradients: Record<string, string> = {
  hackathon: "from-purple-500/20 to-pink-500/10",
  workshop: "from-blue-500/20 to-cyan-400/10",
  conference: "from-cyan-500/20 to-teal-400/10",
  competition: "from-orange-500/20 to-amber-400/10",
  webinar: "from-green-500/20 to-emerald-400/10",
  meetup: "from-pink-500/20 to-rose-400/10",
  cultural: "from-rose-500/20 to-orange-400/10",
  sports: "from-amber-500/20 to-yellow-400/10",
  fest: "from-violet-500/20 to-purple-400/10",
  seminar: "from-indigo-500/20 to-blue-400/10",
};

const difficultyColors: Record<string, string> = {
  beginner: "text-emerald-400",
  intermediate: "text-amber-400",
  advanced: "text-red-400",
};

const difficultyBg: Record<string, string> = {
  beginner: "bg-emerald-500/10 border-emerald-500/20",
  intermediate: "bg-amber-500/10 border-amber-500/20",
  advanced: "bg-red-500/10 border-red-500/20",
};

const EventsPage: React.FC = () => {
  const {
    events, loading, error,
    joinEvent, leaveEvent,
    toggleSave, toggleLike, recordView,
    isUserAttending, isUserOrganizer, refetch,
  } = useEvents();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "my-events">("upcoming");
  const [sortBy, setSortBy] = useState<"date" | "trending" | "popular">("date");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Get fresh event from events array for the detail modal
  const selectedEvent = useMemo(
    () => (selectedEventId ? events.find((e) => e.id === selectedEventId) ?? null : null),
    [events, selectedEventId]
  );

  const categories = Object.keys(categoryLabels);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm.trim() === "" ||
        event.title.toLowerCase().includes(s) ||
        event.description.toLowerCase().includes(s) ||
        event.tags.some((tag) => tag.toLowerCase().includes(s));
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
      let matchesTab = true;
      if (activeTab === "upcoming") matchesTab = event.date > now;
      else if (activeTab === "past") matchesTab = event.date <= now;
      else if (activeTab === "my-events") matchesTab = isUserAttending(event.id) || isUserOrganizer(event.id);
      return matchesSearch && matchesCategory && matchesTab;
    }).sort((a, b) => {
      if (sortBy === "trending") return (b.trendingScore || 0) - (a.trendingScore || 0);
      if (sortBy === "popular") return (b.attendees?.length || 0) - (a.attendees?.length || 0);
      return a.date.getTime() - b.date.getTime();
    });
  }, [events, searchTerm, selectedCategory, activeTab, sortBy, isUserAttending, isUserOrganizer]);

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter((e) => e.date > now).length;
    const totalAttending = events.filter((e) => isUserAttending(e.id)).length;
    const freeEvents = events.filter((e) => !e.fee || e.fee === 0).length;
    return { total: events.length, upcoming, totalAttending, freeEvents };
  }, [events, isUserAttending]);

  const featuredEvents = useMemo(() => events.filter((e) => e.isFeatured).slice(0, 3), [events]);

  const handleJoinEvent = useCallback(async (eventId: string) => {
    try { await joinEvent(eventId); } catch (err) { console.error("Join error:", err); }
  }, [joinEvent]);

  const handleLeaveEvent = useCallback(async (eventId: string) => {
    try { await leaveEvent(eventId); } catch (err) { console.error("Leave error:", err); }
  }, [leaveEvent]);

  const handleShare = useCallback(async (event: Event) => {
    const url = `${window.location.origin}/events/${event.id}`;
    try { if (navigator.share) await navigator.share({ title: event.title, text: event.description, url }); else throw new Error("no share"); }
    catch { await navigator.clipboard.writeText(url); setShareToast("Link copied!"); setTimeout(() => setShareToast(null), 2000); }
  }, []);

  const handleToggleSave = useCallback(async (eventId: string) => {
    try { await toggleSave(eventId); } catch (err) { console.error("Save error:", err); }
  }, [toggleSave]);

  const handleToggleLike = useCallback(async (eventId: string) => {
    try { await toggleLike(eventId); } catch (err) { console.error("Like error:", err); }
  }, [toggleLike]);

  const openEventDetail = useCallback((event: Event) => { setSelectedEventId(event.id); recordView(event.id); }, [recordView]);

  const formatDateShort = (date: Date) => {
    const d = new Date(date);
    return { month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), day: d.getDate() };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1016] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-xl bg-blue-500/20 animate-ping" />
            <div className="relative w-12 h-12 bg-blue-500 rounded-xl animate-pulse" />
          </div>
          <p className="text-gray-400 text-sm">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1016] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error loading events</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={refetch} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1016]">
      {/* Share Toast */}
      <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${ shareToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none" }`}>
        <div className="px-6 py-3 bg-[#161b22] border border-green-500/30 rounded-full text-green-400 text-sm font-medium shadow-xl">{shareToast}</div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* ======== Hero Section ======== */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b1020] via-[#0d1117] to-[#161b22] shadow-[0_24px_80px_rgba(0,0,0,0.45)] mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_28%)]" />
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 left-12 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

          <div className="relative grid gap-6 p-5 sm:p-7 md:p-10 xl:grid-cols-[1.3fr_0.9fr] xl:gap-10">
            {/* Left: Main content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-200 sm:px-4 sm:py-2 sm:text-sm">
                <Sparkles className="h-3.5 w-3.5" /> Campus Events
              </div>

              {/* Title + Description */}
              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-tight">
                  Discover events that<br />fuel your growth.
                </h1>
                <p className="max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                  Find hackathons, workshops, fests, and networking events. Register, form teams, and build your resume.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Total Events", value: stats.total, icon: Calendar },
                  { label: "Upcoming", value: stats.upcoming, icon: ArrowUpRight },
                  { label: "Attending", value: stats.totalAttending, icon: Users },
                  { label: "Free Events", value: stats.freeEvents, icon: Tag },
                ].map((s) => (
                  <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.05] sm:p-5">
                    <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-blue-500/5 blur-xl group-hover:bg-blue-500/8" />
                    <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500">{s.label}</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-bold text-white tabular-nums leading-none">{s.value}</span>
                      <s.icon className="h-4 w-4 text-gray-600 mb-0.5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button onClick={() => setShowCreateEvent(true)} className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-lg hover:shadow-white/10 active:translate-y-0">
                <Plus className="h-4 w-4" /> Create Event
              </button>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedCategory("all")} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${selectedCategory === "all" ? "border-blue-400/40 bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"}`}>
                  All Events
                </button>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory((prev) => (prev === cat ? "all" : (cat as EventCategory)))} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${selectedCategory === cat ? "border-blue-400/40 bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"}`}>
                    {categoryLabels[cat] || cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Featured Events Sidebar (xl only) */}
            <div className="hidden xl:flex xl:flex-col gap-4">
              <div className="flex-1 rounded-[1.75rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">Featured Events</p>
                    <h2 className="mt-1 text-xl font-bold text-white">Top Picks</h2>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                    <Star className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-3">
                  {featuredEvents.length > 0 ? featuredEvents.map((evt, idx) => (
                    <div key={evt.id} onClick={() => { openEventDetail(evt) }} className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3 cursor-pointer transition-all hover:border-white/15 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-blue-900/10">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${categoryIconGradients[evt.category]} text-gray-300`}>
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{evt.title}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                          <span>{categoryLabels[evt.category] || evt.category}</span>
                          <span className="text-gray-600">&bull;</span>
                          <span>{evt.attendees?.length || 0} joined</span>
                        </div>
                      </div>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-semibold text-gray-400">{idx + 1}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-8">No featured events yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======== Search & Filters ======== */}
        <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-[#161b22]/90 p-4 shadow-xl backdrop-blur sm:mb-8 sm:p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full rounded-2xl border border-white/10 bg-[#0d1117] pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 sm:py-3.5"
              />
            </div>
            {/* Category */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as EventCategory | "all")} className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-11 pr-10 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 sm:py-3.5">
                <option value="all">All Categories</option>
                {categories.map((cat) => <option key={cat} value={cat}>{categoryLabels[cat] || cat}</option>)}
              </select>
            </div>
            {/* Time Tab */}
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <select value={activeTab} onChange={(e) => setActiveTab(e.target.value as any)} className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-11 pr-10 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 sm:py-3.5">
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
                <option value="my-events">My Events</option>
              </select>
            </div>
            {/* Sort */}
            <button onClick={() => setSortBy((s) => (s === "date" ? "popular" : s === "popular" ? "trending" : "date"))} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/[0.07] sm:py-3.5">
              <TrendingUp className="h-4 w-4" /> {sortBy === "date" ? "Date" : sortBy === "popular" ? "Popular" : "Trending"}
            </button>
          </div>
        </div>

        {/* ======== Event Cards Grid ======== */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.length > 0 ? filteredEvents.map((event) => {
            const dateInfo = formatDateShort(event.date);
            const isAttending = isUserAttending(event.id);
            const spotsLeft = event.maxAttendees ? event.maxAttendees - (event.attendees?.length || 0) : null;
            return (
              <div key={event.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#161b22]/80 backdrop-blur-xl transition-all hover:border-white/20 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1">
                {/* Cover Image */}
                <div className="relative h-36 overflow-hidden">
                  <img src={event.coverImage || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop`} alt={event.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-[#161b22]/30 to-transparent" />

                  {/* Date Badge */}
                  <div className="absolute top-3 left-3 flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">{dateInfo.month}</span>
                    <span className="text-xl font-bold leading-none text-white">{dateInfo.day}</span>
                  </div>

                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {event.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/80 px-2.5 py-1 text-[10px] font-semibold text-black backdrop-blur-xl">
                        <Star className="h-3 w-3" /> Featured
                      </span>
                    )}
                    {isAttending && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/80 px-2.5 py-1 text-[10px] font-semibold text-black backdrop-blur-xl">
                        Going
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category + Difficulty */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${categoryColors[event.category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                      {categoryLabels[event.category] || event.category}
                    </span>
                    {event.difficulty && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${difficultyBg[event.difficulty]} ${difficultyColors[event.difficulty]}`}>
                        {event.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 onClick={() => openEventDetail(event)} className="mb-1.5 line-clamp-2 text-base font-semibold leading-snug text-white cursor-pointer hover:text-blue-300 transition-colors group-hover:text-blue-200">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-400">{event.description}</p>

                  {/* Meta Info */}
                  <div className="mb-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {event.isOnline ? <Globe className="h-3.5 w-3.5 shrink-0 text-green-400" /> : <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-400" />}
                      <span className="truncate">{event.isOnline ? 'Online Event' : event.location}</span>
                    </div>
                    {event.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{event.attendees?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        <span>{event.likeCount || 0}</span>
                      </div>
                      {spotsLeft !== null && (
                        <span className={`text-[10px] font-medium ${spotsLeft <= 5 ? 'text-red-400' : 'text-gray-500'}`}>
                          {spotsLeft === 0 ? 'Full' : `${spotsLeft} spots left`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {event.fee !== undefined && event.fee > 0 && (
                        <span className="text-xs font-medium text-green-400">₹{event.fee}</span>
                      )}

                      {/* Quick Actions */}
                      <button onClick={() => handleToggleSave(event.id)} className={`p-1.5 rounded-lg transition-colors ${event.isSaved ? 'text-blue-400 bg-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}>
                        <Bookmark className={`h-4 w-4 ${event.isSaved ? 'fill-current' : ''}`} />
                      </button>
                      <button onClick={() => handleToggleLike(event.id)} className={`p-1.5 rounded-lg transition-colors ${event.isLiked ? 'text-red-400 bg-red-500/20' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}>
                        <Heart className={`h-4 w-4 ${event.isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button onClick={() => handleShare(event)} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Click overlay for details */}
                <div onClick={() => openEventDetail(event)} className="absolute inset-0 cursor-pointer" />
              </div>
            );
          }) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="h-16 w-16 text-gray-700 mb-4" />
              <h3 className="mb-2 text-lg font-medium text-gray-400">No events found</h3>
              <p className="mb-6 text-sm text-gray-500">Try adjusting your filters or search term</p>
              <button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setActiveTab("upcoming"); }} className="rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-all">
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Empty State when no results */}
        {filteredEvents.length === 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] mb-4">
              <AlertCircle className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No events found</h3>
            <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search term</p>
            <button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setActiveTab("upcoming"); setSortBy("date"); }} className="rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-all">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ======== Event Detail Modal ======== */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={true}
          onClose={() => setSelectedEventId(null)}
          onJoin={handleJoinEvent}
          onLeave={handleLeaveEvent}
          onToggleSave={handleToggleSave}
          onToggleLike={handleToggleLike}
          onShare={handleShare}
          isUserAttending={isUserAttending(selectedEvent.id)}
          isUserOrganizer={isUserOrganizer(selectedEvent.id)}
        />
      )}

      {/* ======== Create Event Modal ======== */}
      <CreateEventModal isOpen={showCreateEvent} onClose={() => setShowCreateEvent(false)} />
    </div>
  );
};

export default EventsPage;
