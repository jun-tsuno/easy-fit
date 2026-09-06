import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import App from "./App";
import { ExercisesPage } from "./pages/exercises";
import { LoginPage } from "./pages/login";
import { RecordPage } from "./pages/record";

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
      {
        path: "/exercises",
        element: <ExercisesPage />,
      },
      {
        path: "/record",
        element: <RecordPage />,
      },
    ],
  },
]);
