/**
 * Cloudflare Worker - Multi-Site Router
 *
 * Serves 10,000+ user websites from R2 storage
 * Handles all *.webese.ai subdomains
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const hostname = url.hostname
    const subdomain = hostname.split('.')[0]

    // Handle main domain (your marketing site)
    if (subdomain === 'webese' || subdomain === 'www' || hostname === 'webese.ai') {
      return handleMainSite(request, url)
    }

    // Serve user website from R2
    return serveUserWebsite(subdomain, url, env)
  },
}

/**
 * Handle main domain (your marketing/app site)
 */
async function handleMainSite(request, url) {
  // Option 1: Proxy to your main app
  const mainAppUrl = 'https://your-app.vercel.app' + url.pathname + url.search
  return fetch(mainAppUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  })

  // Option 2: Serve static landing page from R2
  // const object = await env.WEBSITES.get('_main/index.html')
  // if (object) {
  //   return new Response(object.body, {
  //     headers: { 'Content-Type': 'text/html' }
  //   })
  // }
}

/**
 * Serve user website from R2
 */
async function serveUserWebsite(subdomain, url, env) {
  try {
    // Build the file path
    let path = url.pathname === '/' ? '/index.html' : url.pathname

    // Remove leading slash for R2 key
    const key = `${subdomain}${path}`.replace(/^\//, '')

    console.log(`Fetching: ${key}`)

    // Try to get the file from R2
    let object = await env.WEBSITES.get(key)

    // If not found and no extension, try adding .html
    if (!object && !path.includes('.')) {
      const htmlPath = `${subdomain}${path}.html`.replace(/^\//, '')
      object = await env.WEBSITES.get(htmlPath)
    }

    // If still not found, try index.html for SPA routing
    if (!object && path !== '/index.html') {
      const indexPath = `${subdomain}/index.html`
      object = await env.WEBSITES.get(indexPath)
    }

    // Website not found
    if (!object) {
      return new Response(
        renderErrorPage(subdomain, '404 - Website Not Found'),
        {
          status: 404,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache',
          },
        }
      )
    }

    // Determine content type
    const contentType = getContentType(key)

    // Determine cache duration based on file type
    const cacheControl = getCacheControl(key)

    // Return the file
    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'X-Served-By': 'Cloudflare-R2',
        'X-Subdomain': subdomain,
      },
    })

  } catch (error) {
    console.error('Error serving website:', error)
    return new Response(
      renderErrorPage(subdomain, '500 - Internal Server Error'),
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
      }
    )
  }
}

/**
 * Get content type from file extension
 */
function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase()

  const types = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'js': 'application/javascript; charset=utf-8',
    'json': 'application/json; charset=utf-8',
    'xml': 'application/xml; charset=utf-8',
    'txt': 'text/plain; charset=utf-8',

    // Images
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',

    // Fonts
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject',

    // Other
    'pdf': 'application/pdf',
    'zip': 'application/zip',
  }

  return types[ext] || 'application/octet-stream'
}

/**
 * Get cache control header based on file type
 */
function getCacheControl(path) {
  const ext = path.split('.').pop().toLowerCase()

  // Long cache for static assets
  if (['css', 'js', 'woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
    return 'public, max-age=31536000, immutable' // 1 year
  }

  // Medium cache for images
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
    return 'public, max-age=604800' // 1 week
  }

  // Short cache for HTML
  if (ext === 'html') {
    return 'public, max-age=3600' // 1 hour
  }

  // Default
  return 'public, max-age=86400' // 24 hours
}

/**
 * Render error page
 */
function renderErrorPage(subdomain, error) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${error}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 600px;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    .subdomain {
      font-family: monospace;
      background: rgba(255,255,255,0.2);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 2rem;
    }
    a {
      color: white;
      text-decoration: none;
      background: rgba(255,255,255,0.2);
      padding: 1rem 2rem;
      border-radius: 8px;
      display: inline-block;
      transition: all 0.3s ease;
    }
    a:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${error}</h1>
    <p>The website you're looking for isn't available yet.</p>
    <div class="subdomain">${subdomain}.webese.ai</div>
    <p>This might mean:</p>
    <ul style="text-align: left; display: inline-block; margin-bottom: 2rem;">
      <li style="margin-bottom: 0.5rem;">• The website hasn't been published yet</li>
      <li style="margin-bottom: 0.5rem;">• The subdomain doesn't exist</li>
      <li style="margin-bottom: 0.5rem;">• The website was recently deleted</li>
    </ul>
    <br>
    <a href="https://webese.ai">← Back to Webese AI</a>
  </div>
</body>
</html>
  `.trim()
}
