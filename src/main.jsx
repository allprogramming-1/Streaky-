import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Check, ChevronLeft, ChevronRight, Flame, MoreHorizontal, Plus, Sparkles, Trash2, X } from 'lucide-react'
import './styles.css'

const STORAGE_KEY = 'streakly-habits'
const COLORS = ['#f3b33e', '#d96b4f', '#9b8bc9', '#639b84', '#4d91a5', '#d983a5']
const ICONS = ['☀️', '💧', '📚', '🏃', '🧘', '✍️', '🌱', '🎸']

const dayKey = (date = new Date()) => date.toISOString().slice(0, 10)
const dateFromKey = (key) => new Date(`${key}T12:00:00`)
const formatDate = (date) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date)
const shortDate = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)

function streaks(completions) {
  const dates = new Set(completions || [])
  let current = 0
  const cursor = new Date()
  while (dates.has(dayKey(cursor))) { current += 1; cursor.setDate(cursor.getDate() - 1) }
  let best = 0, run = 0
  ;[...dates].sort().forEach((key, i, arr) => {
    run = i && (dateFromKey(key) - dateFromKey(arr[i - 1])) / 86400000 === 1 ? run + 1 : 1
    best = Math.max(best, run)
  })
  return { current, best }
}

function App() {
  const [habits, setHabits] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
  })
  const [showModal, setShowModal] = useState(false)
  const [draft, setDraft] = useState({ name: '', icon: '☀️', color: COLORS[0] })
  const [weekOffset, setWeekOffset] = useState(0)
  const today = dayKey()

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)), [habits])

  const completeToday = habits.filter((habit) => habit.completions.includes(today)).length
  const totalToday = habits.length
  const overall = totalToday ? Math.round((completeToday / totalToday) * 100) : 0
  const bestHabit = useMemo(() => habits.map((h) => ({ ...h, ...streaks(h.completions) })).sort((a, b) => b.current - a.current)[0], [habits])

  const toggleHabit = (id) => setHabits((items) => items.map((h) => h.id !== id ? h : {
    ...h, completions: h.completions.includes(today) ? h.completions.filter((d) => d !== today) : [...h.completions, today]
  }))
  const deleteHabit = (id) => setHabits((items) => items.filter((h) => h.id !== id))
  const addHabit = (e) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    setHabits((items) => [...items, { id: crypto.randomUUID(), name: draft.name.trim(), icon: draft.icon, color: draft.color, completions: [] }])
    setDraft({ name: '', icon: '☀️', color: COLORS[0] }); setShowModal(false)
  }

  return <main className="app-shell">
    <header><a className="logo" href="#top"><span className="logo-mark"><Flame size={20} fill="currentColor" /></span> streakly</a><button className="avatar" aria-label="Profile">A</button></header>
    <section className="hero" id="top">
      <div><p className="eyebrow">YOUR DAILY RHYTHM</p><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, Alex.</h1><p className="date">{formatDate(new Date())}</p></div>
      <div className="progress-wrap"><div className="progress-ring" style={{ '--progress': `${overall * 3.6}deg` }}><div><strong>{overall}%</strong><span>complete</span></div></div><p>{completeToday} of {totalToday} habits<br />done today</p></div>
    </section>

    <section className="habit-section"><div className="section-heading"><div><p className="eyebrow">TODAY'S FOCUS</p><h2>Keep the streak alive</h2></div><button className="add-button" onClick={() => setShowModal(true)}><Plus size={18} /> Add habit</button></div>
      {habits.length ? <div className="habit-grid">{habits.map((habit) => { const done = habit.completions.includes(today); const data = streaks(habit.completions); return <article className={`habit-card ${done ? 'done' : ''}`} key={habit.id}>
        <button className="check-button" aria-label={`Mark ${habit.name} ${done ? 'incomplete' : 'complete'}`} onClick={() => toggleHabit(habit.id)} style={{ '--accent': habit.color }}>{done && <Check size={18} strokeWidth={3} />}</button>
        <span className="habit-icon" style={{ background: `${habit.color}22` }}>{habit.icon}</span><div className="habit-copy"><h3>{habit.name}</h3><p><Flame size={14} fill="currentColor" /> {data.current} day {data.current === 1 ? 'streak' : 'streak'}</p></div>
        <button className="delete-button" aria-label={`Delete ${habit.name}`} onClick={() => deleteHabit(habit.id)}><Trash2 size={16} /></button>
      </article>})}</div> : <div className="empty"><Sparkles size={28}/><h3>Your fresh start begins here.</h3><p>Add your first habit and turn small actions into a lasting rhythm.</p><button className="add-button" onClick={() => setShowModal(true)}><Plus size={18} /> Create a habit</button></div>}
    </section>

    <section className="insights"><div className="heatmap-card"><div className="section-heading"><div><p className="eyebrow">CONSISTENCY</p><h2>Your activity</h2></div><div className="week-nav"><button onClick={() => setWeekOffset((n) => n - 1)} aria-label="Earlier weeks"><ChevronLeft size={18}/></button><span>{weekOffset ? `${Math.abs(weekOffset) * 12} weeks ago` : 'Last 12 weeks'}</span><button disabled={!weekOffset} onClick={() => setWeekOffset((n) => n + 1)} aria-label="Later weeks"><ChevronRight size={18}/></button></div></div><Heatmap habits={habits} weekOffset={weekOffset} /><div className="legend"><span>Less</span>{[0, 1, 2, 3, 4].map((x) => <i key={x} className={`level-${x}`}/>) }<span>More</span></div></div>
      <aside className="streak-card"><div className="sparkle"><Flame size={25} fill="currentColor"/></div><p className="eyebrow">LONGEST RUN</p><strong>{bestHabit?.best || 0} days</strong><h3>{bestHabit ? `${bestHabit.icon} ${bestHabit.name}` : 'Start a habit'}</h3><p>{bestHabit?.best ? 'Your personal best. Keep showing up!' : 'Your first streak is waiting for you.'}</p></aside>
    </section>
    <footer>Made for the little things that become everything. <span>✦</span></footer>
    {showModal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowModal(false)}><form className="modal" onSubmit={addHabit} onMouseDown={(e) => e.stopPropagation()}><button className="close" type="button" onClick={() => setShowModal(false)}><X size={20}/></button><p className="eyebrow">NEW HABIT</p><h2>What do you want to make routine?</h2><label>Habit name<input autoFocus value={draft.name} maxLength="50" onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Read for 20 minutes" /></label><span className="label">Pick an icon</span><div className="picker">{ICONS.map((icon) => <button type="button" className={draft.icon === icon ? 'selected' : ''} key={icon} onClick={() => setDraft({ ...draft, icon })}>{icon}</button>)}</div><span className="label">Accent color</span><div className="colors">{COLORS.map((color) => <button type="button" className={draft.color === color ? 'selected' : ''} key={color} style={{ background: color }} onClick={() => setDraft({ ...draft, color })}>{draft.color === color && <Check size={15}/>}</button>)}</div><button className="add-button submit" type="submit"><Plus size={18}/> Add to my habits</button></form></div>}
  </main>
}

function Heatmap({ habits, weekOffset }) {
  const days = []; const end = new Date(); end.setDate(end.getDate() + (weekOffset * 84)); end.setHours(12, 0, 0, 0); end.setDate(end.getDate() - ((end.getDay() + 1) % 7))
  for (let i = 83; i >= 0; i--) { const date = new Date(end); date.setDate(end.getDate() - i); const count = habits.filter((h) => h.completions.includes(dayKey(date))).length; const ratio = habits.length ? count / habits.length : 0; const level = ratio === 0 ? 0 : ratio < .34 ? 1 : ratio < .67 ? 2 : ratio < 1 ? 3 : 4; days.push({ date, count, level }) }
  return <div className="heatmap"><div className="weekdays"><span>Mon</span><span>Wed</span><span>Fri</span></div><div className="weeks">{Array.from({ length: 12 }, (_, week) => <div className="week" key={week}>{days.slice(week * 7, week * 7 + 7).map(({ date, count, level }) => <span title={`${shortDate(date)}: ${count} completed`} className={`heat-cell level-${level}`} key={dayKey(date)}/>)}</div>)}</div></div>
}

createRoot(document.getElementById('root')).render(<App />)
