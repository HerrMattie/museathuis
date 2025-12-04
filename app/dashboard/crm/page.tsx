export default function CrmHomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold">CRM dashboard</h1>
      <p className="text-gray-700">
        Kies een onderdeel om te beheren.
      </p>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <a href="/dashboard/crm/tours" className="text-blue-600 underline">
            Dagtours beheren
          </a>
        </li>
      </ul>
    </div>
  );
}