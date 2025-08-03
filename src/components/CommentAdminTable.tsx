import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import { CommentDto as IComment } from '../lib/types';
import CommentItem from './CommentItem';

interface Props {
  eventId: number;
  currentUser: any;
}

export const CommentAdminTable: React.FC<Props> = ({ eventId, currentUser }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [page, setPage] = useState(1);

  const refreshComments = () => {
    fetch(`/api/comments?eventId=${eventId}&page=${page}&pageSize=10`)
      .then(res => res.json())
      .then(setComments);
  };

  useEffect(() => {
    refreshComments();
  }, [eventId, page]);

  return (
    <>
      <AdminTable
        data={comments}
        columns={["Content", "Author", "Date", "Actions"]}
        renderRow={c => (
          <tr key={c.Id}>
            <td colSpan={4}>
              <CommentItem
                comment={c}
                onCommentUpdate={refreshComments}
                onCommentDelete={refreshComments}
              />
            </td>
          </tr>
        )}
      />
      {/* TODO: Pagination controls */}
    </>
  );
};