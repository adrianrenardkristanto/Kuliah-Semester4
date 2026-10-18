import { useState } from "react";
import { Link } from "react-router";

export const HomePage = () => {
  const [paramValue, setParamValue] = useState("");

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the main page of the application.</p>
      <ul>
        <li>
          <Link to="/param/123">Go to Param 123</Link>
        </li>
        <li>
          <Link to="/param/555">Go to Param 555</Link>
        </li>
        <li>
          <div>
            <input
              type="text"
              value={paramValue}
              onChange={(e) => setParamValue(e.target.value)}
              placeholder="Enter param value"
            />
            &nbsp;
            <Link to={`/param/${paramValue}`}>
              Go to Param set: {paramValue}
            </Link>
          </div>
        </li>
      </ul>
    </div>
  );
};
