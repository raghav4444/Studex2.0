import React, { useMemo, useState } from 'react';
import { Search, Upload, Download, BookOpen, Filter, Heart, Eye, Sparkles, TrendingUp, Clock3, FileText, BadgeInfo, ArrowRight, Layers3, X } from 'lucide-react';
import { Note } from '../../types';

const NotesLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [notes] = useState<Note[]>([
    {
      id: '1',
      userId: '1',
      title: 'Data Structures and Algorithms - Complete Notes',
      subject: 'Computer Science',
      semester: 'Semester 3',
      fileUrl: '#',
      fileName: 'DSA_Complete_Notes.pdf',
      fileSize: 2048576,
      downloads: 45,
      likes: 18,
      tags: ['DSA', 'Algorithms', 'Interview Prep'],
      uploadedBy: {
        id: '1',
        name: 'Sarah Chen',
        username: 'sarahchen',
        email: 'sarah@mit.edu',
        college: 'MIT',
        branch: 'Computer Science',
        year: 3,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      userId: '2',
      title: 'Thermodynamics Lecture Notes with Examples',
      subject: 'Mechanical Engineering',
      semester: 'Semester 4',
      fileUrl: '#',
      fileName: 'Thermodynamics_Notes.pdf',
      fileSize: 1536000,
      downloads: 23,
      likes: 11,
      tags: ['Thermodynamics', 'ME', 'Formulas'],
      uploadedBy: {
        id: '2',
        name: 'Mike Johnson',
        username: 'mikejohnson',
        email: 'mike@stanford.edu',
        college: 'Stanford University',
        branch: 'Mechanical Engineering',
        year: 4,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      userId: '3',
      title: 'Quantum Mechanics Problem Sets and Solutions',
      subject: 'Physics',
      semester: 'Semester 6',
      fileUrl: '#',
      fileName: 'Quantum_Mechanics_Problems.pdf',
      fileSize: 3072000,
      downloads: 67,
      likes: 29,
      tags: ['Quantum Mechanics', 'Physics', 'Problems'],
      uploadedBy: {
        id: '3',
        name: 'Alex Rodriguez',
        username: 'alexrodriguez',
        email: 'alex@caltech.edu',
        college: 'Caltech',
        branch: 'Physics',
        year: 4,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const subjects = ['all', 'Computer Science', 'Mechanical Engineering', 'Physics', 'Mathematics'];
  const semesters = ['all', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    const matchesSemester = selectedSemester === 'all' || note.semester === selectedSemester;
    
    return matchesSearch && matchesSubject && matchesSemester;
  });

  const noteStats = useMemo(() => {
    const totalDownloads = notes.reduce((sum, note) => sum + note.downloads, 0);
    const totalLikes = notes.reduce((sum, note) => sum + (note.likes || 0), 0);
    const latestNote = [...notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return {
      totalNotes: notes.length,
      totalDownloads,
      totalLikes,
      latestNote,
    };
  }, [notes]);

  const subjectChips = useMemo(() => (
    subjects.filter(subject => subject !== 'all').map(subject => ({
      label: subject,
      count: notes.filter(note => note.subject === subject).length,
    }))
  ), [notes]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b1020] via-[#0d1117] to-[#161b22] shadow-[0_24px_80px_rgba(0,0,0,0.45)] mb-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_28%)]" />
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-20 left-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative grid gap-5 p-4 sm:p-6 md:p-8 xl:grid-cols-[1.4fr_0.9fr] xl:gap-8">
          <div className="space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-200 sm:px-4 sm:py-2 sm:text-sm">
              <Sparkles className="h-4 w-4" />
              Notes Library
            </div>

            <div className="space-y-3 sm:space-y-4 flex-wrap">
              <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-5xl sm:leading-tight">
                Find the notes that actually help you study faster.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-gray-300 sm:text-lg sm:leading-7">
                Browse curated study materials, jump between subjects, and grab high-signal notes without digging through clutter.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur sm:p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Notes</p>
                <p className="mt-2 text-2xl font-semibold text-white leading-none">{noteStats.totalNotes}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur sm:p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Downloads</p>
                <p className="mt-2 text-2xl font-semibold text-white leading-none">{noteStats.totalDownloads}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur sm:p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Likes</p>
                <p className="mt-2 text-2xl font-semibold text-white leading-none">{noteStats.totalLikes}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur sm:col-span-1 sm:p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Newest</p>
                <p className="mt-2 text-sm font-semibold leading-5 text-white line-clamp-2 break-words">
                  {noteStats.latestNote?.title}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-blue-100 sm:w-auto"
              >
                <Upload className="h-4 w-4" />
                Upload Notes
              </button>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-white/25 hover:bg-white/10 sm:w-auto">
                <Layers3 className="h-4 w-4" />
                Browse Collections
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {subjects.slice(1).map((subject) => {
                const count = notes.filter(note => note.subject === subject).length;
                const active = selectedSubject === subject;

                return (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(active ? 'all' : subject)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-all ${active ? 'border-blue-400/40 bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'}`}
                  >
                    {subject}
                    <span className="ml-2 rounded-full bg-black/15 px-2 py-0.5 text-xs">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden gap-4 xl:grid">
            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400 sm:text-sm sm:normal-case sm:tracking-normal">Featured collection</p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Top study picks</h2>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 sm:h-12 sm:w-12">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-4 space-y-3 sm:mt-5">
                {notes.slice(0, 3).map((note, index) => (
                  <div key={note.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3 sm:p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 text-blue-300 sm:h-11 sm:w-11">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white sm:text-sm">{note.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400 sm:text-xs">
                        <span>{note.subject}</span>
                        <span>•</span>
                        <span>{note.downloads} downloads</span>
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <BadgeInfo className="h-4 w-4 text-blue-300" />
                Quick filters
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {subjectChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => setSelectedSubject(chip.label)}
                    className={`rounded-full px-3 py-2 text-sm transition-colors ${selectedSubject === chip.label ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`}
                  >
                    {chip.label} <span className="ml-1 text-xs opacity-70">{chip.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#161b22] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Upload Notes</p>
                <h3 className="mt-1 text-2xl font-semibold text-white">Coming next</h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm leading-6 text-gray-300">
              The upload workflow is not wired to storage yet, so this UI now keeps the action visible without leaving the button dead.
            </div>

            <button
              onClick={() => setIsUploadOpen(false)}
              className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-[#161b22]/90 p-4 shadow-xl backdrop-blur sm:mb-8 sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.9fr_0.9fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes, subjects, or topics..."
              className="w-full rounded-2xl border border-white/10 bg-[#0d1117] pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 sm:py-3.5"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-12 pr-4 text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 sm:py-3.5"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <BookOpen className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-12 pr-4 text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 sm:py-3.5"
            >
              {semesters.map(semester => (
                <option key={semester} value={semester}>
                  {semester === 'all' ? 'All Semesters' : semester}
                </option>
              ))}
            </select>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10 sm:py-3.5">
            <Clock3 className="h-4 w-4" />
            Recent
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 sm:gap-6">
          {filteredNotes.map((note) => (
            <article
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#161b22] p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10 sm:rounded-[1.75rem] sm:p-6"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 text-blue-300 ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300 sm:px-3 sm:text-xs">
                    {note.subject}
                  </span>
                  <span className="text-xs text-gray-500">{note.semester}</span>
                </div>
              </div>

              <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-white sm:mb-3 sm:text-xl">
                {note.title}
              </h3>

              <p className="mb-4 line-clamp-2 text-sm leading-6 text-gray-400 sm:mb-5 sm:line-clamp-none">
                Carefully organized note set ready for review, revision, and quick downloads.
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                {note.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 text-sm sm:mb-5 sm:gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Uploaded by</p>
                  <p className="mt-2 truncate text-sm font-medium text-white">{note.uploadedBy.name}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Size</p>
                  <p className="mt-2 text-sm font-medium text-white">{formatFileSize(note.fileSize)}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Downloads</p>
                  <p className="mt-2 text-sm font-medium text-white">{note.downloads}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Likes</p>
                  <p className="mt-2 text-sm font-medium text-white">{note.likes || 0}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-blue-100">
                  <Download className="h-4 w-4" />
                  Download
                </button>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-200 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white">
                    <Heart className="h-4 w-4" />
                    Like
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedNote(note);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-200 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-white/10 bg-[#161b22] px-5 py-14 text-center shadow-lg sm:px-8 sm:py-16">
          <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-3xl bg-white/5 text-gray-400 sm:h-20 sm:w-20">
            <BookOpen className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-semibold text-white sm:text-2xl">No notes found</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
            Try a different search term or clear the filters to bring the library back into view.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSubject('all');
              setSelectedSemester('all');
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
          >
            Reset filters
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1117] shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-[#111827] to-[#161b22] p-5 sm:p-6">
              <button
                onClick={() => setSelectedNote(null)}
                className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/30 p-2 text-white/80 transition-colors hover:bg-black/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-start gap-4 pr-10">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                    {selectedNote.subject}
                  </span>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    {selectedNote.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">
                    {selectedNote.semester} · {selectedNote.fileName}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Size</p>
                  <p className="mt-2 text-sm font-medium text-white">{formatFileSize(selectedNote.fileSize)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Downloads</p>
                  <p className="mt-2 text-sm font-medium text-white">{selectedNote.downloads}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Likes</p>
                  <p className="mt-2 text-sm font-medium text-white">{selectedNote.likes || 0}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Uploader</p>
                  <p className="mt-2 truncate text-sm font-medium text-white">{selectedNote.uploadedBy.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedNote.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                    #{tag}
                  </span>
                ))}
              </div>

              <p className="text-sm leading-6 text-gray-300">
                This note preview is optimized for quick mobile browsing. Tap download to get the file or use the preview details to decide whether it matches your study session.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
                  <Download className="h-4 w-4" />
                  Download Note
                </button>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesLibrary;