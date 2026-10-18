import { MyNestingComment } from "./MyNestingComment";

export const MyPostPreview = () => {
  return (
    <div>
      <h1>This is the post preview</h1>
      <MyNestingComment />
    </div>
  );
};
