import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userId = randomUUID()

    reply.setCookie('userId', userId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    })
  })
}
