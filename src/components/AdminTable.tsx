import React from 'react';

interface AdminTableProps<T> {
  data: T[];
  columns: string[];
  renderRow: (item: T) => React.ReactNode;
}

export const AdminTable = <T,>({
  data,
  columns,
  renderRow
}: AdminTableProps<T>) => (
  <table className="admin-table">
    <thead>
      <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
    </thead>
    <tbody>{data.map(renderRow)}</tbody>
  </table>
);