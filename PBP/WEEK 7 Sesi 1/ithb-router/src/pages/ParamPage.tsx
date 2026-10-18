import { Link, useParams } from "react-router";

export const ParamPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Param Page</h1>
      <p>This is the param page with id: {id}</p>
      <Link to="/">Go back to Home Page</Link>
    </div>
  );
};
