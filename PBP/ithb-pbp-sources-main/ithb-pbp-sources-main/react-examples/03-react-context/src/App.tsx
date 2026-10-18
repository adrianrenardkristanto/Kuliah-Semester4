import { CommentProvider } from "./context/CommentContext";
import { MyPostPreview } from "./components/MyPostPreview";

const initialComments = [
  {
    id: 1,
    content: "Comment 1",
  },
  {
    id: 2,
    content: "Comment 2",
    parentId: 1,
  },
  {
    id: 3,
    content: "Comment 3",
  },
  {
    id: 4,
    content: "Comment 4",
    parentId: 3,
  },
  {
    id: 5,
    content: "Comment 5",
  },
  {
    id: 6,
    content: "Comment 6",
    parentId: 5,
  },
  {
    id: 7,
    content: "Comment 7",
  },
  {
    id: 8,
    content: "Comment 8",
    parentId: 7,
  },
  {
    id: 9,
    content: "Comment 9",
  },
  {
    id: 10,
    content: "Comment 10",
    parentId: 8,
  },
];

function App() {
  return (
    <CommentProvider initialComments={initialComments}>
      <MyPostPreview />
    </CommentProvider>
  );
}

export default App;
