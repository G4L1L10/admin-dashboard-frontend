// src/app/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to{" "}
        <span className="text-blue-600">Bandroom Admin Dashboard</span>
      </h1>
      <p className="text-gray-600 text-lg">
        Manage users, projects, analytics, and settings all in one place.
      </p>
    </div>
  );
}
