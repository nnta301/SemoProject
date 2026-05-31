// Router tree for public, authenticated, and admin-only routes.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AdminLayout from '../layouts/AdminLayout'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import { ROUTES } from '../constants/routes'
import { ROLES } from '../constants/roles'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={null} />
          <Route path={ROUTES.REGISTER} element={null} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={null} />
            <Route path={ROUTES.PROFILE} element={null} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.USERS} element={null} />
            <Route path={ROUTES.SCOOTERS} element={null} />
            <Route path={ROUTES.RENTALS} element={null} />
            <Route path={ROUTES.MAINTENANCE} element={null} />
            <Route path={ROUTES.ANALYTICS} element={null} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
