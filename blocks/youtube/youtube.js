/**
 * Extract video ID from various YouTube URL formats
 * @param {string} url - The YouTube URL
 * @returns {string} The video ID or empty string if not found
 */
function getVideoId(url) {
  if (!url) return '';
  
  let videoId = '';
  
  // Extract video ID from various YouTube URL formats
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(new URL(url).search);
    videoId = urlParams.get('v');
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0].split('/')[0];
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1].split('?')[0].split('/')[0];
  }
  
  return videoId;
}

/**
 * Decorate the YouTube block
 * @param {Element} block - The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  
  // Extract video URL from the first row
  const videoLink = rows[0]?.querySelector('a');
  if (!videoLink) {
    block.textContent = 'No video URL provided';
    return;
  }

  const url = videoLink.href;
  const videoId = getVideoId(url);

  if (!videoId) {
    block.textContent = 'Invalid YouTube URL';
    return;
  }

  // Build embed parameters from additional rows
  const params = new URLSearchParams();
  
  // Process additional rows for parameters
  rows.slice(1).forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const paramName = cells[0].textContent.trim().toLowerCase();
      const paramValue = cells[1].textContent.trim();
      
      // Map common parameter names
      const paramMap = {
        'autoplay': 'autoplay',
        'controls': 'controls',
        'loop': 'loop',
        'mute': 'mute',
        'start': 'start',
        'end': 'end',
        'playlist': 'playlist',
        'modestbranding': 'modestbranding',
        'rel': 'rel',
        'cc_load_policy': 'cc_load_policy',
        'hl': 'hl',
        'cc_lang_pref': 'cc_lang_pref',
      };
      
      if (paramMap[paramName] && paramValue) {
        params.set(paramMap[paramName], paramValue);
      }
    }
  });

  // If loop is enabled, add playlist parameter (required for loop to work)
  if (params.get('loop') === '1') {
    params.set('playlist', videoId);
  }

  // Create iframe
  const embedUrl = `https://www.youtube.com/embed/${videoId}${params.toString() ? `?${params.toString()}` : ''}`;
  
  block.innerHTML = `
    <div class="youtube-wrapper">
      <iframe
        src="${embedUrl}"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen>
      </iframe>
    </div>
  `;
}
