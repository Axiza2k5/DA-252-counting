import { createBrowserRouter } from "react-router";
import { InteractionScreen } from "./components/InteractionScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { HistoryScreen } from "./components/HistoryScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: InteractionScreen,
  },
  {
    path: "/results",
    Component: ResultsScreen,
  },
  {
    path: "/history",
    Component: HistoryScreen,
  },
]);
