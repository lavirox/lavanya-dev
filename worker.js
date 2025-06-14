export default {
    async fetch(request) {
      const url = new URL(request.url);
      const path = url.pathname;
      
      const GITHUB_USER = "lavirox";
      const GITHUB_REPO = "lavanya-dev";
      const GITHUB_BRANCH = "main";
      
      try {
        let filePath;
        
        if (path === '/' || path === '') {
          filePath = 'index.html';
        } else if (path.startsWith('/')) {
          filePath = path.substring(1);
        } else {
          filePath = path;
        }
        
        const githubUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
          return new Response('File not found', { status: 404 });
        }
        
        const content = await response.text();
        
        const contentType = getContentType(filePath);
        
        return new Response(content, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=300'
          }
        });
        
      } catch (error) {
        return new Response('Error loading file: ' + error.message, { status: 500 });
      }
    }
  };
  
  function getContentType(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    
    const contentTypes = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'txt': 'text/plain'
    };
    
    return contentTypes[extension] || 'text/plain';
  }