export function getURLQueryParams() {
  return new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as string),
  }) as any; // quick fix to be able to use type safety here
}
