// app/admin/tours/calendar/page.tsx
import Link from 'next/link';
import { listToursInRange, TourListItem } from '@/lib/repos/tourRepo';

type PageProps = {
  searchParams: {
    month?: string; // formaat: YYYY-MM
  };
};

function getMonthInfo(monthParam?: string) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-11

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      year = y;
      month = m - 1;
    }
  }

  const firstDay = new Date(year, month, 1);
  const nextMonthFirst = new Date(year, month + 1, 1);
  const lastDay = new Date(nextMonthFirst.getTime() - 24 * 60 * 60 * 1000);

  const fromDate = firstDay.toISOString().slice(0, 10);
  const toDate = lastDay.toISOString().slice(0, 10);

  const ym = `${year}-${String(month + 1).padStart(2, '0')}`;

  return { year, month, fromDate, toDate, ym };
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0 = zondag
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { date: string; day: number }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const current = new Date(year, month, d);
    const iso = current.toISOString().slice(0, 10);
    days.push({ date: iso, day: d });
  }

  return { startWeekday, days };
}

function groupToursByDate(tours: TourListItem[]) {
  const map = new Map<string, TourListItem[]>();
  for (const tour of tours) {
    if (!map.has(tour.date)) {
      map.set(tour.date, []);
    }
    map.get(tour.date)!.push(tour);
  }
  return map;
}

export const revalidate = 60;

export default async function AdminToursCalendarPage({ searchParams }: PageProps) {
  const { year, month, fromDate, toDate, ym } = getMonthInfo(searchParams.month);
  const tours = await listToursInRange(fromDate, toDate);
  const toursByDate = groupToursByDate(tours);
  const { startWeekday, days } = buildCalendarDays(year, month);

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const prevYm = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
  const nextYm = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            Tourkalender
          </h1>
          <p className="text-sm text-gray-600">
            Overzicht per dag welke tours gepland/gepubliceerd zijn in {ym}.
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="space-x-2 text-xs">
            <Link
              href={`/admin/tours/calendar?month=${prevYm}`}
              className="px-2 py-1 border rounded hover:bg-gray-50"
            >
              ← {prevYm}
            </Link>
            <Link
              href={`/admin/tours/calendar?month=${nextYm}`}
              className="px-2 py-1 border rounded hover:bg-gray-50"
            >
              {nextYm} →
            </Link>
          </div>
          <div>
            <Link
              href="/admin/tours"
              className="text-xs text-blue-700 hover:underline"
            >
              Naar touroverzicht
            </Link>
          </div>
        </div>
      </header>

      <section className="border rounded-lg bg-white p-4">
        <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-gray-600 mb-2">
          <div>Zo</div>
          <div>Ma</div>
          <div>Di</div>
          <div>Wo</div>
          <div>Do</div>
          <div>Vr</div>
          <div>Za</div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-xs">
          {/* lege cellen voor de eerste week */}
          {Array.from({ length: startWeekday === 0 ? 0 : startWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map(({ date, day }) => {
            const dayTours = toursByDate.get(date) ?? [];
            const hasPublished = dayTours.some(t => t.isPublished);
            const hasPremium = dayTours.some(t => t.isPremium);

            let bgClass = 'bg-gray-50';
            if (hasPublished && hasPremium) bgClass = 'bg-purple-50';
            else if (hasPublished) bgClass = 'bg-green-50';
            else if (dayTours.length > 0) bgClass = 'bg-yellow-50';

            return (
              <div
                key={date}
                className={`border rounded p-1 min-h-[60px] flex flex-col ${bgClass}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{day}</span>
                  {hasPremium && (
                    <span className="text-[10px] text-purple-700 font-semibold">
                      P
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayTours.map(t => (
                    <Link
                      key={t.id}
                      href={`/admin/tours/${t.id}`}
                      className="block text-[11px] leading-snug text-blue-700 hover:underline"
                    >
                      {t.isPublished ? '● ' : '○ '}
                      {t.title}
                    </Link>
                  ))}

                  {dayTours.length === 0 && (
                    <span className="text-[10px] text-gray-400">
                      Geen tour
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-4 text-[11px] text-gray-600">
          <span>● Gepubliceerd</span>
          <span>○ Concept</span>
          <span>P = premium tour</span>
        </div>
      </section>
    </main>
  );
}
