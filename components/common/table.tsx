import type React from "react"

type Column = {
  key: string
  label: string
}

type TableProps = {
  columns: Column[]
  data: Record<string, any>[]
  actions?: (row: Record<string, any>) => React.ReactNode
}

export default function Table({ columns, data, actions }: TableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8 text-center text-gray-500">No data available</div>
      </div>
    )
  }

  return (
    <div className="overflow-y-visible rounded-lg border border-gray-200 shadow-sm relative">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row[column.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative z-10">{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
