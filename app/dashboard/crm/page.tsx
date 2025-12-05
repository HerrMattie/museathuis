export default function CrmDashboardPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">CRM dashboard</h1>
        <a
          href="/dashboard/logout"
          className="text-sm text-slate-300 hover:text-white underline"
        >
          Uitloggen
        </a>
      </header>
      <p className="text-sm text-slate-300">
        Kies een onderdeel om te beheren.
      </p>
      <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
        <li>
          <a href="/dashboard/crm/tours" className="underline">
            Dagtours beheren
          </a>
        </li>
      </ul>
    </div>
  );
}