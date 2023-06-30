import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const tables = await knex('meals').select('*')
    return tables
  })

  app.get('/:id', async (request) => {
    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = requestParamsSchema.parse(request.params)

    const meal = await knex('meals').select('*').where('id', id)

    return meal
  })

  app.put('/:id', async (request) => {
    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const requestBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      diet: z.boolean(),
    })

    const { id } = requestParamsSchema.parse(request.params)

    const { name, description, date, diet } = requestBodySchema.parse(
      request.body,
    )

    const meal = await knex('meals')
      .where('id', id)
      .update({
        name,
        description,
        date: new Date(date).toISOString(),
        diet,
      })

    return meal
  })

  app.delete('/:id', async (request, reply) => {
    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = requestParamsSchema.parse(request.params)

    const meal = await knex('meals').where('id', id).del()

    if (!meal) {
      return reply.status(404).send('404 Id not found')
    }

    return reply.status(201).send()
  })

  app.post('/', async (request, reply) => {
    const requestBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      diet: z.boolean(),
    })

    const { name, description, diet } = requestBodySchema.parse(request.body)

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      diet,
    })

    return reply.status(201).send()
  })
}
