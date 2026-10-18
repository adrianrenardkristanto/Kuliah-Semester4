import { useParams } from "react-router";

export const ParamPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Param Page: {id} </h1>
      <p>This is a simple example of a param page component.</p>
      <p>You can add more content here as needed.</p>
    </div>
  );
};
