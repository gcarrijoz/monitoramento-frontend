
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PatientProvider } from "./contexts/PatientContext";
import { DeviceProvider } from "./contexts/DeviceContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import RoomDetail from "./pages/RoomDetail";
import RoomList from "./pages/RoomList";
import PatientDetail from "./pages/PatientDetail";
import MeasurementHistoryPage from "./pages/MeasurementHistoryPage";
import AssignPatient from "./pages/AssignPatient";
import AssignPatientToRoom from "./pages/AssignPatientToRoom";
import EditPatient from "./pages/EditPatient";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import DeviceList from "./pages/DeviceList";
import { BPMDisplay } from "./components/TesteSocket";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PatientProvider>
          <DeviceProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/rooms" element={<RoomList />} />
                <Route path="/devices" element={<DeviceList />} />
                <Route path="/room/:roomId" element={<RoomDetail />} />
                <Route path="/patient/:patientId" element={<PatientDetail />} />
                <Route path="/patient/:patientId/history" element={<MeasurementHistoryPage />} />
                <Route path="/edit-patient/:patientId" element={<EditPatient />} />
                <Route path="/assign-patient/:roomId" element={<AssignPatient />} />
                <Route path="/assign-patient-to-room/:patientId" element={<AssignPatientToRoom />} />
                <Route path="/teste" element={<BPMDisplay/>} />
                {/*}<Route path="/settings" element={<Settings />} />{*/}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DeviceProvider>
        </PatientProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
