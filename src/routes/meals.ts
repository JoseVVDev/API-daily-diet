import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'

type CustomRequest = FastifyRequest<{
  Body: {
    name: string
    description: string
    diet: boolean
  }
}>

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const tables = await knex('meals').select('*')
    return tables
  })

  app.post('/', async (request: CustomRequest, reply) => {
    const { name, description, diet } = request.body
    await knex('meals').insert({
      name,
      description,
      diet,
    })

    return reply.status(201).send()
  })
}
