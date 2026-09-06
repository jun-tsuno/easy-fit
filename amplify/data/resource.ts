import { a, type ClientSchema, defineData } from '@aws-amplify/backend'

const schema = a.schema({
  Exercise: a
    .model({
      name: a.string().required(),
      category: a.string(),
      workoutSets: a.hasMany('WorkoutSet', 'exerciseId'),
    })
    .authorization((allow) => [allow.owner()]),

  WorkoutSet: a
    .model({
      date: a.date().required(),
      exerciseId: a.id().required(),
      exercise: a.belongsTo('Exercise', 'exerciseId'),
      weight: a.float().required(),
      reps: a.integer().required(),
      setNumber: a.integer().required(),
    })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('owner').sortKeys(['date']),
      index('exerciseId').sortKeys(['date']),
    ]),

  BodyWeight: a
    .model({
      date: a.date().required(),
      weight: a.float().required(),
    })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [index('owner').sortKeys(['date'])]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
