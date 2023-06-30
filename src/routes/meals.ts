import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const tables = await knex('meals').select('*')
    return tables
  })

  app.post('/', async (request, reply) => {
    const requestBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      diet: z.boolean(),
    })

    const { name, description, diet } = requestBodySchema.parse(request.body)

    await knex('meals').insert({
      name,
      description,
      diet,
    })

    return reply.status(201).send()
  })
}
