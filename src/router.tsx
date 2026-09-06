import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import App from "./App";
import { LoginPage } from "./pages/login";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
      },
    ],
  },
]);
