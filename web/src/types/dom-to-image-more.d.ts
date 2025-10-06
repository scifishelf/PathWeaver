declare module 'dom-to-image-more' {
  const api: {
    toPng(node: HTMLElement, options?: any): Promise<string>
    toSvg(node: HTMLElement, options?: any): Promise<string>
  }
  export default api
}


