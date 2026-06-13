import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import CreateInterview from '../pages/CreateInterview'
import Interview from '../pages/Interview'
import Result from '../pages/Result'
import History from '../pages/History'
import Profile from '../pages/Profile'
import ResumeAnalysis from '../pages/ResumeAnalysis'
import NotFound from '../pages/NotFound'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-interview" element={<CreateInterview />} />
          <Route path="interview" element={<Interview />} />
          <Route path="result" element={<Result />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="resume-analysis" element={<ResumeAnalysis />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
