import React from 'react';
import { AdminTable } from './AdminTable';
import { EventDto as IEvent } from '../lib/types';

interface Props {
  events: IEvent[];
}

export const EventAdminTable: React.FC<Props> = ({ events }) => (
  <AdminTable
    data={events}
    columns={["Name", "Date", "Actions"]}
    renderRow={e => (
      <tr key={e.Id}>
        <td>{e.Title}</td>
        <td>{new Date(e.StartDate).toLocaleDateString()}</td>
        <td>{/* Edit/Delete buttons */}</td>
      </tr>
    )}
  />
);