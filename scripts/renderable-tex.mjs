export function renderableTextFromHtml(html) {
  return String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/giu, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/giu, ' ')
    .replace(/<!--[\s\S]*?-->/gu, ' ')
    .replace(/<[^>]+>/gu, ' ');
}

export function hasRenderableTex(html) {
  return /\\\(|\$\$/u.test(renderableTextFromHtml(html));
}
