import { useMemo } from "react";
import { useCommentContext } from "../context/CommentContext";

export type MyNestingCommentProps = {
  parentId?: number;
};

export const MyNestingComment = (props: MyNestingCommentProps) => {
  const { parentId } = props;
  const { comments } = useCommentContext();
  const filteredComments = useMemo(() => {
    return comments.filter((record) => {
      return record.parentId === parentId;
    });
  }, [comments, parentId]);

  return (
    <div>
      {filteredComments.map((record) => (
        <div key={record.id} style={{ marginLeft: "20px" }}>
          {record.content}
          <MyNestingComment parentId={record.id} />
        </div>
      ))}
    </div>
  );
};
