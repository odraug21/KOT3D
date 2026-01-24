import { BrowserRouter } from "react-router-dom";
import AppRouter from "./Routes/AppRouter";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./state/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
