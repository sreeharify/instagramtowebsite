import { useState, useCallback } from 'react'
import InputPage from './components/InputPage'
import LoadingScreen from './components/LoadingScreen'
import GalleryPage from './components/GalleryPage'
import './index.css'

export default function App() {
  const [phase, setPhase] = useState('input') // 'input' | 'loading' | 'gallery'
  const [images, setImages] = useState([])
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loadedCount, setLoadedCount] = useState(0)

  const handleGenerate = useCallback(async (uname) => {
    setError('')
    setUsername(uname)
    setPhase('loading')
    setLoadedCount(0)

    try {
      const workerUrl = import.meta.env.VITE_WORKER_URL || ''
      const res = await fetch(`${workerUrl}/api/instagram?username=${encodeURIComponent(uname)}`)
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch posts')
      }

      if (!data.images || data.images.length === 0) {
        throw new Error('No photos found for this username. Make sure the account is public.')
      }

      setImages(data.images)
      // Phase switches to gallery once images load (LoadingScreen handles this)
    } catch (err) {
      setError(err.message)
      setPhase('input')
    }
  }, [])

  const handleAllLoaded = useCallback(() => {
    setPhase('gallery')
  }, [])

  const handleImageLoad = useCallback(() => {
    setLoadedCount(c => c + 1)
  }, [])

  const handleReset = useCallback(() => {
    setPhase('input')
    setImages([])
    setUsername('')
    setLoadedCount(0)
  }, [])

  return (
    <>
      {phase === 'input' && (
        <InputPage onGenerate={handleGenerate} error={error} />
      )}
      {(phase === 'loading' || phase === 'gallery') && images.length > 0 && (
        <>
          <LoadingScreen
            total={images.length}
            loaded={loadedCount}
            visible={phase === 'loading'}
            onDone={handleAllLoaded}
          />
          <GalleryPage
            images={images}
            username={username}
            onImageLoad={handleImageLoad}
            onReset={handleReset}
            visible={phase === 'gallery'}
          />
        </>
      )}
    </>
  )
}
