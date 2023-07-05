import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkIfUserExists } from '../middlewares/checkIfUserExists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: checkIfUserExists,
    },
    async (request, reply) => {
      const userId = request.cookies.userId
      const tables = await knex('meals').select('*').where('userId', userId)
      return tables
    },
  )

  app.get(
    '/:id',
    {
      preHandler: checkIfUserExists,
    },
    async (request) => {
      const requestParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = requestParamsSchema.parse(request.params)
      const userId = request.cookies.userId

      const meal = await knex('meals')
        .select('*')
        .where('userId', userId)
        .where('id', id)

      return meal
    },
  )

  app.put(
    '/:id',
    {
      preHandler: checkIfUserExists,
    },
    async (request) => {
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

      const userId = request.cookies.userId

      const meal = await knex('meals')
        .where('userId', userId)
        .where('id', id)
        .update({
          name,
          description,
          date: new Date(date).toISOString(),
          diet,
        })

      return meal
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: checkIfUserExists,
    },
    async (request, reply) => {
      const requestParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = requestParamsSchema.parse(request.params)
      const userId = request.cookies.userId

      const meal = await knex('meals')
        .where('userId', userId)
        .where('id', id)
        .del()

      if (!meal) {
        return reply.status(404).send('404 Id not found')
      }

      return reply.status(200).send()
    },
  )

  app.post(
    '/',
    {
      preHandler: checkIfUserExists,
    },
    async (request, reply) => {
      const requestBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        diet: z.boolean(),
      })

      const { name, description, diet } = requestBodySchema.parse(request.body)

      const userId = request.cookies.userId

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        diet,
        userId,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/summary',
    {
      preHandler: checkIfUserExists,
    },
    async (request, reply) => {
      const userId = request.cookies.userId
      const mealsCount = await knex('meals')
        .where('userId', userId)
        .count('id', { as: 'meals' })
      return { mealsCount }
    },
  )

  app.get(
    '/summaryOnDiet',
    {
      preHandler: checkIfUserExists,
    },
    async (request, reply) => {
      const userId = request.cookies.userId
      const mealsCount = await knex('meals')
        .where('userId', userId)
        .where('diet', 1)
        .count('id', { as: 'meals' })
      return { mealsCount }
    },
  )

  app.get(
    '/summaryOutsideDiet',
    {
      preHandler: checkIfUserExists,
    },
    async (request, reply) => {
      const userId = request.cookies.userId
      const mealsCount = await knex('meals')
        .where('userId', userId)
        .where('diet', 0)
        .count('id', { as: 'meals' })
      return { mealsCount }
    },
  )

  app.get(
    '/bestStreak',
    {
      preHandler: checkIfUserExists,
    },
    async (request, reply) => {
      const userId = request.cookies.userId
      const meals = await knex('meals').where('userId', userId).select('diet')
      let streak = 0
      let acc = 0

      meals.map((meal) => {
        if (meal.diet) {
          acc++

          if (acc > streak) {
            streak = acc
          }
        } else {
          acc = 0
        }

        return streak
      })

      return { bestStreak: streak }
    },
  )
}
