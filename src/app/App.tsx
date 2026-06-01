import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { ProtectedRoute, PublicOnlyRoute } from "./auth/ProtectedRoute";
import { AppLoading } from "./components/AppLoading";

const Landing = lazy(() => import("./pages/Landing").then((module) => ({ default: module.Landing })));
const Discover = lazy(() => import("./pages/Discover").then((module) => ({ default: module.Discover })));
const Login = lazy(() => import("./pages/Login").then((module) => ({ default: module.Login })));
const Register = lazy(() => import("./pages/Register").then((module) => ({ default: module.Register })));
const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const Collections = lazy(() => import("./pages/Collections").then((module) => ({ default: module.Collections })));
const CollectionDetails = lazy(() =>
  import("./pages/CollectionDetails").then((module) => ({ default: module.CollectionDetails })),
);
const MemoryDetails = lazy(() => import("./pages/MemoryDetails").then((module) => ({ default: module.MemoryDetails })));
const Timeline = lazy(() => import("./pages/Timeline").then((module) => ({ default: module.Timeline })));
const Museum = lazy(() => import("./pages/Museum").then((module) => ({ default: module.Museum })));
const Gallery = lazy(() => import("./pages/Gallery").then((module) => ({ default: module.Gallery })));
const MemoryMap = lazy(() => import("./pages/MemoryMap").then((module) => ({ default: module.MemoryMap })));
const Museum3D = lazy(() => import("./pages/Museum3D").then((module) => ({ default: module.Museum3D })));
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })));
const NotFound = lazy(() => import("./pages/NotFound").then((module) => ({ default: module.NotFound })));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<AppLoading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/discover" element={<Discover />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:id" element={<CollectionDetails />} />
            <Route path="/memory/:id" element={<MemoryDetails />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/map" element={<MemoryMap />} />
            <Route path="/museum-3d" element={<Museum3D />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/museum/:username?" element={<Museum />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
