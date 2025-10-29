'use client'

import { useState, useEffect } from 'react'
import { Phone, Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, AlertCircle, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'

type CallStatus = 'scheduled' | 'completed' | 'missed' | 'cancelled'

interface Call {
  id: string
  customerName: string
  phone: string
  scheduledTime: Date
  duration?: number
  status: CallStatus
  notes: string
  projectType?: string
}

export default function CallManager() {
  const [calls, setCalls] = useState<Call[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<CallStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    scheduledTime: '',
    projectType: '',
    notes: ''
  })

  useEffect(() => {
    const savedCalls = localStorage.getItem('freelance-calls')
    if (savedCalls) {
      const parsed = JSON.parse(savedCalls)
      setCalls(parsed.map((call: any) => ({
        ...call,
        scheduledTime: new Date(call.scheduledTime)
      })))
    }
  }, [])

  useEffect(() => {
    if (calls.length > 0) {
      localStorage.setItem('freelance-calls', JSON.stringify(calls))
    }
  }, [calls])

  const addCall = (e: React.FormEvent) => {
    e.preventDefault()
    const newCall: Call = {
      id: Date.now().toString(),
      customerName: formData.customerName,
      phone: formData.phone,
      scheduledTime: new Date(formData.scheduledTime),
      status: 'scheduled',
      notes: formData.notes,
      projectType: formData.projectType
    }
    setCalls([...calls, newCall])
    setFormData({
      customerName: '',
      phone: '',
      scheduledTime: '',
      projectType: '',
      notes: ''
    })
    setShowAddForm(false)
  }

  const updateCallStatus = (id: string, status: CallStatus, duration?: number) => {
    setCalls(calls.map(call =>
      call.id === id ? { ...call, status, duration } : call
    ))
  }

  const deleteCall = (id: string) => {
    setCalls(calls.filter(call => call.id !== id))
  }

  const filteredCalls = calls
    .filter(call => filter === 'all' || call.status === filter)
    .filter(call =>
      call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.phone.includes(searchTerm) ||
      (call.projectType && call.projectType.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'missed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: CallStatus) => {
    switch (status) {
      case 'scheduled': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'missed': return <XCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
    }
  }

  const stats = {
    total: calls.length,
    scheduled: calls.filter(c => c.status === 'scheduled').length,
    completed: calls.filter(c => c.status === 'completed').length,
    missed: calls.filter(c => c.status === 'missed').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Freelance Call Manager</h1>
                <p className="text-gray-600">Manage your customer calls efficiently</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Call
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl">
              <div className="text-sm opacity-90">Total Calls</div>
              <div className="text-3xl font-bold mt-1">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-5 rounded-xl">
              <div className="text-sm opacity-90">Scheduled</div>
              <div className="text-3xl font-bold mt-1">{stats.scheduled}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl">
              <div className="text-sm opacity-90">Completed</div>
              <div className="text-3xl font-bold mt-1">{stats.completed}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-5 rounded-xl">
              <div className="text-sm opacity-90">Missed</div>
              <div className="text-3xl font-bold mt-1">{stats.missed}</div>
            </div>
          </div>

          {showAddForm && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl mb-8 border-2 border-indigo-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Schedule New Call</h2>
              <form onSubmit={addCall} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                  <input
                    type="text"
                    value={formData.projectType}
                    onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Website, Logo, App, etc."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="Discussion topics, requirements, etc."
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Schedule Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer, phone, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'scheduled', 'completed', 'missed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredCalls.length === 0 ? (
              <div className="text-center py-16">
                <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No calls found</h3>
                <p className="text-gray-500">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your filters or search term'
                    : 'Schedule your first customer call to get started'}
                </p>
              </div>
            ) : (
              filteredCalls.map((call) => (
                <div
                  key={call.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{call.customerName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {call.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(call.scheduledTime, 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(call.scheduledTime, 'hh:mm a')}
                            </span>
                          </div>
                          {call.projectType && (
                            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              {call.projectType}
                            </span>
                          )}
                        </div>
                      </div>
                      {call.notes && (
                        <div className="ml-11 bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                            <p className="text-sm text-gray-700">{call.notes}</p>
                          </div>
                        </div>
                      )}
                      {call.duration && (
                        <div className="ml-11 mt-2 text-sm text-gray-600">
                          Duration: {call.duration} minutes
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(call.status)}`}>
                        {getStatusIcon(call.status)}
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </div>
                      {call.status === 'scheduled' && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              const duration = prompt('Call duration in minutes:')
                              if (duration) updateCallStatus(call.id, 'completed', parseInt(duration))
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => updateCallStatus(call.id, 'missed')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Mark Missed
                          </button>
                          <button
                            onClick={() => updateCallStatus(call.id, 'cancelled')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => deleteCall(call.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
