export const exerciseCategories = [
  {
    category: "Supported",
    items: [
      "Squat",
      "Push Up",
      "Plank",
      "Leg Raises",
      "Deadlift",
      "Bicep Curl",
    ],
  },
];

export const allExercises = exerciseCategories.flatMap(
  (category) => category.items
);