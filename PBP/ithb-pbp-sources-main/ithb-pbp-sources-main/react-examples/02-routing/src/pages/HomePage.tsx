import { useState } from "react";
import { Link, useNavigate } from "react-router";

export const HomePage = () => {
  const [param, setParam] = useState("");
  const navigate = useNavigate();

  const navigateTo4 = () => {
    navigate("/param/4");
  };

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
      <p>This is a simple example of a home page component.</p>
      <p>You can add more content here as needed.</p>

      <ul>
        <li>
          <Link to="/param/1">Go to Params Page with ID 1</Link>
        </li>
        <li>
          <Link to={{ search: "?name=Hans", pathname: "/params/2" }}>
            Go to Params Page with ID 2
          </Link>
        </li>
        <li>
          <Link to="/param/3">Go to Params Page with ID 3</Link>
        </li>
        <li>
          <input value={param} onChange={(e) => setParam(e.target.value)} />
          <Link to={`/param/${param}`}>Go to Params Page with ID {param}</Link>
        </li>
        <li>
          <button onClick={navigateTo4}>Go To 4</button>
        </li>
      </ul>
    </div>
  );
};
