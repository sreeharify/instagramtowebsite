import { useState } from 'react'

// Images are served via /proxy on the Worker — no direct CDN calls needed
function GalleryImage({ src, onLoad }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setLoaded(true)
    onLoad()
  }

  const handleError = () => {
    setError(true)
    onLoad() // still mark done so loading screen doesn't hang
  }

  if (error) {
    return (
      <div className="gallery-item gallery-error">
        <span>✦</span>
      </div>
    )
  }

  return (
    <div className={`gallery-item ${loaded ? 'loaded' : 'unloaded'}`}>
      {!loaded && <div className="img-shimmer" />}
      <img
        src={src}
        alt="Wedding photography"
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </div>
  )
}

export default function GalleryGrid({ images, onImageLoad }) {
  return (
    <div className="gallery-masonry" id="gallery-grid">
      {images.map((img, i) => (
        <GalleryImage
          key={i}
          src={img.url}
          onLoad={onImageLoad}
        />
      ))}
    </div>
  )
}
