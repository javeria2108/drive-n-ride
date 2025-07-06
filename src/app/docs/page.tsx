// app/docs/page.tsx
'use client'

import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import { useEffect, useState } from 'react'

export default function SwaggerDocsPage() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    const fetchSpec = async () => {
      const res = await fetch('/api/docs/json')
      const data = await res.json()
      setSpec(data)
    }
    fetchSpec()
  }, [])

  return (
    <div style={{ height: '100vh' }}>
      {spec ? (
        <SwaggerUI spec={spec} />
      ) : (
        <p className="text-center text-white">Loading Swagger Docs...</p>
      )}
    </div>
  )
}
