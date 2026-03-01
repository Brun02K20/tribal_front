import type { AdminTableProps } from "@/types/admin-ui";

export default function AdminTable({
  headers,
  loading,
  isEmpty,
  loadingText,
  emptyText,
  minWidthClassName,
  children,
}: AdminTableProps) {
  const colSpan = headers.length;

  return (
    <div className="mt-4 w-full max-w-full overflow-x-auto">
      <table className={`min-w-full border-collapse overflow-hidden rounded-lg ${minWidthClassName ?? ""}`.trim()}>
        <thead>
          <tr className="bg-earth-brown text-cream">
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td className="px-3 py-4" colSpan={colSpan}>
                {loadingText}
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td className="px-3 py-4" colSpan={colSpan}>
                {emptyText}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
