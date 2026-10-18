import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Comment } from "../types";

interface CommentContextType {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export type CommentProviderProps = {
  children: ReactNode;
  initialComments?: Comment[];
};
export const CommentProvider = (props: CommentProviderProps) => {
  const { children, initialComments } = props;
  const [comments, setComments] = useState<Comment[]>(initialComments || []);

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  return (
    <CommentContext.Provider value={{ comments, setComments }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = (): CommentContextType => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return context;
};
