import { CreditCard, Plus, Search, Filter } from 'lucide-react'

export function BillingPage() {
  return (
    <div className="container-fluid py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Billing
          </h1>
          <p className="text-neutral-600">
            Manage bills, payments, and financial records
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Bill
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
                placeholder="Search bills by patient name or bill number..."
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="form-input">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="card">
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            No bills found
          </h3>
          <p className="text-neutral-600 mb-4">
            Bills and payment records will appear here.
          </p>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create First Bill
          </button>
        </div>
      </div>
    </div>
  )
}