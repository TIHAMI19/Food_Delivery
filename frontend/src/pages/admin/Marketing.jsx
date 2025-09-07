import { useState, useEffect } from "react"
import { marketingAPI } from "../../services/api"

const AdminMarketing = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [currentBanner, setCurrentBanner] = useState(null)
  const [banners, setBanners] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [{ banner }, { banners }] = await Promise.all([
          marketingAPI.getBanner(),
          marketingAPI.listBanners(),
        ])
        setCurrentBanner(banner)
        setBanners(banners || [])
      } catch {}
    }
    load()
  }, [])

  const onFileChange = (e) => {
    setError("")
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Max file size is 5MB")
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const onUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError("Please choose an image")
      return
    }
    setIsUploading(true)
    setError("")
    setSuccess("")
    try {
  const { banner } = await marketingAPI.uploadBanner(file)
  setCurrentBanner(banner)
  const { banners: list } = await marketingAPI.listBanners()
  setBanners(list || [])
      setFile(null)
      setPreview("")
      setSuccess("Banner uploaded successfully")
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Marketing - Promotional Banner</h1>
      <p className="text-gray-600 mb-6">
        Upload a promotional banner image. It will appear as the background at the top of the home page.
      </p>

  {currentBanner?.imageUrl && (
        <div className="mb-6">
          <p className="font-medium mb-2">Current banner</p>
          <img
            src={currentBanner.imageUrl}
            alt="Current banner"
            className="w-full h-48 object-cover rounded border"
          />
        </div>
      )}

      <form onSubmit={onUpload} className="space-y-4">
        <div>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">Preview</p>
              <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded border" />
            </div>
          )}
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          disabled={isUploading}
          className="btn-primary px-6 py-2 disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : "Upload Banner"}
        </button>
      </form>

      {/* Banner list management */}
      {banners.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3">All Banners</h2>
          <div className="space-y-3">
            {banners.map((b) => (
              <div key={b._id} className="flex items-center gap-4 p-3 border rounded">
                <img src={b.imageUrl} alt="banner" className="w-28 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="text-sm text-gray-700">
                    {new Date(b.createdAt).toLocaleString()}
                  </div>
                  {b.active && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      Active
                    </span>
                  )}
                </div>
                {!b.active && (
                  <button
                    onClick={async () => {
                      setError("")
                      try {
                        const { banner } = await marketingAPI.activateBanner(b._id)
                        setCurrentBanner(banner)
                        const { banners: list } = await marketingAPI.listBanners()
                        setBanners(list || [])
                      } catch (e) {
                        setError(e.response?.data?.message || "Failed to activate")
                      }
                    }}
                    className="btn-primary px-4 py-1"
                  >
                    Set Active
                  </button>
                )}
                <button
                  onClick={async () => {
                    setError("")
                    try {
                      await marketingAPI.deleteBanner(b._id)
                      const { banner: current } = await marketingAPI.getBanner()
                      setCurrentBanner(current)
                      const { banners: list } = await marketingAPI.listBanners()
                      setBanners(list || [])
                    } catch (e) {
                      setError(e.response?.data?.message || "Failed to delete")
                    }
                  }}
                  className="ml-2 px-4 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMarketing
