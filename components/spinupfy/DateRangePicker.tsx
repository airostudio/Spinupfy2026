'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartChange: (date: Date) => void
  onEndChange: (date: Date) => void
  minStartDate?: Date
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function startDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false
  return date > start && date < end
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  minStartDate,
}: DateRangePickerProps) {
  const today = minStartDate || new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  // Auto-advance to "end" selection after picking start
  useEffect(() => {
    if (startDate && !endDate) setSelecting('end')
  }, [startDate, endDate])

  function handleDayClick(date: Date) {
    if (date < today) return

    if (selecting === 'start' || (startDate && date < startDate)) {
      onStartChange(date)
      onEndChange(date) // reset end
      setSelecting('end')
    } else {
      if (startDate && isSameDay(date, startDate)) return
      onEndChange(date)
      setSelecting('start')
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const totalDays = daysInMonth(viewYear, viewMonth)
  const startDay = startDayOfMonth(viewYear, viewMonth)

  const days: (Date | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ]

  // Pad to full grid
  while (days.length % 7 !== 0) days.push(null)

  function getDayState(date: Date | null) {
    if (!date) return 'empty'
    const d = new Date(date); d.setHours(0, 0, 0, 0)
    if (d < today) return 'disabled'
    if (startDate && isSameDay(d, startDate)) return 'start'
    if (endDate && isSameDay(d, endDate)) return 'end'
    const rangeEnd = hoverDate && selecting === 'end' ? hoverDate : endDate
    if (isInRange(d, startDate, rangeEnd)) return 'in-range'
    return 'available'
  }

  const dayClasses: Record<string, string> = {
    empty:      '',
    disabled:   'text-gray-600 cursor-not-allowed',
    available:  'text-gray-300 hover:bg-spinupfy-700/20 hover:text-white cursor-pointer rounded-lg',
    start:      'bg-spinupfy-700 text-white font-bold rounded-l-lg cursor-pointer',
    end:        'bg-spinupfy-700 text-white font-bold rounded-r-lg cursor-pointer',
    'in-range': 'bg-spinupfy-700/20 text-spinupfy-300 cursor-pointer',
  }

  return (
    <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-5">
      {/* Selection prompt */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setSelecting('start')}
          className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${
            selecting === 'start'
              ? 'border-spinupfy-700 bg-spinupfy-950/40'
              : 'border-gray-700 bg-gray-900/40 hover:border-gray-500'
          }`}
        >
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Go live
          </div>
          <div className="text-sm font-semibold text-white">
            {startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick date'}
          </div>
        </button>
        <div className="flex items-center text-gray-500 font-bold">→</div>
        <button
          onClick={() => setSelecting('end')}
          className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${
            selecting === 'end'
              ? 'border-spinupfy-700 bg-spinupfy-950/40'
              : 'border-gray-700 bg-gray-900/40 hover:border-gray-500'
          }`}
        >
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Take down
          </div>
          <div className="text-sm font-semibold text-white">
            {endDate && !isSameDay(endDate, startDate!) ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick date'}
          </div>
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-semibold text-white">
          {MONTHS[viewMonth]} {viewYear}
        </div>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-500 py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((date, i) => {
          const state = getDayState(date)
          return (
            <div
              key={i}
              className={`
                text-center text-sm py-2 select-none transition-colors
                ${dayClasses[state] || ''}
              `}
              onClick={() => date && state !== 'disabled' && handleDayClick(date)}
              onMouseEnter={() => date && setHoverDate(date)}
              onMouseLeave={() => setHoverDate(null)}
            >
              {date?.getDate() || ''}
            </div>
          )
        })}
      </div>

      {/* Helper tip */}
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <span>
          {selecting === 'start'
            ? 'Click a date to set when your site goes live.'
            : 'Click a date to set when your site is taken down.'}
        </span>
      </div>
    </div>
  )
}
