import { useEffect, useMemo, useState } from "react"
import { couponsAPI, restaurantAPI } from "../../services/api"

export default function AdminCoupons() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [restaurants, setRestaurants] = useState([])

  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: 10,
    minOrderAmount: 0,
    maxDiscount: 0,
    startsAt: "",
    expiresAt: "",
    usageLimit: 0,
    isActive: true,
    restaurant: "",
  })

  const canSubmit = useMemo(() => {
    if (!form.code || !form.type || Number(form.value) <= 0) return false
    return true
  }, [form])

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const [{ coupons }, restaurantsRes] = await Promise.all([
        couponsAPI.list(),
        restaurantAPI.getAll({ limit: 100 }).catch(() => ({})),
      ])
      setList(Array.isArray(coupons) ? coupons : [])
      const rs = restaurantsRes?.restaurants || restaurantsRes?.data || restaurantsRes || []
      setRestaurants(Array.isArray(rs) ? rs : [])
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load coupons")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxDiscount: Number(form.maxDiscount || 0),
        usageLimit: Number(form.usageLimit || 0),
        restaurant: form.restaurant || undefined,
        startsAt: form.startsAt || undefined,
        expiresAt: form.expiresAt || undefined,
      }
      await couponsAPI.create(payload)
      setSuccess("Coupon created")
      setForm({ ...form, code: "" })
      await load()
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create coupon")
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id, code) => {
    const ok = window.confirm(`Delete coupon ${code}? This cannot be undone.`)
    if (!ok) return
    try {
      await couponsAPI.delete(id)
      setList((prev) => prev.filter((c) => c._id !== id))
    } catch (e) {
      alert(e.response?.data?.message || "Failed to delete coupon")
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Coupons</h1>

      <form onSubmit={onSubmit} className="card mb-8 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Create Coupon</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Code</label>
            <input name="code" value={form.code} onChange={onChange} placeholder="SAVE10" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select name="type" value={form.type} onChange={onChange} className="input-field">
              <option value="percent">Percent (%)</option>
              <option value="amount">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Value</label>
            <input name="value" type="number" min="0" step="0.01" value={form.value} onChange={onChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Min Order Amount</label>
            <input name="minOrderAmount" type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={onChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Max Discount (0 = no cap)</label>
            <input name="maxDiscount" type="number" min="0" step="0.01" value={form.maxDiscount} onChange={onChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Usage Limit (0 = unlimited)</label>
            <input name="usageLimit" type="number" min="0" step="1" value={form.usageLimit} onChange={onChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Starts At</label>
            <input name="startsAt" type="datetime-local" value={form.startsAt} onChange={onChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Expires At</label>
            <input name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={onChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Restaurant (optional)</label>
            <select name="restaurant" value={form.restaurant} onChange={onChange} className="input-field">
              <option value="">All restaurants</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="isActive" name="isActive" type="checkbox" checked={form.isActive} onChange={onChange} />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={!canSubmit || saving} className="btn-primary px-6 py-2 disabled:opacity-50">
            {saving ? "Saving..." : "Create"}
          </button>
          {error && <span className="text-red-600 text-sm">{error}</span>}
          {success && <span className="text-green-600 text-sm">{success}</span>}
        </div>
      </form>

      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Existing Coupons</h2>
        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading…</div>
        ) : list.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-400">No coupons found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Value</th>
                  <th className="py-2 pr-4">Min</th>
                  <th className="py-2 pr-4">Max</th>
                  <th className="py-2 pr-4">Used</th>
                  <th className="py-2 pr-4">Limit</th>
                  <th className="py-2 pr-4">Active</th>
                  <th className="py-2 pr-4">Expires</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {list.map((c) => (
                  <tr key={c._id}>
                    <td className="py-2 pr-4 font-semibold text-gray-900 dark:text-gray-100">{c.code}</td>
                    <td className="py-2 pr-4">{c.type}</td>
                    <td className="py-2 pr-4">{c.type === "percent" ? `${c.value}%` : `$${Number(c.value).toFixed(2)}`}</td>
                    <td className="py-2 pr-4">{`$${Number(c.minOrderAmount ?? 0).toFixed(2)}`}</td>
                    <td className="py-2 pr-4">{c.maxDiscount ? `$${Number(c.maxDiscount).toFixed(2)}` : "–"}</td>
                    <td className="py-2 pr-4">{c.usedCount || 0}</td>
                    <td className="py-2 pr-4">{c.usageLimit || 0}</td>
                    <td className="py-2 pr-4">{c.isActive ? <span className="text-green-600">Yes</span> : <span className="text-gray-500">No</span>}</td>
                    <td className="py-2 pr-4">{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "–"}</td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => onDelete(c._id, c.code)}
                        className="text-red-600 hover:text-red-700 font-medium"
                        title="Delete coupon"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
