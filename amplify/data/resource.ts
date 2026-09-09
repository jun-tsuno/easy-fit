import { a, type ClientSchema, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Exercise: a
    .model({
      name: a.string().required(),
      category: a.string().required(),
      workoutSets: a.hasMany("WorkoutSet", "exerciseId"),
      owner: a.string(),
    })
    .authorization((allow) => [allow.owner().identityClaim("sub")]),

  WorkoutSet: a
    .model({
      date: a.date().required(),
      exerciseId: a.id().required(),
      exercise: a.belongsTo("Exercise", "exerciseId"),
      weight: a.float().required(),
      reps: a.integer().required(),
      setNumber: a.integer().required(),
      owner: a.string(),
    })
    .authorization((allow) => [allow.owner().identityClaim("sub")])
    .secondaryIndexes((index) => [
      index("owner").sortKeys(["date"]).queryField("listWorkoutSetsByDate"),
      index("exerciseId")
        .sortKeys(["date"])
        .queryField("listWorkoutSetsByExerciseDate"),
    ]),

  BodyWeight: a
    .model({
      date: a.date().required(),
      weight: a.float().required(),
      owner: a.string(),
    })
    .authorization((allow) => [allow.owner().identityClaim("sub")])
    .secondaryIndexes((index) => [
      index("owner").sortKeys(["date"]).queryField("listBodyWeightsByDate"),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
