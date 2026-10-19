/** Unit tests replace this generated build entry with a mock. Never used by the app. */
const worker = {
  fetch: async () => new Response('Unmocked OpenNext test entry', { status: 500 }),
}

export default worker
