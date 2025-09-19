import { Calendar, Plus, Search, Filter } from 'lucide-react'

export function AppointmentsPage() {
  return (
    <div className="container-fluid py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Appointments
          </h1>
          <p className="text-neutral-600">
            Schedule and manage patient appointments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search appointments by patient name or doctor..."
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="form-input">
              <option value="">All Departments</option>
              <option value="dental">Dental</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="icu">ICU</option>
            </select>
            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointment List */}
      <div className="card">
        <div className="text-center py-12">
          <Calendar className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            No appointments scheduled
          </h3>
          <p className="text-neutral-600 mb-4">
            Start scheduling appointments for your patients.
          </p>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Schedule First Appointment
          </button>
        </div>
      </div>
    </div>
  )
}