import { useState } from 'react'

function GalleryImage({ src, width, height, onLoad }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setLoaded(true)
    onLoad()
  }

  const handleError = () => {
    setError(true)
    onLoad() // still count as "done" so loading screen doesn't hang
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
        loading="lazy"
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
          width={img.width}
          height={img.height}
          onLoad={onImageLoad}
        />
      ))}
    </div>
  )
}
