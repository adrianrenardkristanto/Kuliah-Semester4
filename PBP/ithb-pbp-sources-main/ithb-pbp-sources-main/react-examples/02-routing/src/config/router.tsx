import { createBrowserRouter } from "react-router";
import { HomePage } from "../pages/HomePage";
import { ParamPage } from "../pages/ParamPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/param/:id",
    element: <ParamPage />,
  },
]);
