import { useMemo } from 'react'
import { media, wedding } from '../data/weddingData'
import { buildCalendarModel } from '../utils/calendar'

/**
 * Section lịch — `#w-xr8n7pvd` (420 × 366px).
 * Toàn bộ style đã có sẵn trong `global.css` (khối `.wc-cal-*` + `heartFlash`).
 * Logic dựng lịch port từ script gốc sang `useMemo` + JSX thuần.
 */
export default function CalendarSection() {
  const model = useMemo(
    () => buildCalendarModel(wedding.calendarDateInput, wedding.calendarLang),
    [],
  )

  return (
    <div id="w-xr8n7pvd" className="com-section" data-section>
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height lazy" />
        <div className="section-container full-height p-relative">
          <div id="w-x3qlo4n9" className="com-html-box p-absolute">
            <div className="frame-html-box full-width full-height">
              <div className="wc-cal-outer">
                <div id="wc-cal-title" className="wc-cal-title">
                  {model ? model.title : ''}
                </div>

                <div className="wc-cal" id="wc-cal-target">
                  <div className="wc-cal-frame">
                    <div className="wc-cal-dow-row">
                      {model &&
                        model.dows.map((d) => <div key={d}>{d}</div>)}
                    </div>

                    <div className="wc-cal-grid">
                      {model &&
                        Array.from({ length: model.offset }, (_, i) => (
                          <div
                            className="wc-cal-day wc-cal-empty"
                            key={`empty-${i}`}
                          />
                        ))}

                      {model &&
                        model.days.map((d) => {
                          const isSun = model.isSunday(
                            (model.offset + (d - 1)) % 7,
                          )
                          const isSel = model.selectedDays.includes(d)

                          return (
                            <div
                              className={
                                'wc-cal-day' +
                                (isSun ? ' wc-cal-day--sun' : '') +
                                (isSel ? ' wc-cal-day--selected' : '')
                              }
                              key={d}
                            >
                              <span className="wc-cal-day-span">{d}</span>
                              {isSel && (
                                <img
                                  src={media.heartIcon}
                                  className="wc-cal-heart"
                                  alt=""
                                />
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
