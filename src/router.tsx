import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import App from "./App";
import { BodyWeightPage } from "./pages/body-weight";
import { ExercisesPage } from "./pages/exercises";
import { LoginPage } from "./pages/login";
import { RecordListPage } from "./pages/record";
import { RecordExerciseSelectPage } from "./pages/record-exercise-select";
import { RecordSetInputPage } from "./pages/record-set-input";

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
        element: <RecordListPage />,
      },
      {
        path: "/record/new",
        element: <RecordExerciseSelectPage />,
      },
      {
        path: "/record/new/:exerciseId",
        element: <RecordSetInputPage />,
      },
      {
        path: "/body-weight",
        element: <BodyWeightPage />,
      },
    ],
  },
]);
