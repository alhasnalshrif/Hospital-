import { FileText, Plus, Search, Filter } from 'lucide-react'

export function MedicalRecordsPage() {
  return (
    <div className="container-fluid py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Medical Records
          </h1>
          <p className="text-neutral-600">
            View and manage patient medical records
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Record
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
                placeholder="Search records by patient name, diagnosis, or doctor..."
                className="form-input pl-10"
              />
            </div>
          </div>
          <button className="btn-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="card">
        <div className="text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            No medical records found
          </h3>
          <p className="text-neutral-600 mb-4">
            Medical records will appear here as they are created.
          </p>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create First Record
          </button>
        </div>
      </div>
    </div>
  )
}